
const MdsCompanyInformation = ({ companyInfo, styles, logourl }) => {
    // Split name by space, first word is large, rest is subname
    const nameParts = (companyInfo.name || '').split(' ');
    const largeName = nameParts[0] || '';
    const subName = nameParts.slice(1).join(' ');
    return (
        <header className={styles?.header}>
            <div className={styles?.logoSection}>
                <img src={logourl} alt="Lab Logo" className={styles?.logo} />
                <div>
                    <div className={styles?.labNameLarge}>{largeName}</div>
                    {subName && <div className={styles?.labSubName}>{subName}</div>}
                </div>
            </div>
            <div className={styles?.labContactHeader}>
                <div>{companyInfo.address}</div>
                <div className="d-flex">
                    <div>Phone No: {companyInfo.phonenumber}.</div>
                    <div> Email : {companyInfo.prNum}</div>
                </div>
            </div>
        </header>
    );
};

export default MdsCompanyInformation;
