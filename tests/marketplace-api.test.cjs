const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.join(__dirname, "..");
function compile(filename, context = {}) {
    const exports = {};
    vm.runInNewContext(ts.transpileModule(readFileSync(path.join(root, filename), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText, { exports, URL, ...context });
    return exports;
}

test("marketplace APIs derive tenancy from authentication, not a query parameter", () => {
    const { usesTenantQuery } = compile("lib/apiBaseUrl.ts");
    for (const endpoint of ["marketplace/platform/enquiries?formType=demo&page=1", "marketplace/platform/facilities?status=pending", "/marketplace/platform/facilities/8/approve", "marketplace/core/facilities/lab/catalog"]) {
        assert.equal(usesTenantQuery(endpoint), false);
    }
    for (const endpoint of ["platform/facilities", "settings/companyprofile", "marketplace-other"]) {
        assert.equal(usesTenantQuery(endpoint), true);
    }
});

test("website enquiries preserve demo details and validate the paginated response", () => {
    const { websiteEnquiriesSchema } = compile("app/settings/facilities/enquirySchemas.ts", {
        require: name => {
            if (name === "zod") return require("zod");
            throw new Error(name);
        },
    });
    const enquiry = {
        id: 7, formType: "demo", fullName: "Taylor Example", workEmail: "taylor@example.test",
        phone: "12345678", organization: "Example Laboratory", country: "Ghana",
        facilityType: "Independent", facilitiesCount: "1", interests: ["Laboratory management"],
        subject: "", message: "Please demonstrate the laboratory workflow.", status: "new",
        submittedAt: "2026-10-10T06:00:00.000Z", receivedAt: "2026-10-10T06:00:01.000Z",
    };
    const parsed = websiteEnquiriesSchema.parse({ enquiries: [enquiry], page: 1, hasMore: false });
    assert.deepEqual(JSON.parse(JSON.stringify(parsed.enquiries[0])), enquiry);
    assert.equal(websiteEnquiriesSchema.safeParse({ enquiries: [], page: 1, hasMore: false }).success, true);
    assert.equal(websiteEnquiriesSchema.safeParse({ enquiries: [{ ...enquiry, formType: "registration" }], page: 1, hasMore: false }).success, false);
    assert.equal(websiteEnquiriesSchema.safeParse({ enquiries: [enquiry], page: 1 }).success, false);
    const page = readFileSync(path.join(root, "app/settings/facilities/applications/page.tsx"), "utf8");
    const component = readFileSync(path.join(root, "app/settings/facilities/WebsiteEnquiries.tsx"), "utf8");
    assert.ok(page.indexOf("if (!isSuperAdmin) return") < page.indexOf("<WebsiteEnquiries />"));
    assert.match(component, /marketplace\/platform\/enquiries\?formType=/);
    assert.match(component, /Demo requests &amp; contact enquiries/);
    assert.match(component, /setPage\(1\)/);
    assert.match(component, /selected\.message/);
    assert.doesNotMatch(component, /dangerouslySetInnerHTML/);
});

test("marketplace reads and writes use the server boundary without exposing credentials",async()=>{
    const requests=[];
    const helpers=compile('components/Auth/customFetch.js',{
        require(name){
            if(name==='../serverActions/backendRequest')return {requestBackendJson:async(endpoint,method,body)=>{requests.push({endpoint,method,body});return {status:'success',result:[]};}};
            if(name==='../serverActions/requestHeaders')return {getRequestContext:async()=>({authenticated:true,tenantId:123456})};
            if(name==='../../lib/apiBaseUrl')return {buildApiUrl:endpoint=>'http://localhost/api/v1/'+endpoint,usesTenantQuery:()=>true};
            if(['js-cookie','moment'].includes(name))return {};
            if(name==='react-toastify')return {toast:{}};
            throw Error(name);
        }
    });
    await helpers.customFetch('marketplace/platform/facilities?status=pending');
    await helpers.customFetchMutation('marketplace/platform/facilities/8/approve','POST',{});
    assert.equal(requests[0].endpoint,'marketplace/platform/facilities?status=pending');
    assert.equal(requests[0].method,'GET');
    assert.equal(requests[1].method,'POST');
    assert.equal(JSON.stringify(requests).includes('PLS_SESSION'),false);
});

test("application provisioning copies public details but never copies a password or guesses location IDs", () => {
    const { applicationProvisioningForm, marketplaceApplicationsSchema } = compile("app/settings/facilities/marketplaceApplications.ts", {
        require: name => {
            if (name === "zod") return require("zod");
            throw new Error(name);
        },
    });
    const application = {
        id: 8, slug: "sample-lab", name: "Sample Lab", region: "Northern", locality: "Tamale",
        address: "Public address", phone: "0595964565", contact_email: "office@example.test",
        admin_email: "owner@example.test", description: "Laboratory services", currency: "GHS",
        status: "approved", integration_state: "independent", linked_tenant_id: null,
        created_at: "2026-10-10T06:00:00.000Z", password_hash: "must-not-be-retained",
    };
    const parsed = marketplaceApplicationsSchema.parse({ facilities: [application] })[0];
    assert.equal("password_hash" in parsed, false);
    const form = applicationProvisioningForm(parsed, {
        companyName: "", email: "", phone: "", address: "", adminName: "Previous administrator",
        adminEmail: "", adminPassword: "Previous-password", countryId: "1", stateId: "2",
        districtId: "3", licenseDays: "365",
    });
    assert.equal(form.companyName, application.name);
    assert.equal(form.adminEmail, application.admin_email);
    assert.equal(form.adminPassword, "");
    assert.equal(form.adminName, "");
    for (const field of ["countryId", "stateId", "districtId"]) assert.equal(form[field], "");
});

test("application management is navigable and provisioning requires explicit identity confirmation", () => {
    const nav = readFileSync(path.join(root, "app/settings/facilities/FacilityNav.tsx"), "utf8");
    const applications = readFileSync(path.join(root, "app/settings/facilities/applications/page.tsx"), "utf8");
    const provisioning = readFileSync(path.join(root, "app/settings/facilities/page.tsx"), "utf8");
    assert.match(nav, /\/settings\/facilities\/applications/);
    assert.match(applications, /marketplace\/platform\/facilities\?status=/);
    assert.match(applications, /Approve application/);
    assert.match(applications, /Review and provision PLS facility/);
    assert.match(provisioning, /!identityConfirmed/);
    assert.match(provisioning, /marketplace\/platform\/facilities\/\$\{provisioningApplication\.id\}\/provision/);
    assert.match(provisioning, /applicationProvisioningForm\(source, EMPTY_FORM\)/);
});

test("application status responses tolerate in-progress provisioning without losing the review list", () => {
    const { marketplaceApplicationsSchema } = compile("app/settings/facilities/marketplaceApplications.ts", {
        require: name => {
            if (name === "zod") return require("zod");
            throw new Error(name);
        },
    });
    for (const integration_state of ["provisioning", "provision_failed"]) {
        const parsed = marketplaceApplicationsSchema.safeParse({ facilities: [{
            id: 1, slug: "lab", name: "Lab", region: "Region", locality: "Town", address: "Address",
            phone: "12345678", contact_email: "public@example.test", description: "",
            currency: "GHS", status: "approved", integration_state, linked_tenant_id: null,
            created_at: "2026-10-10T06:00:00.000Z",
        }] });
        assert.equal(parsed.success, true);
    }
    assert.equal(marketplaceApplicationsSchema.safeParse([]).success, false);
});

test("facility management exposes explicit publication controls without sending a body tenant ID", () => {
    const management = readFileSync(path.join(root, "app/settings/facilities/FacilityManagement.tsx"), "utf8");
    const publication = readFileSync(path.join(root, "app/settings/facilities/FacilityPublication.tsx"), "utf8");
    assert.match(management, /<FacilityPublication key=\{facility\.tenantId\} facility=\{facility\}/);
    assert.match(publication, /platform\/facilities\/\$\{facility\.tenantId\}\/public-profile/);
    assert.match(publication, /customFetchMutation\(endpoint, "PUT"/);
    assert.match(publication, /Publish this facility in the website directory/);
    assert.match(publication, /Publish live PLS tests, panels and prices/);
    assert.doesNotMatch(publication, /tenantId:\s*facility\.tenantId/);
});
