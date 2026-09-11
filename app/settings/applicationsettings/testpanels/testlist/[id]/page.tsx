"use client"
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TestForm from "../../../../../../components/settingsComponents/test/testForm";
import FieldsTab from "../../../../../../components/settingsComponents/test/tabs/FieldsTab";
import ProcedureManualTab from "../../../../../../components/settingsComponents/test/tabs/ProcedureManualTab";
import LiteratureTab from "../../../../../../components/settingsComponents/test/tabs/LiteratureTab";
import OutsourcingTab from "../../../../../../components/settingsComponents/test/tabs/OutsourcingTab";
import ReportSettingsTab from "../../../../../../components/settingsComponents/test/tabs/ReportSettingsTab";
import { customFetch } from "../../../../../../components/Auth/customFetch";

type TestEditorTab = 'details' | 'fields' | 'procedure' | 'literature' | 'outsourcing' | 'reportSettings';

const TABS: { key: TestEditorTab; label: string }[] = [
    { key: 'details', label: 'Test Details' },
    { key: 'fields', label: 'Test Fields' },
    { key: 'procedure', label: 'Procedure Manual' },
    { key: 'literature', label: 'Literature' },
    { key: 'outsourcing', label: 'Outsourcing' },
    { key: 'reportSettings', label: 'Report Settings' },
];

export default function SingleTestEdit({ params }: { params: { id: number } }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const testid = params.id;
    const initialTab = (searchParams?.get('tab') as TestEditorTab) || 'details';
    const [activeTab, setActiveTab] = useState<TestEditorTab>(TABS.some((t) => t.key === initialTab) ? initialTab : 'details');
    const [testname, setTestname] = useState<string>('');

    useEffect(() => {
        customFetch(`gettestpanel/edit?id=${testid}`)
            .then((data: any) => setTestname(data?.name || ''))
            .catch(() => { });
    }, [testid]);

    const handleNavigateTab = useMemo(() => (tab: 'fields' | 'outsourcing') => setActiveTab(tab), []);

    return (
        <section>
            <div className="mb-3 mx-2 d-flex justify-content-between align-items-center">
                <ul className="nav nav-tabs">
                    {TABS.map((tab) => (
                        <li className="nav-item" key={tab.key} role="presentation">
                            <button
                                className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.key)}
                                type="button"
                                role="tab"
                                aria-selected={activeTab === tab.key}
                            >
                                {tab.label}
                            </button>
                        </li>
                    ))}
                </ul>
                <button
                    className="btn btn-outline-secondary btn-sm"
                    type="button"
                    onClick={() => router.push('/settings/applicationsettings/testpanels/testlist')}
                >
                    Back to Test List
                </button>
            </div>
            <div className="tab-content">
                {activeTab === 'details' && (
                    <TestForm method="PUT" router={router} testid={testid} customtest={0} onNavigateTab={handleNavigateTab} />
                )}
                {activeTab === 'fields' && (
                    <div className="mx-2"><FieldsTab testid={testid} testname={testname} /></div>
                )}
                {activeTab === 'procedure' && (
                    <ProcedureManualTab testid={testid} />
                )}
                {activeTab === 'literature' && (
                    <div className="mx-2"><LiteratureTab testid={testid} /></div>
                )}
                {activeTab === 'outsourcing' && (
                    <div className="mx-2"><OutsourcingTab testid={testid} testname={testname} /></div>
                )}
                {activeTab === 'reportSettings' && (
                    <div className="mx-2"><ReportSettingsTab testid={testid} testname={testname} /></div>
                )}
            </div>
        </section>
    )
}