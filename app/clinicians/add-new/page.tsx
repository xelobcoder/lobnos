"use client"
import BasicInformationClinician from "../../../components/Clinicians/BasicInformationClinician";
import ImageUploadClinician from "../../../components/Clinicians/ImageUploadClinician";
import ClinicianAuthenticationView from '../../../components/Clinicians/ClinicianAuthenticationView';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from '../../../components/common/DirectoryWorkspace.module.css';

export default function Clinicians() {
	const clinicianid = useSearchParams().get('clinicianid');
	return (
		<main className={styles.workspace}>
		<Link href="/clinicians" className={styles.back}>← Clinicians</Link>
		<header className={styles.header}><div><span className={styles.eyebrow}>CLINICIAN DETAILS</span><h1>{clinicianid ? 'Update clinician' : 'Add a clinician'}</h1><p>Keep professional and contact details current, then manage the clinician’s organization affiliations.</p></div>{clinicianid && <Link className="btn btn-outline-secondary" href={`/clinicians/clinicianview?clinicianid=${clinicianid}`}>View profile</Link>}</header>
		<div className={clinicianid ? styles.editLayout : ''}>
			{clinicianid && <aside className={styles.panel}>
				<ImageUploadClinician />
			</aside>}
			<div className={styles.panel}>
				<BasicInformationClinician />
                {clinicianid&&<ClinicianAuthenticationView/>}
			</div>
		</div>
		</main>
	);
}
