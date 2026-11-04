import { SSF } from "xlsx";

export type BankDateFormat = "DMY" | "MDY" | "YMD";
export interface BankStatementLine {
     txnDate: string;
     description?: string;
     reference?: string;
     amount: number;
}

function isoDate(year: number, month: number, day: number): string {
     const date = new Date(Date.UTC(year, month - 1, day));
     if (year < 1900 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day)
          throw new Error("Invalid statement date");
     return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function bankStatementDate(value: unknown, format: BankDateFormat, date1904 = false): string {
     if (value instanceof Date) return isoDate(value.getFullYear(), value.getMonth() + 1, value.getDate());
     if (typeof value === "number") {
          const date = SSF.parse_date_code(value, { date1904 });
          if (!date) throw new Error("Invalid Excel statement date");
          return isoDate(date.y, date.m, date.d);
     }
     const text = String(value ?? "").trim();
     const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
     if (iso) return isoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
     const parts = /^(\d{1,4})([/-])(\d{1,2})\2(\d{1,4})$/.exec(text);
     if (!parts) throw new Error("Use an Excel date or the selected text date format");
     const [a, b, c] = [parts[1], parts[3], parts[4]].map(Number);
     return format === "YMD" ? isoDate(a, b, c) : format === "DMY" ? isoDate(c, b, a) : isoDate(c, a, b);
}

export function bankStatementAmount(value: unknown): number {
     if (value === null || value === undefined || String(value).trim() === "") return 0;
     if (typeof value === "number") {
          const cents = Math.round(value * 100);
          if (!Number.isSafeInteger(cents) || Math.abs(value * 100 - cents) > 0.0000001)
               throw new Error("Unreadable amount; use at most two decimal places");
          return cents / 100;
     }
     let text = String(value).trim();
     const direction = /\s+(DR|CR)$/i.exec(text)?.[1]?.toUpperCase();
     text = text.replace(/\s+(DR|CR)$/i, "").trim();
     const parentheses = /^\(.*\)$/.test(text);
     if (parentheses) text = text.slice(1, -1).trim();
     if (parentheses && /^[+-]/.test(text)) throw new Error("Conflicting statement amount signs");
     text = text.replace(/^(?:GHS|GH₵|₵|USD|GBP|EUR|[$£€])\s*/i, "");
     if (!/^[+-]?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(text))
          throw new Error("Unreadable amount; use at most two decimal places");
     let amount = Number(text.replace(/,/g, ""));
     if (!Number.isSafeInteger(Math.round(amount * 100))) throw new Error("Statement amount is too large");
     if (direction === "CR" && (parentheses || amount < 0)) throw new Error("Conflicting statement amount signs");
     if (direction === "DR" || parentheses) amount = -Math.abs(amount);
     return amount;
}

export function parseBankStatement(rows: unknown[][], format: BankDateFormat, date1904 = false) {
     const lines: BankStatementLine[] = [], problems: string[] = [];
     rows.forEach((row, index) => {
          if (row.every(value => value == null || String(value).trim() === "")) return;
          if (index === 0 && /date/i.test(String(row[0] ?? ""))) return;
          try {
               if (row.length < 2) throw new Error("Missing statement columns");
               let amount: number;
               if (row.length >= 5) {
                    const debit = bankStatementAmount(row[3]), credit = bankStatementAmount(row[4]);
                    if (debit < 0 || credit < 0 || (debit > 0 && credit > 0))
                         throw new Error("Use nonnegative debit or credit, not both");
                    amount = credit - debit;
               } else amount = bankStatementAmount(row[row.length - 1]);
               if (amount === 0) throw new Error("A non-zero statement amount is required");
               lines.push({
                    txnDate: bankStatementDate(row[0], format, date1904),
                    description: String(row[1] ?? "").trim() || undefined,
                    reference: row.length >= 4 ? String(row[2] ?? "").trim() || undefined : undefined,
                    amount,
               });
          } catch (error) {
               problems.push(`Line ${index + 1}: ${error instanceof Error ? error.message : "Invalid statement row"}`);
          }
     });
     return { lines, problems };
}
