import type jsPDF from "jspdf";
import { buildOrganizationInvoicePdf, type InvoiceStatus, type OrganizationInvoiceDetail } from "./organizationInvoicePdf";

/**
 * Patient/client invoice. It reuses the organization invoice template so every invoice the system
 * produces has one layout; this only maps a billing record onto that template's data shape.
 */
export interface ClientInvoiceSource {
	billing: any;
	patient: any;
	services: any[];
	paymenthistory?: any[];
	companyInfo?: any;
}

const num = (value: unknown) => {
	const n = Number(value ?? 0);
	return Number.isFinite(n) ? n : 0;
};

export function mapBillingToInvoiceDetail(source: ClientInvoiceSource): OrganizationInvoiceDetail {
	const { billing, patient, services } = source;
	const patientName = [patient?.designation, patient?.firstname, patient?.middlename, patient?.lastname].filter(Boolean).join(" ").trim();
	const company = source.companyInfo || {};

	const lines = (services || []).map((service, index) => ({
		id: index + 1,
		billing_id: billing.billingid,
		patient_name: patientName,
		description: service.service_name || service.test_report_title || `Service ${service.serviceid}`,
		service_date: service.serviceAddedOn || billing.billedon,
		quantity: 1,
		unit_price: service.cost,
		discount: service.discount ?? 0,
		tax: service.taxValue ?? 0,
		line_total: service.totalpayable ?? service.totalcost ?? service.cost,
		prior_credit: 0,
		amount_due: service.outstanding ?? 0,
		amount_paid: service.paidamount ?? 0,
	}));

	const subtotal = lines.reduce((sum, l) => sum + num(l.unit_price), 0);
	const discountTotal = lines.reduce((sum, l) => sum + num(l.discount), 0);
	const taxTotal = lines.reduce((sum, l) => sum + num(l.tax), 0);
	const total = lines.reduce((sum, l) => sum + num(l.line_total), 0);
	const outstanding = num(billing.outstanding);
	const paid = num(billing.paid);
	const status: InvoiceStatus = outstanding <= 0 ? "paid" : paid > 0 ? "partially_paid" : "unpaid";
	const billedOn = billing.billedon;

	return {
		invoice: {
			id: Number(billing.billingid),
			invoice_number: `INV-${billing.billingid}`,
			invoice_date: billedOn,
			due_date: billedOn,
			status,
			payment_terms: "Due on receipt",
			reference: patient?.fullpatientid ? `Patient ${patient.fullpatientid}` : "",
			notes: "",
			subtotal,
			discount_total: discountTotal,
			tax_total: taxTotal,
			total_amount: total,
			prior_credits: 0,
			amount_due: total,
			amount_paid: paid,
			balance_due: outstanding,
		},
		lines,
		payments: (source.paymenthistory || [])
			.filter((p) => String(p.type || "payment").toLowerCase() !== "refund")
			.map((p) => ({
				id: p.KeyID,
				amount: p.Amount,
				payment_mode: p.PaymentMode ?? null,
				payment_date: p.Date,
				reference: "",
			})),
		organization: {
			name: patientName || "Client",
			address: "",
			street: "",
			location: "",
			region: "",
			mobile: patient?.mobile_number || "",
			email: patient?.email || "",
			contact: null,
		},
		company: {
			name: company.NAME ?? company.name,
			email: company.EMAIL ?? company.email,
			motto: company.MOTTO ?? company.motto,
			phonenumber: company.PHONENUMBER ?? company.phonenumber,
			alternativenumber: company.ALTERNATIVENUMBER ?? company.alternativenumber,
			address: company.ADDRESS ?? company.address,
			street: company.STREET ?? company.street,
			website: company.WEBSITE ?? company.website,
			additionalInfo: company.additionalInfo,
		},
	};
}

export function buildClientInvoicePdf(source: ClientInvoiceSource, logoDataUrl?: string | null): jsPDF {
	return buildOrganizationInvoicePdf(mapBillingToInvoiceDetail(source), logoDataUrl);
}
