"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleActivation } from '../../../components/Auth/registerclient';
import { customFetch, formatDateOrNA, parseDate } from '../../../components/Auth/customFetch';
import Loader from '../../../components/accessories/Loader';
import PatientFiltered from '../../../components/accessories/SectorFileringComponents/CustomerFiltering';
import CustomersActions from '../../../components/customer/CustomersActionDropDown';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import { toast } from 'react-toastify';
import { plsEncryption } from '../../../lib/encryption';
import { RiResetLeftFill } from '@remixicon/react';
import dayjs from 'dayjs';

interface Customer {
    patientid: string | number;
    fullpatientid: string;
    designation: string | null;
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
    whatAppcontact: string | null;
    fullname: string;
    contact: string;
}

export default function Activator() {
    const [loading, setLoading] = useState(false);
    const [tempStore, setStore] = useState<Customer[]>([]);
    const router = useRouter();





    const handleBilling = (item) => {
        const { patientid } = item;
        if (patientid) {
            const encryptedPatientId = plsEncryption(patientid.toString());
            router.push(`/billing/patientid/${encryptedPatientId}/multi`);
        } else {
            toast.error('Patientid not included')
        }
    };






    const callActivation = async (stat: string, ptid: string | number, toast: any, cb: any) => {
        const status = await handleActivation(stat, ptid, toast, cb);
        if (status == true) {
            const prev = [...tempStore];
            const matchedIndex = prev.findIndex((item) => item.patientid == ptid);
            if (matchedIndex >= 0) {
                const desiredStatus = stat == 'TRUE' ? 'FALSE' : 'TRUE'
                prev[matchedIndex]['activation_status'] = desiredStatus;
            }
            setStore(prev);
        }
    }


    const gotoPrevTrans = (patientid: string | number, fullname?: string) => {
        let encryptedId = patientid ? `${plsEncryption(patientid.toString())}` : '';
        let nameParam = '';
        if (fullname) {
            nameParam = `&fullname=${encodeURIComponent(fullname)}`;
        }
        window.open(`/operations/laboratory/patientarchives/${encryptedId}?patientid=${encodeURIComponent(patientid)}${nameParam}`);
    }



    const resetFiltering = async () => {
        try {
            setLoading(true)
            const data = await customFetch(`customers`)
            if (data && Array.isArray(data)) {
                setStore(data)
            }
        } catch (err) {
            toast.error("Error loading new data");
        } finally {
            setLoading(false);
        }
    }


    const columns = [
        { Header: 'PatientID', accessor: 'fullpatientid' },
        { Header: 'registered on', accessor: 'date', Cell: ({ value }) => { return <span>{dayjs(value).format('YYYY-MM-DD HH:mm:ss')}</span> } },
        {
            Header: 'fullname', accessor: 'fullname', Cell: ({ value }) => <div className='text-capitalize'>{value}</div>,
            filteringMode: 'text'
        },
        {
            Header: "dob", accessor: "dob", Cell: ({ value }) => formatDateOrNA(value),
            filteringMode: 'date'
        },
        {
            Header: "Age & Gender", accessor: '', Cell: ({ row }) => (
                <div>{row.original.age} {row.original.agetype}({row.original.gender === 'male' ? 'M' : 'F'})</div>
            )
        },
        {
            Header: 'contact', accessor: 'contact',
            filteringMode: 'number'
        },
        { Header: "registered By", accessor: "registeredbyusername" },
        // { Header: 'WhatsApp Contact', accessor: 'whatAppcontact' },
        // {
        //     Header: 'email', accessor: 'email',
        //     filteringMode: 'text'
        // },
        // {
        //     Header: 'occupation', accessor: 'occupation',
        //     filteringMode: 'text'
        // },
        // {
        //     Header: 'organization', accessor: 'organization',
        //     filteringMode: 'text'
        // },
        {
            Header: 'more', accessor: '', Cell: ({ value, row }) => {
                const item = row.original;
                return (
                    <CustomersActions
                        handleBilling={handleBilling}
                        item={item} callActivation={callActivation} gotoPrevTrans={() => gotoPrevTrans(item.patientid, item.fullname)} toast={toast} router={router} />
                )
            }
        }
    ]


    useEffect(() => {
        customFetch(`customers`)
            .then((data) => {
                if (Array.isArray(data)) {
                    setStore(data)
                }
            })
            .catch((err) => { console.log(err) })
    }, [])

    const filteredPatient = (options) => {
        const hasPatientid = typeof options === "object" && options.hasOwnProperty('patientid');
        if (!hasPatientid) return;
        const fullname = [options.firstname, options.middlename, options.lastname].filter(Boolean).join(' ');
        options = { ...options, fullname };
        setStore([options])
    };


    if (loading) {
        return (
            <Loader />
        )
    }



    const handleSeverSideProcessing = async (pagination: { count: number, page: number, sortby: 'ASC' | 'DESC' }) => {
        try {
            const { page, count, sortby = 'DESC' } = pagination;
            const response = await customFetch(`customers?page=${page}&&count=${count}&&sortby=${sortby}`);
            if (Array.isArray(response)) {
                return { result: response, error: false }
            } else {
                return { result: [], error: false }
            }
        } catch (err) {
            return { result: [], error: true }
        }
    }



    return (
        <div className='p-2'>
            <div className="col-md-8 col-sm-12 col-lg-6 my-2 d-lg-flex ">
                <div style={{ minWidth: '80%' }}>
                    <PatientFiltered isDisabled={false} getSelectedPatient={filteredPatient} />
                </div>
                <div className='mx-3' style={{ marginTop: '3px' }}>
                    <button className='btn btn-outline-danger btn-sm' onClick={() => { resetFiltering() }}> <RiResetLeftFill /> Reset </button>
                </div>
            </div>
            <div >
                {Array.isArray(tempStore)
                    && tempStore.length > 0
                    && <PrimeTable
                        column={columns}
                        data={tempStore}
                        handleSeverSideProcessing={handleSeverSideProcessing}
                        serverSideFiltering={true}
                    />}
            </div>
        </div>
    );
}


