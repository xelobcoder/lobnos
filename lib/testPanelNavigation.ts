export function testPanelBasePath(pathname: string | null): string {
    if (pathname?.startsWith('/master-platform/test-catalog')) return '/master-platform/test-catalog';
    return pathname?.startsWith('/operations/laboratory/test-panels')
        ? '/operations/laboratory/test-panels'
        : '/settings/applicationsettings/testpanels';
}
