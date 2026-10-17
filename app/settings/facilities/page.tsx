"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import type { ElementType } from "react";
import { RiBuildingLine, RiCheckboxCircleLine, RiErrorWarningLine, RiTimeLine } from "@remixicon/react";
import Link from "next/link";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";
import { customFetch, customFetchMutation } from "../../../components/Auth/customFetch";
import { useApplication } from "../../../components/Auth/useApplicationContext";
import FacilityManagement from "./FacilityManagement";
import FacilityNav from "./FacilityNav";
import { applyModuleCatalogPrices, FacilityForm, FormErrors, generateFacilityPassword, parseModulePricingCatalogEntry, validateFacilityForm, MODULE_LABELS, ModuleName, ModulePricingCatalogEntry, defaultModuleConfiguration, moduleMonthlyTotal } from "./provisioningForm";
import { applicationProvisioningForm, MarketplaceApplication, marketplaceApplicationsSchema } from "./marketplaceApplications";

interface Country { id: number; country_name: string }
interface State { id: number; country_id: number; state_name: string }
interface District { id: number; state_id: number; district_name: string }
interface LocationOptions { countries: Country[]; states: State[]; districts: District[] }
interface Facility {
     tenantId: number; platformId: string; name: string; email: string | null; phone: string | null;
     countryId: number | null; stateId: number | null; districtId: number | null;
     databaseName: string; status: string; isControlTenant?: boolean;
}
interface ProvisionedFacility { organizationIdentifier: string; tenantId: number; databaseName: string; adminUsername: string }

const FacilitySummaryCard = ({
     title,
     value,
     subtitle,
     Icon,
     variant,
     selected,
     disabled,
     onClick,
}: {
     title: string;
     value: number | null;
     subtitle: string;
     Icon: ElementType;
     variant: string;
     selected: boolean;
     disabled: boolean;
     onClick: () => void;
}) => (
     <button
          type="button"
          className={`card border-0 ${selected ? "shadow-lg" : "shadow-sm"} bg-${variant} bg-gradient text-white text-start rounded-3 h-100 w-100`}
          aria-pressed={selected}
          disabled={disabled}
          onClick={onClick}
     >
          <span className="card-body d-block p-3">
               <span className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-xs text-uppercase fw-semibold opacity-75">{title}</span>
                    <Icon size={22} className="opacity-75" />
               </span>
               <span className="h3 d-block fw-bold mb-0">{value === null ? "—" : value.toLocaleString()}</span>
               <span className="text-xs opacity-75">{subtitle}</span>
          </span>
     </button>
);

const EMPTY_FORM: FacilityForm = {
     companyName: "",
     email: "",
     phone: "",
     address: "",
     countryId: "",
     stateId: "",
     districtId: "",
     adminName: "",
     adminEmail: "",
     adminPassword: "",
     licenseDays: "365",
     street: "", gpsAddress: "", moduleConfiguration: defaultModuleConfiguration(),
};

const errorMessage = (error: unknown) => error instanceof Error ? error.message : "Facility onboarding failed. Please try again.";
const normalizeRole = (role: unknown) => String(role || "").toLowerCase().replace(/[\s_-]/g, "");
export default function FacilityOnboardingPage() {
     const application = useApplication();
     const isSuperAdmin = normalizeRole(application?.user?.role) === "superadmin";
     const [form, setForm] = useState<FacilityForm>(EMPTY_FORM);
     const [options, setOptions] = useState<LocationOptions>({ countries: [], states: [], districts: [] });
     const [facilities, setFacilities] = useState<Facility[]>([]);
     const [pricingCatalog, setPricingCatalog] = useState<ModulePricingCatalogEntry[]>([]);
     const [pricingError, setPricingError] = useState("");
     const [loading, setLoading] = useState(true);
     const [hasLoadedFacilities, setHasLoadedFacilities] = useState(false);
     const [busy, setBusy] = useState(false);
     const [error, setError] = useState("");
     const [created, setCreated] = useState<ProvisionedFacility | null>(null);
     const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
     const [facilityQuery, setFacilityQuery] = useState("");
     const [provisionOpen, setProvisionOpen] = useState(false);
     const [provisioningApplication, setProvisioningApplication] = useState<MarketplaceApplication | null>(null);
     const [identityConfirmed, setIdentityConfirmed] = useState(false);
     const [statusFilter, setStatusFilter] = useState("all");
     const [showControlTenant, setShowControlTenant] = useState(false);
     const [showPassword, setShowPassword] = useState(false);
     const [formErrors, setFormErrors] = useState<FormErrors>({});
     const [copiedKey, setCopiedKey] = useState("");
     const [deleteFacility, setDeleteFacility] = useState<Facility | null>(null);
     const [deleteConfirmation, setDeleteConfirmation] = useState("");
     const [deleteReason, setDeleteReason] = useState("");
     const [deleteBusy, setDeleteBusy] = useState(false);
     const [deleteError, setDeleteError] = useState("");
     const [deletedMessage, setDeletedMessage] = useState("");
     const [retryFacility, setRetryFacility] = useState<Facility | null>(null);
     const managementRef = useRef<HTMLDivElement>(null);
     const provisionRef = useRef<HTMLFormElement>(null);

     useEffect(() => {
          if (selectedTenantId !== null) managementRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
     }, [selectedTenantId]);
     useEffect(() => {
          if (provisionOpen) provisionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
     }, [provisionOpen]);
     useEffect(() => {
          if (!copiedKey) return;
          const timer = window.setTimeout(() => setCopiedKey(""), 1800);
          return () => window.clearTimeout(timer);
     }, [copiedKey]);

     const copy = async (key: string, value: string | number) => {
          try {
               await navigator.clipboard.writeText(String(value));
               setCopiedKey(key);
          } catch {
               setError("Copying is unavailable. Select the text and copy it manually.");
          }
     };
     const fieldProps = (field: keyof FacilityForm) => ({
          "aria-invalid": Boolean(formErrors[field]),
          "aria-describedby": formErrors[field] ? `${field}-error` : undefined,
          onBlur: () => setFormErrors((current) => ({ ...current, [field]: validateFacilityForm(form)[field] })),
     });
     const fieldError = (field: keyof FacilityForm) => formErrors[field]
          ? <div id={`${field}-error`} className="invalid-feedback d-block" role="alert">{formErrors[field]}</div> : null;

     const load = useCallback(async () => {
          setLoading(true);
          setError("");
          try {
               const applicationId = new URL(window.location.href).searchParams.get("application");
               if (applicationId !== null && !/^[1-9]\d*$/.test(applicationId)) throw new Error("Invalid website application.");
               const [locations, organizations, applications, pricing] = await Promise.all([
                    customFetch("platform/facilities/options"),
                    customFetch("platform/facilities"),
                    applicationId ? customFetch("marketplace/platform/facilities?status=approved") : Promise.resolve(null),
                    customFetch("platform/facilities/module-pricing?all=true"),
               ]);
               if (locations?.status !== "success" || !locations.result ||
                    !Array.isArray(locations.result.countries) || !Array.isArray(locations.result.states) ||
                    !Array.isArray(locations.result.districts)) {
                    throw new Error(locations?.message || locations?.error || "Unable to load facility location options.");
               }
               if (organizations?.status !== "success" || !Array.isArray(organizations.result)) {
                    throw new Error(organizations?.message || organizations?.error || "Unable to load facilities.");
               }
               setOptions(locations.result);
               setFacilities(organizations.result);
               setHasLoadedFacilities(true);
               const parsedCatalog = pricing?.status === "success" && Array.isArray(pricing.result)
                    ? pricing.result.map(parseModulePricingCatalogEntry)
                    : [];
               const catalog = parsedCatalog.every((entry): entry is ModulePricingCatalogEntry => entry !== null)
                    ? parsedCatalog
                    : [];
               if (catalog.length) {
                    const initialPricing = catalog.find(entry => entry.currency === "GHS") || catalog[0];
                    setPricingCatalog(catalog);
                    setPricingError("");
                    setForm(current => ({
                         ...current,
                         moduleConfiguration: applyModuleCatalogPrices(
                              current.moduleConfiguration || defaultModuleConfiguration(), initialPricing),
                    }));
               } else {
                    setPricingCatalog([]);
                    setPricingError(pricing?.message || pricing?.error || "Unable to load universal module prices. Configure a price catalog before provisioning.");
               }
               if (applicationId) {
                    if (applications?.status !== "success") throw new Error(applications?.message || applications?.error || "Unable to load the approved website application.");
                    const parsed = marketplaceApplicationsSchema.safeParse(applications.result);
                    if (!parsed.success) throw new Error("The server returned invalid application data.");
                    const source = parsed.data.find(item => item.id === Number(applicationId) &&
                         ["independent", "provision_failed"].includes(item.integration_state));
                    if (!source) throw new Error("The application must be approved and available for provisioning.");
                    setProvisioningApplication(source);
                    const sourceForm = applicationProvisioningForm(source, EMPTY_FORM);
                    const applicationPricing = catalog.find(entry => entry.currency === source.currency.toUpperCase());
                    if (applicationPricing && sourceForm.moduleConfiguration) {
                         sourceForm.moduleConfiguration = applyModuleCatalogPrices(sourceForm.moduleConfiguration, applicationPricing);
                    } else if (sourceForm.moduleConfiguration) {
                         setPricingError(`Configure universal prices for the approved application's ${source.currency.toUpperCase()} currency before provisioning or retrying.`);
                    }
                    if (source.integration_state === "provision_failed") {
                         const failed = organizations.result.find((facility: Facility) =>
                              facility.status.toLowerCase() === "failed" &&
                              (facility.tenantId === source.linked_tenant_id ||
                                   (facility.email === source.contact_email && facility.name === source.name)));
                         if (failed) {
                              setRetryFacility(failed);
                              setForm({
                                   ...sourceForm,
                                   countryId: failed.countryId ? String(failed.countryId) : "",
                                   stateId: failed.stateId ? String(failed.stateId) : "",
                                   districtId: failed.districtId ? String(failed.districtId) : "",
                              });
                         } else {
                              setRetryFacility(null);
                              setForm(sourceForm);
                         }
                    } else {
                         setRetryFacility(null);
                         setForm(sourceForm);
                    }
                    setIdentityConfirmed(false);
                    setProvisionOpen(true);
               }
          } catch (failure) {
               setError(errorMessage(failure));
               setHasLoadedFacilities(false);
          } finally {
               setLoading(false);
          }
     }, []);

     useEffect(() => {
          if (isSuperAdmin) void load();
          else setLoading(false);
     }, [isSuperAdmin, load]);

     const confirmDelete = async (event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          if (!deleteFacility || deleteBusy || busy) return;
          setDeleteBusy(true);
          setDeleteError("");
          try {
               const result = await customFetchMutation(`platform/facilities/${deleteFacility.tenantId}`, "DELETE", {
                    confirmation: deleteConfirmation, reason: deleteReason.trim(),
               });
               if (result?.status !== "success" || result.result?.deleted !== true ||
                    typeof result.result.databasePreserved !== "boolean") {
                    throw new Error(result?.message || result?.error || "Unable to delete the tenant.");
               }
               setFacilities((current) => current.filter((facility) => facility.tenantId !== deleteFacility.tenantId));
               if (selectedTenantId === deleteFacility.tenantId) setSelectedTenantId(null);
               if (created?.tenantId === deleteFacility.tenantId) setCreated(null);
               if (retryFacility?.tenantId === deleteFacility.tenantId) {
                    setRetryFacility(null);
                    setForm((current) => ({ ...current, adminPassword: "" }));
                    setShowPassword(false);
               }
               if (provisioningApplication?.linked_tenant_id === deleteFacility.tenantId) {
                    setProvisioningApplication((current) => current ? { ...current, linked_tenant_id: null } : null);
               }
               setDeletedMessage(`${deleteFacility.platformId} was removed from the registry. ${result.result.databasePreserved
                    ? "Its database was preserved."
                    : "Its partial database was permanently deleted. You can provision the facility again using the same company email."}`);
               setDeleteFacility(null);
          } catch (failure) {
               setDeleteError(errorMessage(failure));
          } finally {
               setDeleteBusy(false);
          }
     };

     const update = (field: keyof FacilityForm, value: string) => {
          setFormErrors((current) => ({ ...current, [field]: undefined,
               ...(field === "countryId" ? { stateId: undefined, districtId: undefined } : {}),
               ...(field === "stateId" ? { districtId: undefined } : {}),
          }));
          setForm((current) => ({
               ...current, [field]: value,
               ...(field === "countryId" ? { stateId: "", districtId: "" } : {}),
               ...(field === "stateId" ? { districtId: "" } : {}),
          }));
     };

     const selectFacilityCurrency = (currency: string) => {
          const selected = pricingCatalog.find(entry => entry.currency === currency);
          if (!selected) return;
          setForm(current => ({
               ...current,
               moduleConfiguration: applyModuleCatalogPrices(
                    current.moduleConfiguration || defaultModuleConfiguration(), selected),
          }));
          setFormErrors(current => ({ ...current, moduleConfiguration: undefined }));
     };

     const blankFacilityForm = (): FacilityForm => {
          const pricing = pricingCatalog.find(entry => entry.currency === "GHS") || pricingCatalog[0];
          return {
               ...EMPTY_FORM,
               moduleConfiguration: pricing
                    ? applyModuleCatalogPrices(defaultModuleConfiguration(), pricing)
                    : defaultModuleConfiguration(),
          };
     };

     const openRetry = (facility: Facility) => {
          setRetryFacility(facility);
          setProvisioningApplication(null);
          setIdentityConfirmed(false);
          setCreated(null);
          setError("");
          setFormErrors({});
          setShowPassword(false);
          setForm({
               ...blankFacilityForm(),
               companyName: facility.name,
               email: facility.email || "",
               phone: facility.phone || "",
               countryId: facility.countryId ? String(facility.countryId) : "",
               stateId: facility.stateId ? String(facility.stateId) : "",
               districtId: facility.districtId ? String(facility.districtId) : "",
          });
          setProvisionOpen(true);
     };

     const submit = async (event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          if (busy || deleteBusy) return;
          setError("");
          setCreated(null);
          if (provisioningApplication?.integration_state === "independent" && !identityConfirmed) {
               setError("Confirm the application belongs to the facility you are provisioning.");
               return;
          }
          const selectedPricing = pricingCatalog.find(entry => entry.currency === form.moduleConfiguration?.currency);
          if (!selectedPricing) {
               setError("Choose a currency with configured universal module prices before provisioning.");
               return;
          }
          const submissionForm = {
               ...form,
               moduleConfiguration: form.moduleConfiguration
                    ? applyModuleCatalogPrices(form.moduleConfiguration, selectedPricing)
                    : undefined,
          };
          const errors = validateFacilityForm(submissionForm);
          setFormErrors(errors);
          const firstInvalid = (Object.keys(form) as (keyof FacilityForm)[]).find((field) => errors[field]);
          if (firstInvalid) {
               setError("Review the highlighted fields before provisioning.");
               document.getElementById(firstInvalid)?.focus();
               return;
          }
          const licenseDays = Number(form.licenseDays);
          setBusy(true);
          try {
               const endpoint = retryFacility && provisioningApplication
                    ? `marketplace/platform/facilities/${provisioningApplication.id}/retry-provisioning`
                    : retryFacility
                    ? `platform/facilities/${retryFacility.tenantId}/retry`
                    : provisioningApplication?.integration_state === "provision_failed"
                    ? `marketplace/platform/facilities/${provisioningApplication.id}/retry-provisioning`
                    : provisioningApplication ? `marketplace/platform/facilities/${provisioningApplication.id}/provision` : "platform/facilities";
               const response = await customFetchMutation(endpoint, "POST", {
                    companyName: submissionForm.companyName.trim(), email: submissionForm.email.trim(), phone: submissionForm.phone.trim(),
                    address: submissionForm.address.trim(), countryId: Number(submissionForm.countryId), stateId: Number(submissionForm.stateId),
                    districtId: Number(submissionForm.districtId), adminName: submissionForm.adminName.trim(),
                    adminEmail: submissionForm.adminEmail.trim(), adminPassword: submissionForm.adminPassword, licenseDays,
                    street: submissionForm.street?.trim(), gpsAddress: submissionForm.gpsAddress?.trim(), moduleConfiguration: submissionForm.moduleConfiguration,
                    ...(provisioningApplication?.integration_state === "independent" ? { identityConfirmed: true } : {}),
               });
               if (response?.status !== "success" || !response.result?.organizationIdentifier ||
                    !response.result?.adminUsername || !response.result?.databaseName ||
                    !Number.isSafeInteger(response.result.tenantId)) {
                    throw new Error(response?.message || response?.error || "The server did not confirm facility provisioning.");
               }
               setCreated(response.result);
               setForm(blankFacilityForm());
               setShowPassword(false);
               setFormErrors({});
               setProvisionOpen(false);
               setProvisioningApplication(null);
               setRetryFacility(null);
               setIdentityConfirmed(false);
               const currentUrl = new URL(window.location.href);
               currentUrl.searchParams.delete("application");
               window.history.replaceState(null, "", currentUrl);
               setFacilities((current) => retryFacility
                    ? current.map((facility) => facility.tenantId === retryFacility.tenantId
                         ? { ...facility, databaseName: response.result.databaseName, status: "active" }
                         : facility)
                    : [{
                         tenantId: response.result.tenantId, platformId: response.result.organizationIdentifier,
                         name: form.companyName.trim(), email: form.email.trim(), phone: form.phone.trim(),
                         countryId: Number(form.countryId), stateId: Number(form.stateId), districtId: Number(form.districtId),
                         databaseName: response.result.databaseName, status: "active",
                    }, ...current]);
          } catch (failure) {
               setForm((current) => ({ ...current, adminPassword: "" }));
               setShowPassword(false);
               setError(errorMessage(failure));
               // A failed attempt leaves a "failed" registry row; refresh so its Retry/Delete actions appear immediately.
               try {
                    const refreshed = await customFetch("platform/facilities");
                    if (refreshed?.status === "success" && Array.isArray(refreshed.result)) setFacilities(refreshed.result);
               } catch { /* the original error stays visible */ }
          } finally {
               setBusy(false);
          }
     };

     if (!isSuperAdmin) return (
          <main className="p-2">
               <h1 className="h4 fw-semibold mb-3">Client platform</h1>
               <div className="alert alert-danger" role="alert">
                    Only an authorized platform super administrator can access facility onboarding.
               </div>
          </main>
     );

     const states = options.states.filter((state) => Number(state.country_id) === Number(form.countryId));
     const districts = options.districts.filter((district) => Number(district.state_id) === Number(form.stateId));
     const selectedFacility = facilities.find((facility) => facility.tenantId === selectedTenantId);
     const normalizedQuery = facilityQuery.trim().toLowerCase();
     const clientFacilities = facilities.filter((facility) => !facility.isControlTenant);
     const visibleFacilities = facilities.filter((facility) =>
          (showControlTenant || !facility.isControlTenant) &&
          (statusFilter === "all" || facility.status.toLowerCase() === statusFilter) &&
          [facility.name, facility.platformId, String(facility.tenantId), facility.status]
               .some((value) => value.toLowerCase().includes(normalizedQuery))
     );
     const facilitiesByStatus = (status: string) =>
          clientFacilities.filter((facility) => facility.status.toLowerCase() === status).length;
     const focusFacilities = (status: string) => {
          setFacilityQuery("");
          setStatusFilter(status);
          setShowControlTenant(false);
          document.getElementById("registered-facilities")?.scrollIntoView({ behavior: "smooth", block: "start" });
     };
     const summaryReady = hasLoadedFacilities && !loading;
     const facilityColumns = [
          {
               Header: "Retry",
               id: "retry",
               Cell: ({ row }) => row.original.status.toLowerCase() === "failed" ? (
                    <button type="button" className="btn btn-sm btn-outline-warning" disabled={busy || deleteBusy}
                         onClick={() => openRetry(row.original)}>Retry provisioning</button>
               ) : <span className="text-muted">—</span>,
          },
          {
               Header: "Delete",
               id: "delete",
               Cell: ({ row }) => (
                    <button type="button" className="btn btn-sm btn-outline-danger"
                         disabled={busy || deleteBusy || row.original.isControlTenant || row.original.status === "provisioning"}
                         title={row.original.isControlTenant ? "Platform home cannot be deleted" : row.original.status === "provisioning" ? "Wait for provisioning to finish" : row.original.status === "failed" ? "Permanently delete the partial database and registry record" : "Remove registry record; preserve database"}
                         onClick={() => {
                              setDeleteFacility(row.original);
                              setDeleteConfirmation("");
                              setDeleteReason("");
                              setDeleteError("");
                              setDeletedMessage("");
                         }}>Delete tenant</button>
               ),
          },
          {
               Header: "Company",
               accessor: "name",
          },
          {
               Header: "Organization identifier",
               accessor: "platformId",
               Cell: ({ value }) => <code>{value}</code>,
          },
          {
               Header: "Tenant ID",
               accessor: "tenantId",
          },
          {
               Header: "Status",
               accessor: "status",
               Cell: ({ value, row }) => (
                    <span>
                         <span className={`fw-semibold text-capitalize ${value.toLowerCase() === "active" ? "text-success" : "text-secondary"}`}>{value}</span>
                         {row.original.isControlTenant && <span className="small text-muted ms-2" title="Backend-configured home facility for platform super administrators; protected from self-deactivation.">Platform home (protected)</span>}
                    </span>
               ),
          },
          {
               Header: "Management",
               id: "management",
               Cell: ({ row }) => {
                    const isSelected = row.original.tenantId === selectedTenantId;
                    return (
                         <button
                              type="button"
                              className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-outline-primary"}`}
                              aria-pressed={isSelected}
                              onClick={() => setSelectedTenantId(isSelected ? null : row.original.tenantId)}
                         >
                              {isSelected ? "Managing" : "Manage facility"}
                         </button>
                    );
               },
          },
     ];
     return (
          <main className="p-2" aria-busy={busy}>
               <header className="mb-3">
                    <h1 className="h4 fw-semibold mb-1">Client platform</h1>
                    <p className="text-muted small mb-2">Monitor facility status and open platform-management tasks.</p>
                    <FacilityNav />
               </header>
               <section className="mb-3" aria-labelledby="facility-overview-title">
                    <h2 id="facility-overview-title" className="h5 fw-semibold mb-2">Facility overview</h2>
                    <div className="row g-3">
                    <div className="col-12 col-sm-6 col-xl">
                         <FacilitySummaryCard
                              title="Client facilities"
                              value={summaryReady ? clientFacilities.length : null}
                              subtitle="Excludes the protected platform home"
                              Icon={RiBuildingLine}
                              variant="primary"
                              selected={statusFilter === "all"}
                              disabled={!summaryReady}
                              onClick={() => focusFacilities("all")}
                         />
                    </div>
                    <div className="col-12 col-sm-6 col-xl">
                         <FacilitySummaryCard
                              title="Active Facilities"
                              value={summaryReady ? facilitiesByStatus("active") : null}
                              subtitle="Facilities with access enabled"
                              Icon={RiCheckboxCircleLine}
                              variant="success"
                              selected={statusFilter === "active"}
                              disabled={!summaryReady}
                              onClick={() => focusFacilities("active")}
                         />
                    </div>
                    <div className="col-12 col-sm-6 col-xl">
                         <FacilitySummaryCard
                              title="Suspended Facilities"
                              value={summaryReady ? facilitiesByStatus("suspended") : null}
                              subtitle="Facilities with access disabled"
                              Icon={RiErrorWarningLine}
                              variant="secondary"
                              selected={statusFilter === "suspended"}
                              disabled={!summaryReady}
                              onClick={() => focusFacilities("suspended")}
                         />
                    </div>
                    <div className="col-12 col-sm-6 col-xl">
                         <FacilitySummaryCard
                              title="Provisioning"
                              value={summaryReady ? facilitiesByStatus("provisioning") : null}
                              subtitle="Setup in progress"
                              Icon={RiTimeLine}
                              variant="primary"
                              selected={statusFilter === "provisioning"}
                              disabled={!summaryReady}
                              onClick={() => focusFacilities("provisioning")}
                         />
                    </div>
                    <div className="col-12 col-sm-6 col-xl">
                         <FacilitySummaryCard
                              title="Failed"
                              value={summaryReady ? facilitiesByStatus("failed") : null}
                              subtitle="Retry or review setup"
                              Icon={RiErrorWarningLine}
                              variant="danger"
                              selected={statusFilter === "failed"}
                              disabled={!summaryReady}
                              onClick={() => focusFacilities("failed")}
                         />
                    </div>
                    </div>
               </section>
               <section className="row g-2 mb-3 align-items-end" aria-label="Facility controls">
                    <div className="col-12 col-md-5">
                         <h2 className="h5 fw-semibold mb-1">Facility directory</h2>
                         <p className="text-muted small mb-0">Provision facilities and manage client access.</p>
                    </div>
                    <div className="col-12 col-md-7">
                         <div className="d-flex flex-column flex-sm-row justify-content-md-end align-items-stretch gap-2">
                              <div className="flex-grow-1">
                                   <label htmlFor="facility-search" className="visually-hidden">Search facilities</label>
                                   <input id="facility-search" type="search" className="form-control" placeholder="Search facilities..." value={facilityQuery} onChange={(event) => setFacilityQuery(event.target.value)} />
                              </div>
                              <div><label htmlFor="facility-status" className="visually-hidden">Filter by status</label><select id="facility-status" className="form-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="failed">Failed</option><option value="provisioning">Provisioning</option></select></div>
                              <button type="button" disabled={busy || deleteBusy} className="btn btn-primary w-100 w-sm-auto" aria-expanded={provisionOpen} aria-controls="provision-facility" onClick={() => {
                                   setProvisionOpen(!provisionOpen);
                                   setRetryFacility(null);
                                   setShowPassword(false);
                                   if (provisionOpen) setForm(blankFacilityForm());
                              }}>{provisionOpen ? "Close form" : "+ Provision Facility"}</button>
                              <Link href="/settings/facilities/pricing" className="btn btn-outline-primary w-100 w-sm-auto">Manage module pricing</Link>
                              <button type="button" className="btn btn-outline-secondary w-100 w-sm-auto" disabled={loading || busy} onClick={() => void load()}>{error ? "Retry" : "Refresh"}</button>
                         </div>
                         <label className="form-check mt-2">
                              <input className="form-check-input" type="checkbox" checked={showControlTenant} onChange={(event) => setShowControlTenant(event.target.checked)} />
                              <span className="form-check-label">Show protected platform home facility</span>
                         </label>
                    </div>
               </section>
               {error && <div className="alert alert-danger mb-3 d-flex justify-content-between gap-2" role="alert"><span>{error}</span><button type="button" className="btn-close" aria-label="Dismiss error" onClick={() => setError("")} /></div>}
               {pricingError && <div className="alert alert-warning mb-3" role="alert">{pricingError} <Link href="/settings/facilities/pricing">Open the Module pricing tab</Link>.</div>}
               {deletedMessage && <div className="alert alert-success" role="status">{deletedMessage}</div>}
               {deleteFacility && <form className="border-top border-danger pt-3 mb-3" onSubmit={confirmDelete} aria-label="Confirm tenant deletion" aria-describedby="delete-consequences">
                    <h2 className="h5 text-danger">Delete {deleteFacility.name}</h2>
                    <p id="delete-consequences">{deleteFacility.status === "failed"
                         ? <>This permanently deletes the partial database <strong>{deleteFacility.databaseName}</strong> and removes the failed tenant registry record. Database deletion cannot be undone. You can then provision the facility again using the same company email.</>
                         : <>This permanently removes the tenant registry record and prevents tenant access. Its database is preserved.</>}
                         {" "}Subscription payments and facility audit records are preserved. Linked legacy migration/provisioning records may be removed by database constraints. This is not deactivation.</p>
                    <label className="form-label" htmlFor="delete-confirmation">Enter {deleteFacility.platformId} to confirm</label>
                    <input id="delete-confirmation" className="form-control mb-2" value={deleteConfirmation} disabled={deleteBusy} onChange={(event) => setDeleteConfirmation(event.target.value)} autoComplete="off" required />
                    <label className="form-label" htmlFor="delete-reason">Reason</label>
                    <input id="delete-reason" className="form-control mb-2" value={deleteReason} disabled={deleteBusy} onChange={(event) => setDeleteReason(event.target.value)} minLength={3} maxLength={500} required />
                    {deleteError && <div className="alert alert-danger" role="alert">{deleteError}</div>}
                    <div className="d-flex gap-2">
                         <button type="submit" className="btn btn-danger" disabled={busy || deleteBusy || deleteConfirmation !== deleteFacility.platformId || deleteReason.trim().length < 3}>{deleteBusy ? "Deleting..." : deleteFacility.status === "failed" ? "Delete database and tenant" : "Confirm deletion"}</button>
                         <button type="button" className="btn btn-outline-secondary" disabled={deleteBusy} onClick={() => setDeleteFacility(null)}>Cancel</button>
                    </div>
               </form>}
               {loading && <div className="alert alert-light border d-flex align-items-center gap-2 mb-3" role="status"><span className="spinner-border spinner-border-sm text-primary" aria-hidden="true" />Loading facility configuration...</div>}
               {created && (
                    <section className="alert alert-success mb-3" role="status">
                         <div className="d-flex justify-content-between"><h2 className="h5">Facility ready</h2><button type="button" className="btn-close" aria-label="Dismiss confirmation" onClick={() => setCreated(null)} /></div>
                         <dl className="row mb-2">
                              {([["Organization identifier", created.organizationIdentifier], ["Internal tenant ID", created.tenantId], ["Database", created.databaseName], ["Administrator username", created.adminUsername]] as const).map(([label, value]) => <div className="row m-0 mb-2" key={label}><dt className="col-sm-4">{label}</dt><dd className="col-sm-8 mb-0"><span className="me-2">{value}</span><button type="button" className="btn btn-sm btn-outline-success" aria-label={`Copy ${label}`} onClick={() => void copy(label, value)}>{copiedKey === label ? "Copied" : "Copy"}</button></dd></div>)}
                         </dl>
                         <p className="mb-0">Share the username and the password you chose securely with the facility administrator. Email delivery requires the facility email provider to be configured.</p>
                    </section>
               )}
               {provisionOpen && <form ref={provisionRef} id="provision-facility" className="bg-white p-3 border rounded" onSubmit={submit} noValidate>
                    {retryFacility && <div className="alert alert-warning">
                         <h2 className="h6">Retry provisioning {retryFacility.platformId}</h2>
                         <p className="mb-0">The partial tenant database will be permanently removed before this facility is rebuilt. Confirm the locked reservation details and enter the address and administrator credentials for the new attempt.</p>
                    </div>}
                    {provisioningApplication && <div className="alert alert-info">
                         <h2 className="h6">{provisioningApplication.integration_state === "provision_failed" ? "Retrying approved website application" : "Provisioning website application"}: {provisioningApplication.name}</h2>
                         {provisioningApplication.integration_state === "provision_failed"
                              ? <p className="mb-0">You can edit the company details before retrying. The location of a previously reserved facility cannot be changed.</p>
                              : <>
                                   <p>Review the public company details and select official location records. This provisions a PLS tenant and links the approved application without reusing its website password.</p>
                                   <label className="form-check"><input type="checkbox" className="form-check-input" checked={identityConfirmed} disabled={busy} onChange={event => setIdentityConfirmed(event.target.checked)} /><span className="form-check-label">I verified this application belongs to the facility being provisioned.</span></label>
                              </>}
                    </div>}
                    <fieldset disabled={loading || busy || deleteBusy || options.countries.length === 0 || pricingCatalog.length === 0} className="py-3">
                         <legend className="h5 fw-semibold mb-3">Company information</legend>
                         <div className="row g-3">
                              {([
                                   ["companyName", "Company name", "text"], ["email", "Company email", "email"],
                                   ["phone", "Company phone", "tel"], ["address", "Company address", "text"],
                              ] as const).map(([field, label, type]) => (
                                   <div key={field} className="col-md-6">
                                        <label htmlFor={field} className="form-label">{label}</label>
                                        <input {...fieldProps(field)} id={field} type={type} className={`form-control${formErrors[field] ? " is-invalid" : ""}`} value={form[field]} disabled={provisioningApplication ? provisioningApplication.integration_state !== "provision_failed" : (Boolean(retryFacility) && field !== "address")} onChange={(event) => update(field, event.target.value)} maxLength={field === "address" ? 200 : field === "phone" ? 10 : 100} minLength={field === "phone" ? 7 : 1} pattern={field === "phone" ? "[0-9]{7,10}" : undefined} required />
                                        {fieldError(field)}
                                        {field === "phone" && <small className="text-muted">7 to 10 digits only, without spaces or a plus sign.</small>}
                                   </div>
                              ))}
                              {(["street", "gpsAddress"] as const).map(field => <div className="col-md-6" key={field}>
                                   <label className="form-label" htmlFor={field}>{field === "street" ? "Street / landmark" : "Digital / GPS address"}</label>
                                   <input id={field} className="form-control" value={form[field] || ""} maxLength={100} onChange={event => update(field, event.target.value)} />
                                   {fieldError(field)}
                              </div>)}
                              <p className="small text-muted mb-0">The company address is mandatory and will be printed on facility reports. Street and digital address provide additional location details.</p>
                              <div className="col-md-4">
                                   <label htmlFor="countryId" className="form-label">Country</label>
                                   <select {...fieldProps("countryId")} id="countryId" className="form-select" value={form.countryId} disabled={Boolean(retryFacility)} onChange={(event) => update("countryId", event.target.value)} required>
                                        <option value="">Select country</option>
                                        {options.countries.map((country) => <option key={country.id} value={country.id}>{country.country_name}</option>)}
                                   </select>
                                   {fieldError("countryId")}
                              </div>
                              <div className="col-md-4">
                                   <label htmlFor="stateId" className="form-label">State / region</label>
                                   <select {...fieldProps("stateId")} id="stateId" className="form-select" value={form.stateId} disabled={Boolean(retryFacility) || !form.countryId} onChange={(event) => update("stateId", event.target.value)} required>
                                        <option value="">{form.countryId ? "Select state / region" : "Select a country first"}</option>
                                        {states.map((state) => <option key={state.id} value={state.id}>{state.state_name}</option>)}
                                   </select>
                                   {fieldError("stateId")}
                              </div>
                              <div className="col-md-4">
                                   <label htmlFor="districtId" className="form-label">District</label>
                                   <select {...fieldProps("districtId")} id="districtId" className="form-select" value={form.districtId} disabled={Boolean(retryFacility) || !form.stateId} onChange={(event) => update("districtId", event.target.value)} required>
                                        <option value="">{form.stateId ? "Select district" : "Select a state first"}</option>
                                        {districts.map((district) => <option key={district.id} value={district.id}>{district.district_name}</option>)}
                                   </select>
                                   {fieldError("districtId")}
                              </div>
                         </div>
                         <div className="border-top mt-4 pt-4">
                              <h2 className="h5">Modules and branches</h2>
                              <div className="row g-3 mb-3">
                                   <div className="col-md-6"><label className="form-label" htmlFor="branch-mode">Branch support</label><select id="branch-mode" className="form-select" value={form.moduleConfiguration?.branchMode} onChange={event => setForm(current => ({ ...current, moduleConfiguration: { ...(current.moduleConfiguration || defaultModuleConfiguration()), branchMode: event.target.value as "single" | "multiple" } }))}><option value="single">Single branch</option><option value="multiple">Multiple branches</option></select><small className="text-muted">The main branch is created in both modes. Multiple-branch mode permits adding branches later.</small></div>
                                   <div className="col-md-6"><label className="form-label" htmlFor="module-currency">Module pricing currency</label><select id="module-currency" className="form-select" value={form.moduleConfiguration?.currency || ""} required onChange={event => selectFacilityCurrency(event.target.value)}><option value="">Select currency</option>{pricingCatalog.map(entry => <option key={entry.currency} value={entry.currency}>{entry.currency}</option>)}</select></div>
                              </div>
                              <div id="moduleConfiguration" tabIndex={-1} className="table-responsive">
                                   <table className="table"><thead><tr><th>Module</th><th>Activated</th><th>Monthly price</th></tr></thead><tbody>
                                        {(Object.keys(MODULE_LABELS) as ModuleName[]).map(module => <tr key={module}>
                                             <th scope="row">{MODULE_LABELS[module]}</th>
                                             <td><input type="checkbox" aria-label={`Activate ${MODULE_LABELS[module]}`} checked={form.moduleConfiguration?.modules[module].enabled || false} onChange={event => setForm(current => {
                                                  const config = current.moduleConfiguration || defaultModuleConfiguration();
                                                  return { ...current, moduleConfiguration: { ...config, modules: { ...config.modules, [module]: { ...config.modules[module], enabled: event.target.checked } } } };
                                             })} /></td>
                                             <td>{form.moduleConfiguration?.currency} {form.moduleConfiguration?.modules[module].monthlyPrice || "0.00"}</td>
                                        </tr>)}
                                   </tbody></table>
                              </div>
                              {fieldError("moduleConfiguration")}
                              <p className="fw-semibold">Enabled modules monthly total: {form.moduleConfiguration?.currency} {form.moduleConfiguration ? moduleMonthlyTotal(form.moduleConfiguration) || "Invalid amount" : "0.00"}</p>
                              <p className="text-muted small">Module prices come from the universal catalog and are locked for this estimate. Module charges are itemized on the payment page; the subscription amount remains separately configurable. Existing facilities keep their saved prices unless their module configuration is saved again. Email/SMS delivery still requires provider setup.</p>
                         </div>
                         <div className="border-top mt-4 pt-4">
                              <h2 className="h5 fw-semibold mb-3">Initial facility administrator</h2>
                              <div className="row g-3">
                                   <div className="col-md-6"><label htmlFor="adminName" className="form-label">Administrator name</label><input {...fieldProps("adminName")} id="adminName" className="form-control" value={form.adminName} onChange={(event) => update("adminName", event.target.value)} maxLength={100} required />{fieldError("adminName")}</div>
                                   <div className="col-md-6"><label htmlFor="adminEmail" className="form-label">Administrator email</label><input {...fieldProps("adminEmail")} id="adminEmail" type="email" className="form-control" value={form.adminEmail} onChange={(event) => update("adminEmail", event.target.value)} maxLength={200} required />{fieldError("adminEmail")}</div>
                                   <div className="col-md-6"><label htmlFor="adminPassword" className="form-label">Initial password</label><div className="input-group"><input {...fieldProps("adminPassword")} id="adminPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" className="form-control" value={form.adminPassword} onChange={(event) => update("adminPassword", event.target.value)} minLength={12} maxLength={72} required /><button type="button" className="btn btn-outline-secondary" aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"} password</button><button type="button" className="btn btn-outline-secondary" onClick={() => { try { update("adminPassword", generateFacilityPassword()); setShowPassword(true); } catch { setError("Secure password generation is unavailable in this browser."); } }}>Generate</button></div>{fieldError("adminPassword")}<small className="text-muted">Use at least 12 characters and at most 72 UTF-8 bytes. Passwords are not displayed in the result.</small></div>
                                   <div className="col-md-6"><label htmlFor="licenseDays" className="form-label">License duration (days)</label><input {...fieldProps("licenseDays")} id="licenseDays" type="number" className="form-control" value={form.licenseDays} onChange={(event) => update("licenseDays", event.target.value)} min={1} max={3650} required />{fieldError("licenseDays")}<div className="d-flex flex-wrap gap-2 mt-2">{[30, 90, 365, 730].map((days) => <button key={days} type="button" className={`btn btn-sm ${form.licenseDays === String(days) ? "btn-primary" : "btn-outline-secondary"}`} aria-pressed={form.licenseDays === String(days)} onClick={() => update("licenseDays", String(days))}>{days} days</button>)}</div></div>
                              </div>
                         </div>
                         <p className="text-muted mt-3">{retryFacility ? "Cleanup and re-provisioning may take several minutes. Do not submit again or close this page while setup is running." : "Provisioning may take several minutes. Do not submit again or close this page while setup is running."}</p>
                         <button type="submit" className="btn btn-primary px-4" disabled={loading || busy || options.countries.length === 0}>
                              {busy && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
                              {busy ? (retryFacility ? "Re-provisioning facility..." : "Provisioning facility...") : (retryFacility ? "Remove partial database and retry" : "Create and provision facility")}
                         </button>
                    </fieldset>
               </form>}
               <section id="registered-facilities" className="mb-3">
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-2">
                         <div>
                              <h2 className="h5 fw-semibold mb-1">Client facilities</h2>
                              <p className="text-muted small mb-0">Select a facility to review its status and open access management.</p>
                         </div>
                         <span className="small text-muted text-nowrap">{loading ? "Loading..." : `${visibleFacilities.length} of ${showControlTenant ? facilities.length : clientFacilities.length} facilities`}</span>
                    </div>
                    {visibleFacilities.length > 0 && <PrimeTable
                         column={facilityColumns}
                         data={visibleFacilities}
                         filtering={false}
                         serverSideFiltering={false}
                         handleSeverSideProcessing={null}
                    />}
                    {!loading && visibleFacilities.length === 0 && <div className="text-center py-5 px-3 border rounded-3 bg-body">
                         <p className="h5 mb-2">{error ? "Facilities unavailable" : clientFacilities.length === 0 ? "No client facilities yet" : "No matching facilities"}</p>
                         <p className="text-muted mb-0">{error ? "Retry loading the facility list before making changes." : clientFacilities.length === 0 ? "Provision your first facility using the form above." : "Try another name, organization identifier, tenant ID, or status."}</p>
                         {facilities.length > 0 && <button type="button" className="btn btn-outline-secondary mt-3" onClick={() => { setFacilityQuery(""); setStatusFilter("all"); setShowControlTenant(false); }}>Clear filters</button>}
                    </div>}
               </section>
               {selectedFacility && <div ref={managementRef}><button type="button" className="btn btn-outline-secondary mb-2" onClick={() => setSelectedTenantId(null)}>Close management</button><FacilityManagement key={selectedFacility.tenantId} mode="access" facility={selectedFacility} onStatusChange={(tenantId, status) => setFacilities((current) => current.map((facility) => facility.tenantId === tenantId ? { ...facility, status } : facility))} /></div>}
          </main>
     );
}
