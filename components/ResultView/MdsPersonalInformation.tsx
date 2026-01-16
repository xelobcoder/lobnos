import dayjs from 'dayjs';
import React from 'react';


interface PatientInformation {
    firstname: string;
    lastname: string;
    fullpatientid: string;
    age: number;
    middlename?: string;
    gender: string;
    agetype: string;
    dob?: string;
    organization: string;
}

interface ReferrerFacility {
    clinicianId?: number;
    organizationId?: number;
    facility_name?: string;
    facility_email?: string;
    facility_phone?: string;
    clinician_name?: string;
    clinician_email?: string;
    clinician_phone?: string;
}

interface MdsPersonalInformationProps {
    patientInformation: PatientInformation;
    referrerFacility?: ReferrerFacility | null;
    labRef?: string;
    collectionDate?: string;
    receivedDate?: string;
    isBulk?: boolean;
    finalReportDate?: string;
    styles?: { [key: string]: string };
    resultsettings?: any;
}

const MdsPersonalInformation: React.FC<MdsPersonalInformationProps> = ({
    patientInformation,
    referrerFacility,
    labRef,
    collectionDate,
    receivedDate,
    isBulk = false,
    finalReportDate,
    styles = {},
    resultsettings
}) => {
    const mySavedLabRef = labRef || 'N/A';

    return (
        <section className={styles.patientInfoSection} style={{ fontFamily: resultsettings?.patientInfo?.fontFamily || 'inherit' }}>
            <div className={styles.infoBlock}>
                <div className={styles.infoPair}>
                    <span className={styles.infoLabel}>Patient Name</span>: <span className={styles.infoValue}>{`${patientInformation.firstname} ${patientInformation.middlename} ${patientInformation.lastname}`}
                    </span>
                </div>
                <div className={styles.infoPair}>
                    <span className={styles.infoLabel}>Patient Ref</span>: <span className={styles.infoValue}>{patientInformation.fullpatientid}</span>
                </div>
                <div className={styles.infoPair}>
                    <span className={styles.infoLabel}>Age/Sex</span>: <span className={styles.infoValue}>{patientInformation.age} {patientInformation.agetype} ({patientInformation.gender.toString().split('')[0].toUpperCase() || 'N/A'})</span>
                </div>
            </div>
            <div className={styles.infoBlock}>
                <div className={styles.infoPair}>
                    <span >Lab Ref.</span>: <span className='fw-bold mx-2'>{mySavedLabRef}</span>
                </div>
                {!isBulk ? (<div className={styles.infoBlock}>
                    <div className={styles.infoPair}>
                        <span className={styles.infoLabel}>Collection Date</span>:
                        <span className={styles.infoValue}>{collectionDate ? dayjs(collectionDate).format('YYYY-MM-DD') : ''}</span>
                        <span style={{ marginLeft: '5px' }}>{collectionDate ? dayjs(collectionDate).format('hh:mm A') : ''}</span>
                    </div>
                    <div className={styles.infoPair}>
                        <span className={styles.infoLabel}>FINAL Report Date</span>:
                        <span className={styles.infoValue}>{finalReportDate ? dayjs(finalReportDate).format('YYYY-MM-DD') : ''}</span>
                        <span style={{ marginLeft: '5px' }}>{finalReportDate ? dayjs(finalReportDate).format('hh:mm A') : ''}</span>
                    </div>
                </div>) : (
                    <div className={styles.infoBlock}>
                        <div className={styles.infoPair}>
                            <span className={styles.infoLabel}>Print Date </span>:
                            <span className={styles.infoValue}>{dayjs().format('YYYY-MM-DD')}</span>
                            <span style={{ marginLeft: '5px' }}>{dayjs().format('hh:mm A')}</span>
                        </div>
                        {referrerFacility && referrerFacility.facility_name && (
                            <div className={styles.infoPair}>
                                <span className={styles.infoLabel}>Facility</span>: <span className={styles.infoValue}>{referrerFacility.facility_name}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
             { !isBulk && referrerFacility && referrerFacility.facility_name && (
                            <div className={styles.infoPair}>
                                <span className={styles.infoLabel}>Referring Facility Name</span>: <span className={styles.infoValue}>{referrerFacility.facility_name}</span>
                            </div>
                        )}
            
        </section>
    );
};

export default MdsPersonalInformation;
