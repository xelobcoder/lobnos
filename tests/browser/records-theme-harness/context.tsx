import type { AnchorHTMLAttributes } from "react";

const user = {
     employeeid: 1,
     role: new URLSearchParams(location.search).has("unauthorized") ? "scientist" : "admin",
     branchid: 1,
};

export const useApplication = () => ({ user, branchid: 1 });
export const useApplicationSettings = () => ({ applicationsettings: { user, branchid: 1 } });
export const useRouter = () => ({ push: (href: string) => location.assign(href) });
export const usePathname = () => location.pathname;
export default function Link({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
     return <a href={href} {...props} />;
}
