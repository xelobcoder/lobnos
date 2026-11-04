import type { AnchorHTMLAttributes } from "react";
const application = { tenantId: "synthetic-only", branchid: 4, user: { employeeid: 9, role: "accountant", branchid: 4 }, session: { fixture: true } };
export const useApplication = () => application;
export const usePathname = () => "/accounting/nhis";
export default function Link({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
    return <a href={href} {...props} />;
}
