import CompanyHeaders from "./CompanyHeaders";
import CompanyHeadersDONDEE from "./CompanyHeadersDONDEE";
import CompanyHeadersFULLWIDTH from "./CompanyHeadersFULLWIDTH";
import { ResultSettings } from "./result-settings";
import { scopedCompanyImageUrl } from "../../lib/companyImage";

interface MdsCompanyInformationProps {
    companyInfo: {
        name: string;
        address: string;
        street?: string;
        phonenumber: string;
        email: string;
        prNum: string;
        alternativenumber?: string;
        additionalInfo?: string;
    };
    styles: any;
    logourl: string;
    resultsettings: ResultSettings;
    subsequent?: boolean;
}

const MdsCompanyInformation = ({ companyInfo, styles, logourl, resultsettings, subsequent }: MdsCompanyInformationProps) => {
    const nameParts = (companyInfo.name || '').split(' ');
    const largeName = nameParts[0] || '';
    const subName = nameParts.slice(1).join(' ');
    const isBreakName = resultsettings?.companyInfo?.breakname || false;


    if (isBreakName && nameParts.length > 1) {
        return (
            <header className={styles?.header}>
                <div className={styles?.logoSection}>
                    {scopedCompanyImageUrl(logourl) && <img src={scopedCompanyImageUrl(logourl)} alt="Lab Logo" className={styles?.logo} />}
                    <div>
                        <div className={styles?.labNameLarge} style={{ fontSize: resultsettings.companyInfo.namefontsize || '20px', fontFamily: resultsettings.companyInfo.fontFamily || 'inherit' }}>{largeName}</div>
                        <div className={styles?.labNameSub} style={{ fontSize: resultsettings.companyInfo.subnameFontSize || '4px', fontFamily: resultsettings.companyInfo.fontFamily || 'inherit' }}>{subName}</div>
                    </div>
                </div>
                <div className={styles?.labContactHeader}>
                    <div>{companyInfo.address}</div>
                    {companyInfo.street && <div>{companyInfo.street}</div>}
                    <div className="d-flex">
                        <div>Phone No: {companyInfo.phonenumber} ||  {companyInfo.alternativenumber}</div>
                        <div> Email : {companyInfo.prNum}</div>
                    </div>
                </div>
            </header>
        )
    }


    const headerProps = {
        companyInfo: {
            name: companyInfo.name,
            address: companyInfo.address,
            street: companyInfo.street,
            phonenumber: Number(companyInfo.phonenumber),
            email: companyInfo.email || companyInfo.prNum,
            alternativenumber: companyInfo.alternativenumber,
            additionalInfo: companyInfo.additionalInfo
        },
        resultsettings,
        logo: logourl,
        subsequent
    };


    const headerType = resultsettings?.companyInfo?.headerType || 'default';

    return (
        <>
            {headerType === 'default' && <CompanyHeaders {...headerProps} />}
            {headerType === 'dondee' && <CompanyHeadersDONDEE {...headerProps} />}
            {headerType === 'fullwidth' && <CompanyHeadersFULLWIDTH {...headerProps} />}
        </>
    );
};

export default MdsCompanyInformation;
