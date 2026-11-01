export function testPanelBasePath(pathname: string | null): string {
    return pathname?.startsWith('/operations/laboratory/test-panels')
        ? '/operations/laboratory/test-panels'
        : '/settings/applicationsettings/testpanels';
}
