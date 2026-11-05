import { RiDownloadLine } from '@remixicon/react';

/** General training documentation; contains no tenant or patient records. */
export default function ManualPdfDownload() {
    return <a
        className="btn btn-primary d-inline-flex align-items-center gap-2"
        href="/manuals/primelabsys-operations-crm-billing-inventory-user-manual.pdf"
        download="PrimeLabSys-Full-User-Manual.pdf"
        title="Full Operations, CRM, Billing and Inventory trainer manual (PDF)"
    ><RiDownloadLine size={18} aria-hidden="true"/>Download PDF<span className="visually-hidden"> — full Operations, CRM, Billing and Inventory manual</span></a>;
}