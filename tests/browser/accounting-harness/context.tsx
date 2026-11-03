import type { AnchorHTMLAttributes } from 'react';
import { useMemo } from 'react';
export const useApplication = () => {
  const query = new URLSearchParams(location.search);
  return { user: { role: query.has('asAdmin') ? 'admin' : query.has('asStorekeeper') ? 'pharmacy_storekeeper' : query.has('asAccountant') ? 'pharmacy_accountant' : 'pharmacy_manager', employeeid: query.has('asReviewer') ? 10 : 9, branch: 4, branchid: 4 } };
};
export const useSearchParams = () => useMemo(() => new URLSearchParams(location.search), [location.search]);
export const usePathname = () => location.pathname;
export const useRouter = () => ({ push: (href: string) => location.assign(href) });
export async function getRequestContext() { throw Error('No tenant credentials exist in the isolated browser harness.'); }
export default function Link({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a href={href} {...props}/>;
}
