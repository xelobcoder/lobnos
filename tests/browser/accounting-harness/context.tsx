import type { AnchorHTMLAttributes } from 'react';
import { useMemo } from 'react';
export const useApplication = () => ({ user: { role: 'pharmacy_manager', employeeid: 9, branch: 4, branchid: 4 } });
export const useSearchParams = () => useMemo(() => new URLSearchParams(location.search), [location.search]);
export const usePathname = () => location.pathname;
export async function getRequestContext() { throw Error('No tenant credentials exist in the isolated browser harness.'); }
export default function Link({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a href={href} {...props}/>;
}
