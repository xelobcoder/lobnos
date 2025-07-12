'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { defaultResultSettings, customFetch } from '../../../components/Auth/customFetch';
import CompanyHeaders from '../../../components/ResultView/CompanyHeaders';
import PersonalInformation from '../../../components/ResultView/PersonalInformation';
import UseClinicalLiteratureReview from '../../../components/ResutlUI/UseClinicalLiteratureReview';
import UseCustomResultTemplatingPreview from '../../../components/ResutlUI/useCustomResultTemplatingPreview';
import UseResultCommentSinglePreview from '../../../components/ResutlUI/useResultCommentSinglePreview';
import VersionFooter from '../../../components/accessories/VersionFooter';
import UseDisclaimer from '../../../components/ResutlUI/useDisclaimer';
import UseResultEntryScientist from '../../../components/ResutlUI/UseResultEntryFormat';

import { RiPrinterLine, RiArrowLeftLine, RiPrinterCloudFill } from '@remixicon/react'; // 🎯 Remix Icons

interface ResultSettings {
    letterHeading: number;
    literatureReview: number;
    DepartmentEntry: number;
    passwordonResult: number;
    samplingInformation: number;
}

interface Record {
    id: number;
    testid: number;
    name: string;
    field: string;
    value: string;
    hasunits: number;
    units: string;
    plan: string;
    ordering: number;
    textReference: string;
    upperlimit: string;
    lowerlimit: string;
    category: string | null;
    options: string;
    undercategory: number;
    categoryid: number | null;
    ascensionid: number;
    billingid: number;
    patientid: number;
    originalvalue: string;
    created_on: string;
    updated_on: string;
    employeeid: number;
    entrymode: string;
    fieldid: number;
}

interface CompanyInfo {
    name: string;
    email: string;
    motto: string;
    phonenumber: number;
    address: string;
    website: string;
    street: string;
    alternativenumber: number;
}

interface PatientInformation {
    patientid: number;
    fullpatientid: string;
    designation: string;
    firstname: string;
    email: string;
    dob: string;
    age: number;
    gender: string;
    marital_status: string;
    mobile_number: string;
    agetype: string;
    occupation: string;
    date: string;
    activation_status: string;
    lastname: string;
    middlename: string;
    organization: string;
    contactpointer: string;
    whatAppcontact: string;
}

interface Validator {
    username: string;
    employeeid: number;
    role: string;
}

interface DrugItem {
    ascensionid: number;
    id: number;
    sensitivity: string;
    drug: string;
}

interface ResultData {
    resultsettings: ResultSettings;
    records: Record[];
    companyInfo: CompanyInfo;
    patientInformation: PatientInformation;
    comments: string;
    testname: string;
    validators: Validator[];
    hasDrugs: boolean;
    patientid: number;
    billingid: number;
    lastupdatedon: string;
    logourl: string;
    enteredOn: string;
    resultentry: string;
    literatureReview: string | null;
    drugList: DrugItem[];
}

export default function RESULT_FOR_PRINTING() {
    const [resultsettings, setResultSettings] = useState(defaultResultSettings);
    const [loader, setLoader] = useState(false);
    const [resultdata, setResultData] = useState<ResultData | null>(null);

    const searchParams = useSearchParams();
    const billingid = searchParams?.get('csvid') || '';
    const test = searchParams?.get('testname') || '';
    const target = searchParams?.get('target') || '';
    const ascensionid = searchParams?.get('ascensionId') || ';'
    const ptid = searchParams?.get('ptid') || '';
    const testid = searchParams?.get('testid');
    const csvid = searchParams?.get('csvid');

    const url = `result/printout/ascension/getResult?csvid=${csvid}&&testid=${testid}&&testname=${test}&tenantId=3&ptid=${ptid}&&ascensionId=${ascensionid}&&isMultiple=false&&isUltrasound=false&&is_password_encrypted=false&target=${target}&password=`;

    useEffect(() => {
        customFetch(url)
            .then((data) => setResultData(data))
            .catch((err) => console.error(err))
            .finally(() => { setLoader(false) });
    }, []);

    if (loader) return <h4>Loading .....</h4>;
    if (!resultdata?.records) return <h4></h4>;

    return (
        <div className='result-print-out'>
            <div id='header-user-view' className='bg-dark text-white p-4 col-12 text-capitalize d-flex align-items-center gap-2 d-flex  justify-content-between'
                
            >
                
                <h5 className="mb-0"><RiArrowLeftLine size={20} />Result Print Out</h5>
                <button className='btn btn-secondary'>
                   <RiPrinterCloudFill/> Print Result Out 
                </button>
            </div>

            {/* Main */}
            <main className='d-flex'>
                <div className='col-2 forged-sidebar'></div>
                <div className='col-10'>
                    <div className="single_result_page ui bg-secondary">
                        <div className="result bg-white mt-5">
                            <section>
                                <CompanyHeaders
                                    companyInfo={
                                        resultdata?.companyInfo
                                            ? {
                                                ...resultdata.companyInfo,
                                                alternativenumber: resultdata.companyInfo.alternativenumber?.toString()
                                            }
                                            : null
                                    }
                                    logo={resultdata?.logourl}
                                />
                                <PersonalInformation
                                    PersonalInformation={{
                                        ...(resultdata?.patientInformation
                                            ? {
                                                ...resultdata.patientInformation,
                                                patientid: resultdata.patientInformation.patientid.toString(),
                                                fullpatientid: resultdata.patientInformation.fullpatientid
                                                    ? resultdata.patientInformation.fullpatientid
                                                    : ''
                                            }
                                            : { fullpatientid: '' }),
                                    }}
                                    billingid={resultdata?.billingid}
                                />
                            </section>

                            <section>
                                <UseCustomResultTemplatingPreview
                                    test={resultdata?.testname}
                                    records={resultdata?.records}
                                />
                                <UseResultCommentSinglePreview comments={resultdata.comments} />
                                <UseClinicalLiteratureReview literature={resultdata.literatureReview} />
                            </section>
                            <section>
                                <UseResultEntryScientist
                                    lastupdatedon={resultdata?.lastupdatedon}
                                    validators={resultdata.validators}
                                    resultentry={resultdata.resultentry}
                                    enteredOn={resultdata.enteredOn}
                                />
                                <UseDisclaimer />
                                <VersionFooter />
                            </section>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
