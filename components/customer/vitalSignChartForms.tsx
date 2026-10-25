'use client';
import { useState } from 'react';
import PatientFiltered from '../accessories/SectorFileringComponents/CustomerFiltering';
import VitalSigns from '../Practitioner/VitalSigns';
import care from '../Practitioner/Practitioner.module.css';
import s from './VitalSignsWorkspace.module.css';

export default function Form({ searchParams }: { searchParams: any }) {
    const initialId = Number(searchParams?.patientid);
    const [patientid, setPatientid] = useState(Number.isSafeInteger(initialId) && initialId > 0 ? initialId : 0);
    const [patient, setPatient] = useState<any>(null);
    const name = patient ? [patient.firstname, patient.middlename, patient.lastname].filter(Boolean).join(' ') : '';
    return <main className={`${care.page} ${s.workspace}`}>
        <header className={s.heading}><span className={s.icon} aria-hidden="true">♡</span><div><span className={s.eyebrow}>LABORATORY / PATIENT OBSERVATIONS</span><h1>Record vital signs</h1><p>Record measurements and review a patient's observation history.</p></div></header>
        <section className={s.searchCard} aria-labelledby="vitals-patient-title">
            <div className={s.cardTitle}><div><h2 id="vitals-patient-title">{patientid ? 'Selected patient' : 'Find a patient'}</h2><p>{patientid ? 'Confirm the patient before recording observations.' : 'Choose a search field, then enter at least 3 characters.'}</p></div></div>
            {patientid ? <div className={s.patientBanner}><span className={s.avatar} aria-hidden="true">{name ? name.charAt(0).toUpperCase() : '#'}</span><div><strong>{name || `Patient #${patientid}`}</strong><span>{patient?.fullpatientid || `Patient ID: ${patientid}`}{patient?.gender ? ` · ${patient.gender}` : ''}</span></div><button type="button" className={care.secondary} onClick={() => { if (window.confirm('Change patient? Any unsaved measurements will be discarded.')) { setPatientid(0); setPatient(null); } }}>Change patient</button></div> : <div className={s.search}><PatientFiltered isDisabled={false} placeholder="Type at least 3 characters to find a patient" getSelectedPatient={(selection: any) => {
                const selected = selection?.patient || selection;
                if (!selected || Array.isArray(selected) || !Number(selected.patientid)) return;
                setPatient(selected); setPatientid(Number(selected.patientid));
            }} /></div>}
        </section>
        {patientid ? <div className={s.observations}><VitalSigns key={patientid} patientid={patientid} showTrend={false} /></div> : <section className={s.empty}><span className={s.emptyIcon} aria-hidden="true">♡</span><h2>Ready to record observations</h2><p>Find and select a patient above to open their vital signs form.</p><div className={s.steps}><span>1. Select patient</span><span>2. Enter measurements</span><span>3. Save observations</span></div></section>}
    </main>;
}
