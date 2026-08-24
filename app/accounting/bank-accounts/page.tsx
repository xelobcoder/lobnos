"use client";
import { RiAddLine, RiBankLine, RiCheckLine, RiCloseLine, RiDownloadLine, RiEditLine, RiExchangeFundsLine } from "@remixicon/react";
import dayjs from "dayjs";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";
import AccountingGuard, { useIsAccountingOwner } from "../../../components/accounting/AccountingGuard";
import ReportShell from "../../../components/accounting/ReportShell";
import { accountingApi, BankAccount, ChartAccount } from "../../../lib/accounting/accountingApi";

const SAMPLE_ROWS = [
     ["date", "description", "reference", "amount"],
     ["2026-08-01", "Patient deposit", "TRX-1024", 2500],
     ["2026-08-03", "Supplier payment - Medlab", "CHQ-000412", -1840.5],
     ["2026-08-07", "POS settlement", "POS-8891", 960],
     ["2026-08-15", "Bank charges", "FEE-0815", -45],
     ["2026-08-20", "Transfer from cash", "TRF-2210", 5000],
];

const EMPTY_FORM = { name: "", bank_name: "", account_number: "", gl_account_code: "acc-1001" };

function downloadSample() {
     const worksheet = XLSX.utils.aoa_to_sheet(SAMPLE_ROWS);
     const workbook = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(workbook, worksheet, "Statement");
     const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
     const blob = new Blob([output], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
     const url = URL.createObjectURL(blob);
     const link = document.createElement("a");
     link.href = url;
     link.download = "bank-statement-sample.xlsx";
     link.click();
     URL.revokeObjectURL(url);
}

function BankAccountsPage() {
     const isOwner = useIsAccountingOwner();
     const [accounts, setAccounts] = useState<BankAccount[]>([]);
     const [chart, setChart] = useState<ChartAccount[]>([]);
     const [form, setForm] = useState(EMPTY_FORM);
     const [editingId, setEditingId] = useState<number | null>(null);
     const [busy, setBusy] = useState(false);

     const load = useCallback(async () => {
          try {
               const [accountsRes, chartRes] = await Promise.all([accountingApi.bankAccounts(), accountingApi.accounts()]);
               setAccounts(accountsRes?.result || []);

               const rows: any = chartRes?.result;
               setChart(Array.isArray(rows) ? rows : rows?.data || []);
          } catch (error: any) {
               toast.error(error?.message || "Unable to load bank accounts");
          }
     }, []);

     useEffect(() => {
          load();
     }, [load]);

     const assetAccounts = chart.filter((account) => account.type === "asset");

     const reset = () => {
          setForm(EMPTY_FORM);
          setEditingId(null);
     };

     const save = async () => {
          if (!form.name.trim() || !form.gl_account_code) {
               toast.error("Give the account a name and pick the ledger account it posts to");
               return;
          }

          setBusy(true);
          try {
               const response: any = editingId
                    ? await accountingApi.updateBankAccount(editingId, form)
                    : await accountingApi.createBankAccount(form);

               if (response?.status === "error") toast.error(response?.message || "Unable to save the bank account");
               else {
                    toast.success(editingId ? "Bank account updated" : "Bank account created");
                    reset();
                    await load();
               }
          } catch (error: any) {
               toast.error(error?.message || "Unable to save the bank account");
          } finally {
               setBusy(false);
          }
     };

     const edit = (account: BankAccount) => {
          setEditingId(account.id);
          setForm({
               name: account.name || "",
               bank_name: account.bank_name || "",
               account_number: account.account_number || "",
               gl_account_code: account.gl_account_code,
          });
          window.scrollTo({ top: 0, behavior: "smooth" });
     };

     const toggleActive = async (account: BankAccount) => {
          setBusy(true);
          try {
               const response: any = await accountingApi.updateBankAccount(account.id, { is_active: !account.is_active });
               if (response?.status === "error") toast.error(response?.message || "Unable to update");
               else {
                    toast.success(account.is_active ? "Account deactivated" : "Account reactivated");
                    await load();
               }
          } catch (error: any) {
               toast.error(error?.message || "Unable to update");
          } finally {
               setBusy(false);
          }
     };

     const column = [
          {
               Header: "Account",
               accessor: "name",
               Cell: ({ row }: any) => (
                    <div>
                         <div className="fw-semibold">{row.original.name}</div>
                         <small className="text-muted">
                              {row.original.bank_name || "No bank recorded"}
                              {row.original.account_number ? ` · ${row.original.account_number}` : ""}
                         </small>
                    </div>
               ),
          },
          {
               Header: "Posts to",
               accessor: "gl_account_code",
               Cell: ({ row }: any) => (
                    <div>
                         <div className="font-monospace small">{row.original.gl_account_code}</div>
                         <small className="text-muted">{row.original.gl_account_name || ""}</small>
                    </div>
               ),
          },
          {
               Header: "Statement lines",
               accessor: "total_lines",
               Cell: ({ row }: any) => {
                    const total = Number(row.original.total_lines || 0);
                    const unmatched = Number(row.original.unmatched_lines || 0);
                    if (total === 0) return <span className="text-muted">Nothing imported</span>;
                    return (
                         <span>
                              {total} imported
                              {unmatched > 0 && <span className="badge bg-warning text-dark ms-2">{unmatched} unmatched</span>}
                         </span>
                    );
               },
          },
          {
               Header: "Last statement",
               accessor: "last_statement_date",
               Cell: ({ value }: any) =>
                    value ? dayjs(value).format("DD MMM YYYY") : <span className="text-muted">Never</span>,
          },
          {
               Header: "Status",
               accessor: "is_active",
               Cell: ({ value }: any) =>
                    value ? <span className="badge bg-success">Active</span> : <span className="badge bg-secondary">Inactive</span>,
          },
          {
               Header: "Actions",
               accessor: "id",
               Cell: ({ row }: any) => (
                    <div className="d-flex gap-1">
                         <Link
                              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                              href={`/accounting/bank-reconciliation?account=${row.original.id}`}
                         >
                              <RiExchangeFundsLine size={14} /> Reconcile
                         </Link>

                         {isOwner && (
                              <>
                                   <button className="btn btn-sm btn-outline-secondary" disabled={busy} onClick={() => edit(row.original)}>
                                        <RiEditLine size={14} />
                                   </button>
                                   <button
                                        className={`btn btn-sm ${row.original.is_active ? "btn-outline-danger" : "btn-outline-success"}`}
                                        disabled={busy}
                                        onClick={() => toggleActive(row.original)}
                                   >
                                        {row.original.is_active ? <RiCloseLine size={14} /> : <RiCheckLine size={14} />}
                                   </button>
                              </>
                         )}
                    </div>
               ),
          },
     ];

     return (
          <ReportShell
               title="Bank Accounts"
               subtitle="Register every bank, mobile money wallet and cash float, and map each one to the ledger account it posts to"
               actions={
                    <button className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1" onClick={downloadSample}>
                         <RiDownloadLine size={16} /> Sample Excel workbook
                    </button>
               }
          >
               {isOwner ? (
                    <div className="card border-0 shadow-sm mb-3">
                         <div className="card-header bg-white fw-semibold d-flex align-items-center gap-2">
                              <RiBankLine size={18} />
                              {editingId ? "Edit bank account" : "Add a bank account"}
                         </div>
                         <div className="card-body">
                              <div className="row g-2 align-items-end">
                                   <div className="col-12 col-md-3">
                                        <label className="form-label mb-1 small text-muted">Account name</label>
                                        <input
                                             type="text"
                                             className="form-control custom-input"
                                             placeholder="e.g. GCB Main Account"
                                             value={form.name}
                                             onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        />
                                   </div>

                                   <div className="col-12 col-md-3">
                                        <label className="form-label mb-1 small text-muted">Bank</label>
                                        <input
                                             type="text"
                                             className="form-control custom-input"
                                             placeholder="e.g. Ghana Commercial Bank"
                                             value={form.bank_name}
                                             onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                                        />
                                   </div>

                                   <div className="col-6 col-md-2">
                                        <label className="form-label mb-1 small text-muted">Account number</label>
                                        <input
                                             type="text"
                                             className="form-control custom-input"
                                             value={form.account_number}
                                             onChange={(e) => setForm({ ...form, account_number: e.target.value })}
                                        />
                                   </div>

                                   <div className="col-6 col-md-2">
                                        <label className="form-label mb-1 small text-muted">Posts to</label>
                                        <select
                                             className="form-select custom-select"
                                             value={form.gl_account_code}
                                             onChange={(e) => setForm({ ...form, gl_account_code: e.target.value })}
                                        >
                                             {assetAccounts.length === 0 && <option value="">No asset accounts found</option>}
                                             {assetAccounts.map((account) => (
                                                  <option key={account.account_code} value={account.account_code}>
                                                       {account.account_code} - {account.name}
                                                  </option>
                                             ))}
                                        </select>
                                   </div>

                                   <div className="col-12 col-md-2 d-flex gap-2">
                                        <button className="btn btn-outline-primary flex-fill d-inline-flex align-items-center justify-content-center gap-1" onClick={save} disabled={busy}>
                                             <RiAddLine size={16} /> {busy ? "Saving..." : editingId ? "Update" : "Create"}
                                        </button>
                                        {editingId && (
                                             <button className="btn btn-outline-secondary" onClick={reset} disabled={busy}>
                                                  Cancel
                                             </button>
                                        )}
                                   </div>
                              </div>

                              <small className="text-muted d-block mt-2">
                                   Keep each bank, wallet and float as its own account so they reconcile separately. Several may
                                   point at the same ledger account &mdash; use Bank (acc-1001) for bank accounts and Cash
                                   (acc-1000) for cash floats. Once an account has reconciled lines its ledger mapping is fixed.
                              </small>
                         </div>
                    </div>
               ) : (
                    <div className="alert alert-info py-2">
                         Only an administrator can add or change bank accounts. You can still reconcile the accounts listed below.
                    </div>
               )}

               <PrimeTable column={column} data={accounts} filtering isExpoerted handleSeverSideProcessing={undefined} />
          </ReportShell>
     );
}

export default function Page() {
     return (
          <AccountingGuard>
               <BankAccountsPage />
          </AccountingGuard>
     );
}
