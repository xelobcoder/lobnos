import type { AnchorHTMLAttributes } from 'react';
export const useApplication = () => ({ user: { role: 'pharmacy_manager', employeeid: 9, branchid: 4 } });
export async function getRequestContext() { throw Error('No tenant credentials exist in the isolated browser harness.'); }
export default function Link({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a href={href} {...props}/>;
}
