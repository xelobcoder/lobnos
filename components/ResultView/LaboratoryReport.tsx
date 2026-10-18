import type { ComponentProps, CSSProperties } from 'react';
import MdsCompanyInformation from './MdsCompanyInformation';
import MdsPersonalInformation from './MdsPersonalInformation';
import UseCustomResultTemplatingPreview from '../ResutlUI/useCustomResultTemplatingPreview';
import UseClinicalLiteratureReview from '../ResutlUI/UseClinicalLiteratureReview';
import UseResultCommentSinglePreview from '../ResutlUI/useResultCommentSinglePreview';
import UseResultEntryScientist from '../ResutlUI/UseResultEntryFormat';
import UseDisclaimer from '../ResutlUI/useDisclaimer';
import DrugsList from '../Drugs/DrugsList';
import VersionFooter from '../accessories/VersionFooter';
import Watermark from './Watermark';
import { defaultResultSettings, ResultSettings } from './result-settings';
import styles from '../../app/result/labreport/4/MDSLancet.Template.module.css';

export interface LaboratoryReportData {
    ascensionid?: number;
    patientid: number;
    billingid: number;
    companyInfo: ComponentProps<typeof MdsCompanyInformation>['companyInfo'] | null;
    patientInformation: ComponentProps<typeof MdsPersonalInformation>['patientInformation'] | null;
    referrerFacility?: ComponentProps<typeof MdsPersonalInformation>['referrerFacility'];
    records: ComponentProps<typeof UseCustomResultTemplatingPreview>['records'];
    resultsettings: ResultSettings | null;
    testname?: string | null;
    testInfo?: { reportitle?: string; method?: string; instrumentation?: string } | null;
    testdetailcategory?: ComponentProps<typeof UseCustomResultTemplatingPreview>['testdetailcategory'];
    samplingInformation?: { id?: number; billingid?: number; collectionEndDate?: string; resultEntryEnd?: string } | null;
    comments?: string | null;
    literatureReview?: string | null;
    hasDrugs?: boolean;
    drugList?: ComponentProps<typeof DrugsList>['drugList'];
    validators?: { username: string; employeeid: number }[];
    resultentry?: string | null;
    enteredOn?: string | null;
    lastupdatedon?: string | null;
    generalValidation?: { username: string };
    logourl: string;
}

export function resolveReportSettings(settings: ResultSettings | null): ResultSettings {
    return {
        ...defaultResultSettings, ...settings,
        companyInfo: { ...defaultResultSettings.companyInfo, ...settings?.companyInfo },
        patientInfo: { ...defaultResultSettings.patientInfo, ...settings?.patientInfo },
        testBody: { ...defaultResultSettings.testBody, ...settings?.testBody },
        comments: { ...defaultResultSettings.comments, ...settings?.comments },
    };
}

/** The same laboratory document is used by staff and by release-gated patient reports. */
export default function LaboratoryReport({ data, settings = resolveReportSettings(data.resultsettings), billingPrefix = '', showWatermark = false, framed = true }: {
    data: LaboratoryReportData; settings?: ResultSettings; billingPrefix?: string; showWatermark?: boolean; framed?: boolean;
}) {
    return (
        <div className={framed ? styles.page : undefined} data-laboratory-report style={{ '--font-family': settings.fontfamily } as CSSProperties}>
            <div className="result" style={{ position: 'relative' }}>
                {data.companyInfo && <MdsCompanyInformation styles={styles} logourl={data.logourl} resultsettings={settings} companyInfo={data.companyInfo} />}
                <div className={styles.reportTitleBar} style={{ '--bg-color': settings.mainReportHeaderBgColor, color: settings.mainReportHeaderColor } as CSSProperties}>
                    MEDICAL LABORATORY REPORT
                </div>
                {data.patientInformation && <MdsPersonalInformation styles={styles} patientInformation={data.patientInformation}
                    referrerFacility={data.referrerFacility}
                    labRef={`${billingPrefix}${data.samplingInformation?.billingid || data.billingid}(${data.samplingInformation?.id || data.ascensionid || ''})`}
                    collectionDate={data.samplingInformation?.collectionEndDate} finalReportDate={data.samplingInformation?.resultEntryEnd}
                    resultsettings={settings} />}
                <div style={{ width: '100%', margin: 0, position: 'relative' }}>
                    {showWatermark && data.companyInfo?.name && <Watermark text={data.companyInfo.name} subText={data.patientInformation?.fullpatientid || ''} />}
                    <section>
                        <UseCustomResultTemplatingPreview test={data.testInfo?.reportitle || data.testname || ''}
                            records={data.records} resultsettings={settings} testInfo={data.testInfo || undefined} testdetailcategory={data.testdetailcategory || undefined} />
                        {data.hasDrugs && !!data.drugList?.length && <DrugsList hadDrugs={data.hasDrugs} drugList={data.drugList} />}
                        <UseClinicalLiteratureReview literature={data.literatureReview} />
                        <UseResultCommentSinglePreview comments={data.comments || ''} resultsettings={settings} />
                        {settings.includeSignature && <div className="text-uppercase text-center mt-4 mb-2">
                            <UseResultEntryScientist validators={data.validators || []} lastupdatedon={data.lastupdatedon}
                                enteredOn={data.enteredOn} resultentry={data.resultentry} resultsettings={settings}
                                patientid={data.patientid} billingid={data.billingid} ascensionid={data.ascensionid || data.samplingInformation?.id}
                                useIndividualValidation={settings.useIndividualValidations} />
                        </div>}
                        {settings.showMethod && data.testInfo?.method && <div className="d-flex"><div className="fw-bold">Method: </div><p className="mx-1">{data.testInfo.method}</p></div>}
                        {settings.showMethod && data.testInfo?.instrumentation && <div className="d-flex"><div className="fw-bold">Instrumentation: </div><p className="mx-1">{data.testInfo.instrumentation}</p></div>}
                        {data.generalValidation && <div className="d-flex justify-content-center mt-2">
                            <div className="text-uppercase">{settings.useGeneraralValidation ? 'Verified By:' : 'Printed By:'}</div>
                            <div className="mx-2">{data.generalValidation.username}</div>
                        </div>}
                        <span className="text-muted d-flex justify-content-center text-sm">******End of Report ******</span>
                        {settings.includeLimitations && <UseDisclaimer disclaimer={settings.limitations} />}
                        <div className="mt-5 pdf-hide-footer"><VersionFooter /></div>
                    </section>
                </div>
            </div>
        </div>
    );
}
