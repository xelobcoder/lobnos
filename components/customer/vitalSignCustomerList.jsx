import React, { useEffect, useState } from 'react';
import { customFetch } from '../Auth/customFetch';
import VitalSignChartModal from './vitalSignChartModal';
import VitalSignTable from './VitalSignTable';
import VitalSignFilterForm from './VitalSignFilterForm';



export default function VitalSignCustomerListInformation({ searchParams }) {
    const { patientid } = searchParams;
    const [vitalSigns, setVitalSigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterFrom, setFilterFrom] = useState('');
    const [filterTo, setFilterTo] = useState('');
    const [modalData, setModalData] = useState({ show: false, date: '', vitalSigns: [] });

    async function getPatientVitalSigns(patientid, fromDate, toDate) {
        if (!patientid) return;
        try {
            let url = `customers/vitalsigns/create?patientid=${patientid}&count=10&page=1`;
            if (fromDate && toDate) {
                url += `&filterFrom=${fromDate}&filterTo=${toDate}`;
            }
            const response = await customFetch(url);
            setVitalSigns(response.vitalSigns);
        } catch (err) {
            console.error('Error fetching vital signs:', err);
            setError(`Failed to fetch vital signs: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getPatientVitalSigns(patientid, filterFrom, filterTo);
    }, [patientid]);

    const handleFilterChange = (e) => {
        if (e.target.name === 'filterFrom') {
            setFilterFrom(e.target.value);
        } else if (e.target.name === 'filterTo') {
            setFilterTo(e.target.value);
        }
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        getPatientVitalSigns(patientid, filterFrom, filterTo);
    };

    const groupByDate = (vitalSigns) => {
        return vitalSigns.reduce((acc, vitalSign) => {
            const date = new Date(vitalSign.date).toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(vitalSign);
            return acc;
        }, {});
    };

    const groupedVitalSigns = groupByDate(vitalSigns);

    const processVitalSignData = (vitalSigns) => {
        return vitalSigns.map(sign => ({
            time: convertTo12HourFormat(sign.time.split('.')[0]),
            bp: sign.bp,
            temperature: sign.temperature,
            pulse: sign.pulse,
            respiration: sign.respiration,
            spo2: sign.spo2
        }));
    };

    const convertTo12HourFormat = (time) => {
        let [hours, minutes, seconds] = time.split(':');
        hours = parseInt(hours, 10);

        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes}:${seconds} ${ampm}`;
    };


    const openModal = (date, vitalSigns) => {
        setModalData({ show: true, date, vitalSigns });
    };

    const closeModal = () => {
        setModalData({ show: false, date: '', vitalSigns: [] });
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;


    return (
        <div className="">
            <VitalSignFilterForm filterFrom={filterFrom} filterTo={filterTo} handleFilterChange={handleFilterChange} handleFilterSubmit={handleFilterSubmit} />
            
            <VitalSignTable groupedVitalSigns={groupedVitalSigns} openModal={openModal} />

            <VitalSignChartModal
                show={modalData.show}
                onHide={closeModal}
                vitalSigns={modalData.vitalSigns}
                date={modalData.date}
                generateChartData={processVitalSignData}
            />
        </div>
    );
}
