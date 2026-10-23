import { customFetch, customFile, customPost } from "../../components/Auth/customFetch";

export interface ApiResponse<T> {
     status: string;
     statusCode: number;
     message?: string;
     result: T;
}

export interface TrialBalanceRow {
     account_code: string;
     name: string;
     type: "asset" | "liability" | "equity" | "revenue" | "expense";
     normal_balance: "debit" | "credit";
     debits: number;
     credits: number;
     balance: number;
}

export interface TrialBalance {
     rows: TrialBalanceRow[];
     totals: { debits: number; credits: number; balanced: boolean };
}

export interface LedgerLine {
     journal_entry_id: number;
     occurred_at: string;
     transaction_type: string;
     source_module: string;
     source_table: string;
     source_pk: number;
     source_ref: string;
     description: string | null;
     account_code: string;
     account_name: string;
     direction: "debit" | "credit";
     amount: number;
     branchid: number | null;
     billingid: number | null;
     expense_id: number | null;
     invoice_id: number | null;
     employeeid: number | null;
}

export interface Paginated<T> {
     data: T[];
     total: number;
     page: number;
     count: number;
}

export interface IncomeStatement {
     revenue: TrialBalanceRow[];
     costOfSales: TrialBalanceRow[];
     operatingExpenses: TrialBalanceRow[];
     totals: {
          revenue: number;
          costOfSales: number;
          grossProfit: number;
          operatingExpenses: number;
          netProfit: number;
     };
}

export interface BalanceSheet {
     assets: TrialBalanceRow[];
     liabilities: TrialBalanceRow[];
     equity: TrialBalanceRow[];
     totals: {
          assets: number;
          liabilities: number;
          equity: number;
          retainedProfit: number;
          liabilitiesAndEquity: number;
          difference: number;
     };
}

export interface FinancialOverview {
     asOf: string;
     period: { from: string; to: string; code: string; status: string | null };
     performance: {
          today: { revenue: number; expenses: number; profit: number };
          monthToDate: { revenue: number; expenses: number; profit: number };
          yearToDate: { revenue: number; expenses: number; profit: number };
     };
     position: {
          cash: number; bank: number; cashAndBank: number; receivables: number; overdueReceivables: number;
          payables: number; overduePayables: number; inventory: number; fixedAssets: number; totalAssets: number;
          totalLiabilities: number; equity: number; netAssets: number;
          balanceDifference: number;
     };
     trend: { periods: string[]; revenue: number[]; expenses: number[]; profit: number[] };
}

export interface ChartAccount {
     account_code: string;
     name: string;
     type: "asset" | "liability" | "equity" | "revenue" | "expense";
     normal_balance: "debit" | "credit";
     is_active: number | boolean;
}

export interface BankAccount {
     id: number;
     name: string;
     bank_name: string | null;
     account_number: string | null;
     gl_account_code: string;
     gl_account_name?: string | null;
     branchid: number | null;
     is_active: number | boolean;
     total_lines?: number;
     unmatched_lines?: number;
     last_statement_date?: string | null;
}

export interface PartyBalance {
     partyType: string;
     partyId: number | null;
     partyName: string | null;
     patientIdentifier?: string | null;
     documents: number;
     charged: number;
     settled: number;
     balance: number;
     oldestDocumentDate: string | null;
}

export interface SubledgerStatementEntry {
     id: number;
     document_type: string;
     document_ref: string;
     document_date: string;
     amount: number;
     gross_amount: number;
     tax_amount: number;
     source_module: string;
     runningBalance: number;
}

export interface AgingRow {
     partyType: string;
     partyId: number | null;
     partyName: string | null;
     patientIdentifier?: string | null;
     reference: string;
     documentDate: string;
     ageDays: number;
     current: number;
     days30: number;
     days60: number;
     days90: number;
     over90: number;
     total: number;
}

export interface Aging {
     rows: AgingRow[];
     total: number;
     page: number;
     count: number;
     totals: {
          current: number;
          days30: number;
          days60: number;
          days90: number;
          over90: number;
          total: number;
     };
}

export interface OutstandingDocuments {
     rows: Array<{
          partyType: string;
          partyId: number | null;
          partyName: string | null;
          patientIdentifier?: string | null;
          reference: string;
          documentDate: string;
          total: number;
     }>;
     total: number;
     page: number;
     count: number;
     totals: { total: number };
}



export type PeriodStatus = "open" | "soft_closed" | "closed" | "locked";

export interface AccountingPeriod {
     id: number;
     period_code: string;
     period_start: string;
     period_end: string;
     status: PeriodStatus;
     closed_by: number | null;
     closed_at: string | null;
     notes: string | null;
}

export type ManualJournalStatus = "draft" | "submitted" | "approved" | "posted" | "void";

export interface ManualJournalLine {
     id?: number;
     account_code: string;
     direction: "debit" | "credit";
     amount: number;
     branchid?: number | null;
     employeeid?: number | null;
     line_description?: string | null;
}

export interface ManualJournal {
     id: number;
     journal_no: string;
     journal_date: string;
     description: string;
     reference: string | null;
     status: ManualJournalStatus;
     journal_entry_id: number | null;
     created_by: number | null;
     submitted_by: number | null;
     approved_by: number | null;
     posted_by: number | null;
     submitted_at: string | null;
     approved_at: string | null;
     posted_at: string | null;
     notes: string | null;
}

export interface OutboxHealth {
     pending: number;
     failed: number;
     deadLetter: number;
     oldestPendingMinutes: number | null;
}

export interface OutboxRow {
     id: number;
     source_module: string;
     source_table: string;
     source_pk: number;
     source_ref: string;
     transaction_type: string;
     status: "pending" | "posted" | "failed" | "dead_letter";
     attempts: number;
     last_error: string | null;
     created_at: string;
     processed_at: string | null;
}

export type FinancialDayCloseStatus = 'draft' | 'accountant_submitted' | 'returned_to_accountant' | 'manager_approved' | 'finalized';

export interface FinancialDayClose {
     id: number;
     branchid: number;
     financial_date: string;
     timezone: string;
     status: FinancialDayCloseStatus;
     workflow_version: number;
     accountant_employeeid: number | null;
     manager_employeeid: number | null;
     owner_employeeid: number | null;
     accountant_submitted_at: string | null;
     manager_decided_at: string | null;
     finalized_at: string | null;
     locked_at: string | null;
     return_reason: string | null;
     latest_snapshot_hash: string | null;
     finalized_hash: string | null;
}

export interface FinancialDayCloseDetail {
     closure: FinancialDayClose;
     actions: any[];
     snapshots: any[];
     lockedRecords: number;
}

const BASE = "accounting";

function query(params: Record<string, string | number | undefined | null>): string {
     const search = new URLSearchParams();
     Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
               search.append(key, String(value));
          }
     });
     const asString = search.toString();
     return asString ? `?${asString}` : "";
}

export const accountingApi = {
     outstandingReceivables(filters: { from?: string; to?: string; search?: string; page?: number; count?: number; sortby?: string }): Promise<ApiResponse<OutstandingDocuments>> {
          return customFetch(`${BASE}/reports/receivables${query(filters)}`);
     },
     trialBalance(from?: string, to?: string, branchId?: number): Promise<ApiResponse<TrialBalance>> {
          return customFetch(`${BASE}/reports/trial-balance${query({ from, to, branchId })}`);
     },

     financialOverview(asOf?: string, branchId?: number): Promise<ApiResponse<FinancialOverview>> {
          return customFetch(`${BASE}/reports/financial-overview${query({ asOf, branchId })}`);
     },

     generalLedger(filters: {
          from?: string;
          to?: string;
          accountCode?: string;
          sourceModule?: string;
          branchId?: number;
          page?: number;
          count?: number;
          sortby?: string;
     }): Promise<ApiResponse<Paginated<LedgerLine>>> {
          return customFetch(`${BASE}/reports/general-ledger${query(filters)}`);
     },

     incomeStatement(from: string, to: string, branchId?: number): Promise<ApiResponse<IncomeStatement>> {
          return customFetch(`${BASE}/reports/income-statement${query({ from, to, branchId })}`);
     },

     balanceSheet(asOf: string, branchId?: number): Promise<ApiResponse<BalanceSheet>> {
          return customFetch(`${BASE}/reports/balance-sheet${query({ asOf, branchId })}`);
     },

     receivableAging(asOf?: string, paging?: {
          page?: number;
          count?: number;
          sortby?: string;
          search?: string;
          patientId?: number | string;
          ageBucket?: string;
          from?: string;
          to?: string;
     }): Promise<ApiResponse<Aging>> {
          return customFetch(`${BASE}/reports/receivable-aging${query({ asOf, ...paging })}`);
     },

     payableAging(asOf?: string, paging?: {
          page?: number;
          count?: number;
          sortby?: string;
          search?: string;
          patientId?: number | string;
          ageBucket?: string;
          from?: string;
          to?: string;
     }): Promise<ApiResponse<Aging>> {
          return customFetch(`${BASE}/reports/payable-aging${query({ asOf, ...paging })}`);
     },

     accounts(): Promise<ApiResponse<ChartAccount[]>> {
          return customFetch(`${BASE}/accounts`);
     },

     authorityPermissions(): Promise<ApiResponse<string[]>> {
          return customFetch(`${BASE}/authority/permissions`);
     },

     bankAccounts(): Promise<ApiResponse<BankAccount[]>> {
          return customFetch(`${BASE}/bank/accounts`);
     },

     createBankAccount(payload: { name: string; bank_name?: string; account_number?: string; gl_account_code: string; branchid?: number | null }) {
          return customPost(`${BASE}/bank/accounts`, "POST", payload);
     },

     updateBankAccount(
          id: number,
          payload: Partial<{ name: string; bank_name: string; account_number: string; gl_account_code: string; is_active: boolean }>
     ) {
          return customPost(`${BASE}/bank/accounts/${id}`, "PUT", payload);
     },

     importBankStatement(payload: {
          bankAccountId: number;
          lines: Array<{ txnDate: string; description?: string; reference?: string; amount: number }>;
     }) {
          return customPost(`${BASE}/bank/statement/import`, "POST", payload);
     },

     importBankExcel(bankAccountId: number, file: File) {
          const form = new FormData();
          form.append("bankAccountId", String(bankAccountId));
          form.append("file", file);
          return customFile(`${BASE}/bank/statement/import-excel`, form);
     },

     bankStatementLines(
          bankAccountId: number,
          filters?: { from?: string; to?: string; status?: string; page?: number; count?: number }
     ): Promise<ApiResponse<Paginated<any>>> {
          return customFetch(`${BASE}/bank/${bankAccountId}/statement-lines${query({ ...filters })}`);
     },

     bankUnmatchedLedger(bankAccountId: number, from?: string, to?: string): Promise<ApiResponse<any[]>> {
          return customFetch(`${BASE}/bank/${bankAccountId}/unmatched-ledger${query({ from, to })}`);
     },

     bankSuggestions(bankAccountId: number, from?: string, to?: string): Promise<ApiResponse<any[]>> {
          return customFetch(`${BASE}/bank/${bankAccountId}/suggestions${query({ from, to })}`);
     },

     bankSummary(bankAccountId: number, asOf: string, statementBalance: number): Promise<ApiResponse<any>> {
          return customFetch(`${BASE}/bank/${bankAccountId}/summary${query({ asOf, statementBalance })}`);
     },

     bankMatch(statementLineId: number, journalLineId: number) {
          return customPost(`${BASE}/bank/match`, "POST", { statementLineId, journalLineId });
     },

     bankMatchMany(pairs: Array<{ statementLineId: number; journalLineId: number }>) {
          return customPost(`${BASE}/bank/match-many`, "POST", { pairs });
     },

     bankUnmatch(statementLineId: number) {
          return customPost(`${BASE}/bank/statement-lines/${statementLineId}/unmatch`, "PUT", {});
     },

     bankIgnore(statementLineId: number) {
          return customPost(`${BASE}/bank/statement-lines/${statementLineId}/ignore`, "PUT", {});
     },

     authorityEmployees(): Promise<ApiResponse<Array<{ employeeid: number; username: string; role: string; branch: number | null; fullname: string }>>> {
          return customFetch(`${BASE}/authority/employees`);
     },

     myAuthority(): Promise<ApiResponse<{ employeeid: number; role: string; permissions: Record<string, { allowed: boolean; reason: string }> }>> {
          return customFetch(`${BASE}/authority/mine`);
     },

     delegations(activeOnly = true, paging?: { page?: number; count?: number; sortby?: string }): Promise<ApiResponse<any>> {
          return customFetch(`${BASE}/authority/delegations${query({ activeOnly: String(activeOnly), ...paging })}`);
     },

     grantDelegation(payload: {
          employeeid: number;
          permission: string;
          minAmount?: number | null;
          maxAmount?: number | null;
          branchid?: number | null;
          expiresAt?: string | null;
          notes?: string | null;
     }) {
          return customPost(`${BASE}/authority/delegations`, "POST", payload);
     },

     reviseDelegation(id: number, payload: {
          minAmount?: number | null;
          maxAmount?: number | null;
          branchid?: number | null;
          expiresAt?: string | null;
          notes?: string | null;
     }) {
          return customPost(`${BASE}/authority/delegations/${id}`, "PUT", payload);
     },

     revokeDelegation(id: number) {
          return customPost(`${BASE}/authority/delegations/${id}`, "DELETE", {});
     },

     cashFlow(from: string, to: string): Promise<ApiResponse<any>> {
          return customFetch(`${BASE}/reports/cash-flow${query({ from, to })}`);
     },

     revenueAnalysis(from: string, to: string, branchId?: number): Promise<ApiResponse<any>> {
          return customFetch(`${BASE}/reports/revenue-analysis${query({ from, to, branchId })}`);
     },

     expenseAnalysis(from: string, to: string, branchId?: number): Promise<ApiResponse<any>> {
          return customFetch(`${BASE}/reports/expense-analysis${query({ from, to, branchId })}`);
     },

     branchPerformance(from: string, to: string): Promise<ApiResponse<any>> {
          return customFetch(`${BASE}/reports/branch-performance${query({ from, to })}`);
     },

     inventoryValuation(asOf?: string, paging?: { page?: number; count?: number; sortby?: string }): Promise<ApiResponse<any>> {
          return customFetch(`${BASE}/reports/inventory-valuation${query({ asOf, ...paging })}`);
     },

     subledgerBalances(
          ledger: "AR" | "AP",
          asOf?: string,
          paging?: { page?: number; count?: number; sortby?: string }
     ): Promise<ApiResponse<{ data: PartyBalance[]; total: number; page: number; count: number }>> {
          return customFetch(`${BASE}/subledger/${ledger}/balances${query({ asOf, ...paging })}`);
     },

     ledgerCoverage(): Promise<
          ApiResponse<{
               goLive: string | null;
               lines: {
                    module: string;
                    document: string;
                    total: number;
                    posted: number;
                    missingPreGoLive: number;
                    missingPostGoLive: number;
                    amountMissingPostGoLive: number;
               }[];
               billDrift: { billingid: number; payable: number; ledger: number; difference: number }[];
          }>
     > {
          return customFetch(`${BASE}/reconciliation/coverage${query({})}`);
     },

     subledgerReconcile(
          ledger: "AR" | "AP",
          asOf?: string
     ): Promise<ApiResponse<{ subledger: number; generalLedger: number; difference: number }>> {
          return customFetch(`${BASE}/subledger/${ledger}/reconcile${query({ asOf })}`);
     },

     subledgerStatement(
          ledger: "AR" | "AP",
          partyType: string,
          partyId: number,
          from?: string,
          to?: string,
          paging?: { page?: number; count?: number }
     ): Promise<ApiResponse<{ entries: SubledgerStatementEntry[]; total: number; page: number; count: number; openingBalance: number; closingBalance: number }>> {
          return customFetch(`${BASE}/subledger/${ledger}/statement/${partyType}/${partyId}${query({ from, to, ...paging })}`);
     },

     periods(from?: string, to?: string): Promise<ApiResponse<AccountingPeriod[]>> {
          return customFetch(`${BASE}/periods${query({ from, to })}`);
     },

     dailyCloses(filters: { branchId?: number; from?: string; to?: string; status?: FinancialDayCloseStatus; page?: number; count?: number }): Promise<ApiResponse<Paginated<FinancialDayClose>>> {
          return customFetch(`${BASE}/daily-closes${query(filters)}`);
     },

     dailyClose(id: number): Promise<ApiResponse<FinancialDayCloseDetail>> {
          return customFetch(`${BASE}/daily-closes/${id}`);
     },

     submitDailyClose(financialDate: string, payload: { branchId: number; pin: string; timezone: string; notes?: string; expectedVersion?: number }) {
          return customPost(`${BASE}/daily-closes/${financialDate}/accountant-submit`, 'POST', payload);
     },

     decideDailyClose(id: number, payload: { decision: 'approve' | 'reject'; pin: string; reason?: string; notes?: string; expectedVersion: number }) {
          return customPost(`${BASE}/daily-closes/${id}/manager-decision`, 'POST', payload);
     },

     finalizeDailyClose(id: number, payload: { pin: string; notes?: string; expectedVersion: number }) {
          return customPost(`${BASE}/daily-closes/${id}/finalize`, 'POST', payload);
     },

     periodTotals(periodCode: string): Promise<ApiResponse<{ debits: number; credits: number; entries: number }>> {
          return customFetch(`${BASE}/periods/${periodCode}/totals`);
     },

     setPeriodStatus(periodCode: string, status: PeriodStatus, employeeid: number, notes?: string) {
          return customPost(`${BASE}/periods/${periodCode}/status`, "PUT", { status, employeeid, notes });
     },

     manualJournals(filters: {
          status?: ManualJournalStatus;
          from?: string;
          to?: string;
          page?: number;
          count?: number;
          sortby?: string;
     }): Promise<ApiResponse<Paginated<ManualJournal>>> {
          return customFetch(`${BASE}/manual-journals${query(filters)}`);
     },

     manualJournal(id: number): Promise<ApiResponse<{ journal: ManualJournal; lines: ManualJournalLine[] }>> {
          return customFetch(`${BASE}/manual-journals/${id}`);
     },

     createManualJournal(payload: {
          journalDate: string;
          description: string;
          reference?: string;
          notes?: string;
          employeeid: number;
          lines: ManualJournalLine[];
     }) {
          return customPost(`${BASE}/manual-journals`, "POST", payload);
     },

     updateManualJournal(id: number, payload: {
          journalDate: string;
          description: string;
          reference?: string;
          notes?: string;
          lines: ManualJournalLine[];
     }) {
          return customPost(`${BASE}/manual-journals/${id}`, "PUT", payload);
     },

     submitManualJournal(id: number, employeeid: number) {
          return customPost(`${BASE}/manual-journals/${id}/submit`, "PUT", { employeeid });
     },

     approveManualJournal(id: number, employeeid: number) {
          return customPost(`${BASE}/manual-journals/${id}/approve`, "PUT", { employeeid });
     },

     postManualJournal(id: number, employeeid: number) {
          return customPost(`${BASE}/manual-journals/${id}/post`, "PUT", { employeeid });
     },

     reverseManualJournal(id: number, employeeid: number, description?: string) {
          return customPost(`${BASE}/manual-journals/${id}/reverse`, "PUT", { employeeid, description });
     },

     voidManualJournal(id: number, employeeid: number, reason?: string) {
          return customPost(`${BASE}/manual-journals/${id}/void`, "PUT", { employeeid, reason });
     },

     outboxHealth(): Promise<ApiResponse<OutboxHealth>> {
          return customFetch(`${BASE}/outbox/health?page=1&count=10`);
     },

     outbox(filters: { status?: string; sourceModule?: string; page?: number; count?: number; sortby?: string }): Promise<ApiResponse<Paginated<OutboxRow>>> {
          return customFetch(`${BASE}/outbox${query(filters)}`);
     },

     replayOutbox(id: number) {
          return customPost(`${BASE}/outbox/${id}/replay`, "PUT", {});
     },

     closeFiscalYear(fiscalYear: number, employeeid: number) {
          return customPost(`${BASE}/close/fiscal-year`, "POST", { fiscalYear, employeeid });
     },

     openingBalances(asOf: string, lines: Array<{ accountCode: string; debit?: number; credit?: number }>, employeeid: number) {
          return customPost(`${BASE}/opening-balances`, "POST", { asOf, lines, employeeid });
     },
};
