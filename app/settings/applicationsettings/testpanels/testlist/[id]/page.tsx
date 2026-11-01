"use client"
import { useEffect, useMemo, useState, useCallback, useRef, use } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { testPanelBasePath } from "../../../../../../lib/testPanelNavigation";
import { roleAllowed } from "../../../../../../components/Auth/roles";
import { useApplicationSettings } from "../../../../../../components/Auth/useApplicationContext";
import { CriticalPolicySettings } from '../../../../../../components/operations/TestOperationalSettings';
import TestForm from "../../../../../../components/settingsComponents/test/testForm";
import FieldsTab from "../../../../../../components/settingsComponents/test/tabs/FieldsTab";
import ProcedureManualTab from "../../../../../../components/settingsComponents/test/tabs/ProcedureManualTab";
import LiteratureTab from "../../../../../../components/settingsComponents/test/tabs/LiteratureTab";
import OutsourcingTab from "../../../../../../components/settingsComponents/test/tabs/OutsourcingTab";
import ReportSettingsTab from "../../../../../../components/settingsComponents/test/tabs/ReportSettingsTab";
import CalculationTab from "../../../../../../components/settingsComponents/test/tabs/CalculationTab";
import { customFetch } from "../../../../../../components/Auth/customFetch";
import {testEditorDetail} from '../../../../../../lib/testEditorData';
import ui from '../../../../../../components/Billing/billing-strategy/StrategyWorkspace.module.css';

type TestEditorTab = 'details' | 'fields' | 'calculations' | 'procedure' | 'literature' | 'outsourcing' | 'reportSettings' | 'criticalActions';

const TABS: { key: TestEditorTab; label: string }[] = [
    { key: 'details', label: 'Test Details' },
    { key: 'fields', label: 'Test Fields' },
    { key: 'calculations', label: 'Calculations' },
    { key: 'procedure', label: 'Procedure Manual' },
    { key: 'literature', label: 'Literature' },
    { key: 'outsourcing', label: 'Outsourcing' },
    { key: 'criticalActions', label: 'Critical-value actions' },
    { key: 'reportSettings', label: 'Report Settings' },
];

export default function SingleTestEdit(props: { params: Promise<{ id: number }> }) {
    const params = use(props.params);
    const router = useRouter();
    const basePath = testPanelBasePath(usePathname());
    const isOwner = roleAllowed(useApplicationSettings().applicationsettings.user?.role, ['admin']);
    const tabs = TABS.filter(tab => isOwner || !['outsourcing', 'criticalActions'].includes(tab.key));
    const searchParams = useSearchParams();
    const testid = params.id;
    const initialTab = (searchParams?.get('tab') as TestEditorTab) || 'details';
    const [activeTab, setActiveTab] = useState<TestEditorTab>(tabs.some((t) => t.key === initialTab) ? initialTab : 'details');
    const [testname, setTestname] = useState<string>('');
    const [nameError, setNameError] = useState('');
    const version = useRef(0);
    const loadName = useCallback(async () => {
        const ticket = ++version.current;
        setNameError('');
        try {
            const detail = testEditorDetail(await customFetch(`gettestpanel/edit?id=${testid}`));
            if (ticket === version.current) setTestname(detail.name);
        } catch (error) {
            if (ticket === version.current) setNameError(error instanceof Error ? error.message : 'Unable to load the test name.');
        }
    }, [testid]);

    useEffect(() => {
        setTestname('');
        void loadName();
        return () => { version.current++; };
    }, [loadName]);

    const handleNavigateTab = useMemo(() => (tab: 'fields' | 'outsourcing') => setActiveTab(tab), []);

    return (
        <section>
            {nameError && <div className={ui.error} role="alert"><span>{nameError}</span><button type="button" className={ui.secondary} onClick={() => void loadName()}>Retry test name</button></div>}
            <div className="mb-3 mx-2 d-flex justify-content-between align-items-center">
                <ul className="nav nav-tabs">
                    {tabs.map((tab) => (
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
                    onClick={() => router.push(`${basePath}/testlist`)}
                >
                    Back to Test List
                </button>
            </div>
            <div className="tab-content">
                {activeTab === 'details' && (
                    <TestForm key={testid} method="PUT" router={router} testid={testid} customtest={0} onNavigateTab={handleNavigateTab} canManageOutsourcing={isOwner} />
                )}
                {activeTab === 'fields' && (
                    <div className="mx-2"><FieldsTab key={testid} testid={testid} testname={testname} /></div>
                )}
                {activeTab === 'calculations' && (
                    <CalculationTab testid={Number(testid)} testname={testname} />
                )}
                {activeTab === 'procedure' && (
                    <ProcedureManualTab testid={testid} />
                )}
                {activeTab === 'literature' && (
                    <div className="mx-2"><LiteratureTab testid={testid} /></div>
                )}
                {isOwner && activeTab === 'outsourcing' && (
                    <div className="mx-2"><OutsourcingTab testid={testid} testname={testname} /></div>
                )}
                {isOwner && activeTab === 'criticalActions' && <CriticalPolicySettings testid={testid} />}
                {activeTab === 'reportSettings' && (
                    <div className="mx-2"><ReportSettingsTab testid={testid} testname={testname} /></div>
                )}
            </div>
        </section>
    )
}