"use client";
import { UltrasoundStagesProvider } from '../../../../../components/operations/Ultrasound/UltrasoundContext';
import UltrasoundAscensionFiltering from '../../../../../components/operations/Ultrasound/UtrasoundFiltering';
import AscentionUltrasoundUnCompletedTable from '../../../../../components/operations/Ultrasound/UncompletedUltrasoundWaitingListTable';
import { useApplicationSettings } from '../../../../../components/Auth/useApplicationContext';
import Authorization from '../../../../../components/accessories/authorization';


export default function UltrasonograhyCompletedList() {
	const { applicationsettings } = useApplicationSettings();
	const { employeeid, role } = applicationsettings.user;

	if (!employeeid) return null

	if (employeeid && ['admin', 'sonographer'].includes(role) === false) {
		return <Authorization />
	}

	return (
		<UltrasoundStagesProvider>
			<UltrasoundAscensionFiltering employeeid={employeeid} ascension_stage={'ULTRASOUND_COMPLETED'} />
			<AscentionUltrasoundUnCompletedTable stage={'ULTRASOUND_COMPLETED'} />
		</UltrasoundStagesProvider>
	)
}