import type { Link } from "../components/Layout/links/types";

export type RibbonTab = { id: string; title: string; items: Link[] };
export type RibbonGroup = { title: string; commands: Link[] };

export function buildRibbonTabs(links: Link[]): RibbonTab[] {
    const direct = links.filter(item => !item.children?.length && item.link);
    const sections = links.filter(item => item.children?.length);
    return [
        ...(direct.length ? [{ id: "workspace", title: "Workspace", items: direct }] : []),
        ...sections.map((item, index) => ({
            id: `section-${index}`,
            title: item.title,
            items: [item],
        })),
    ];
}

export function buildRibbonGroups(items: Link[], title: string): RibbonGroup[] {
    const groups: RibbonGroup[] = [];
    const visit = (entries: Link[], heading: string) => {
        const commands = entries.filter(item => item.link);
        if (commands.length) groups.push({ title: heading, commands });
        for (const item of entries) {
            if (item.children?.length) {
                visit(item.children, heading === title ? item.title : `${heading} / ${item.title}`);
            }
        }
    };
    visit(items, title);
    return groups;
}

export function findActiveNavigationPath(links: Link[], pathname: string): Link[] {
    let best: Link[] = [];
    let longest = -1;
    const visit = (items: Link[], parents: Link[]) => {
        for (const item of items) {
            const path = [...parents, item];
            const destination = item.link.split(/[?#]/)[0];
            if (destination && (pathname === destination ||
                (destination !== "/" && pathname.startsWith(`${destination}/`))) &&
                (destination.length > longest || (destination.length === longest && path.length > best.length))) {
                best = path;
                longest = destination.length;
            }
            if (item.children?.length) visit(item.children, path);
        }
    };
    visit(links, []);
    return best;
}
