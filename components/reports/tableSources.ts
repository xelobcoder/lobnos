/**
 * Lets a table component supply its authoritative export data (for example every page of a
 * server-paginated table) instead of the rows currently rendered. Kept free of PDF dependencies so
 * tables can register without pulling jsPDF into their bundle.
 */

export type ReportCell =
     | string
     | {
            content: string;
            colSpan?: number;
            bold?: boolean;
            section?: boolean;
            indent?: number;
            tone?: "danger" | "success" | "muted";
       };

export interface ReportTable {
     heading?: string;
     head?: string[];
     body: ReportCell[][];
     foot?: ReportCell[][];
}

export interface TableSourceResult {
     tables: ReportTable[];
     notes?: string[];
}

export type TableSource = () => Promise<TableSourceResult>;

const sources = new WeakMap<Element, TableSource>();

export function registerTableSource(element: Element, source: TableSource): () => void {
     sources.set(element, source);
     return () => {
          if (sources.get(element) === source) sources.delete(element);
     };
}

/** Nearest registered ancestor of `element`, not looking above `stopAt`. */
export function findTableSource(element: Element, stopAt: Element): { element: Element; source: TableSource } | null {
     let current: Element | null = element;
     while (current) {
          const source = sources.get(current);
          if (source) return { element: current, source };
          if (current === stopAt) break;
          current = current.parentElement;
     }
     return null;
}

export function cellText(cell: ReportCell | undefined): string {
     if (cell === undefined || cell === null) return "";
     return typeof cell === "string" ? cell : cell.content;
}
