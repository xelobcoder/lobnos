import { notFound, redirect } from "next/navigation";
import { requestBackendJson } from "../../../components/serverActions/backendRequest";
import { ApplicationProvider } from "../../../components/Auth/useApplicationContext";
import FacilityDirectory from "../../settings/facilities/page";
import Applications from "../../settings/facilities/applications/page";
import Audit from "../../settings/facilities/audit/page";
import Devices from "../../settings/facilities/devices/page";
import Payments from "../../settings/facilities/payments/page";
import Plans from "../../settings/facilities/plans/page";
import Pricing from "../../settings/facilities/pricing/page";
import Sms from "../../settings/facilities/sms/page";
import Transactions from "../../settings/facilities/transactions/page";
import MasterSignOut from "../MasterSignOut";
import FacilityNav from "../../settings/facilities/FacilityNav";
import MasterCredentialForm from "../MasterCredentialForm";
import { RiShieldCrossFill } from "@remixicon/react";

import CopyTestSetup from "../CopyTestSetup";

const pages = { "": FacilityDirectory, applications: Applications, audit: Audit, devices: Devices, payments: Payments, plans: Plans, pricing: Pricing, sms: Sms, transactions: Transactions, "copy-test-setup": CopyTestSetup };

export default async function MasterPlatform({ params }: { params: Promise<{ section?: string[] }> }) {
    const { section = [] } = await params;
    const key = section[0] ?? "";
    const Page = Object.hasOwn(pages, key) ? pages[key as keyof typeof pages] : undefined;
    if (section.length > 1 || (!Page && key !== "account")) notFound();
    const access = await requestBackendJson("platform/facilities/access");
    if (access?.statusCode === 401 || access?.statusCode === 403) redirect("/master-platform/login");
    if (access?.result?.authorized !== true) return <main className="p-4">
        <h1 className="h4">Platform Administration</h1><p role="alert">Master access could not be verified. Refresh to retry.</p>
    </main>;
    const account = key === "account" ? await requestBackendJson("platform/master/account") : null;
    return <ApplicationProvider initialSettings={{ user: { role: "super-admin" } }}>
        <header className="sticky-top bg-body border-bottom px-3 py-3 d-flex justify-content-between align-items-center gap-3">
            <strong className="d-flex align-items-center gap-2"><RiShieldCrossFill className="text-success" size={25} />Platform Administration</strong>
            <MasterSignOut />
        </header>
        <div className="container-fluid">
            <div className="row">
                <aside className="col-12 col-lg-3 col-xl-2 border-end bg-body p-0">
                    <div className="d-none d-lg-block"><FacilityNav /></div>
                    <details className="d-lg-none border-bottom">
                        <summary className="px-3 py-2 fw-semibold">Platform menu</summary>
                        <FacilityNav />
                    </details>
                </aside>
                <div className="col min-vh-100 py-3">
                    {key === "account" ? (account?.result?.username
                        ? <MasterCredentialForm username={account.result.username} />
                        : <p className="alert alert-warning" role="alert">Master account settings could not be loaded.</p>)
                        : Page && <Page />}
                </div>
            </div>
        </div>
    </ApplicationProvider>;
}
