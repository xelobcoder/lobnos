"use client"
import { useEffect, useState } from 'react';
import type { ElementType } from 'react';
import { useRouter } from 'next/navigation';
import { handleActivation } from '../../../components/Auth/registerclient';
import { customFetch, customPost, formatDateOrNA, parseDate } from '../../../components/Auth/customFetch';
import Loader from '../../../components/accessories/Loader';
import PatientFiltered from '../../../components/accessories/SectorFileringComponents/CustomerFiltering';
import CustomersActions from '../../../components/customer/CustomersActionDropDown';
import { toast } from 'react-toastify';
import { plsEncryption } from '../../../lib/encryption';
import { RiResetLeftFill, RiRefreshLine, RiFileList3Line, RiErrorWarningLine, RiUser3Line, RiUserAddLine } from '@remixicon/react';
import dayjs from 'dayjs';
import PrimeTableV2 from '../../../components/accessories/Datatables/PrimeTableV2';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';


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

interface CustomerSummary {
    totalRecords: number;
    duplicateRecords: number;
    uniquePatients: number;
    registeredToday: number;
}

const CustomerSummaryCard = ({
    title,
    value,
    subtitle,
    Icon,
    variant,
}: {
    title: string;
    value: number;
    subtitle: string;
    Icon: ElementType;
    variant: string;
}) => (
    <div className={`card border-0 shadow-sm bg-${variant} bg-gradient text-white rounded-3 h-100`}>
        <div className="card-body p-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-xs text-uppercase fw-semibold opacity-75">{title}</span>
                <Icon size={22} className="opacity-75" />
            </div>
            <h3 className="fw-bold mb-0">{value.toLocaleString()}</h3>
            <span className="text-xs opacity-75">{subtitle}</span>
        </div>
    </div>
);

export default function Activator() {
    const [loading, setLoading] = useState(false);
    const [filterLoading, setFilterLoading] = useState(false);
    const [tempStore, setStore] = useState<Customer[]>([]);
    const [customerSummary, setCustomerSummary] = useState<CustomerSummary>({
        totalRecords: 0,
        duplicateRecords: 0,
        uniquePatients: 0,
        registeredToday: 0,
    });
    const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
    const [advancedFilteringState, setAdvancedFilteringState] = useState({
        firstname: '',
        lastname: '',
        middlename: '',
        patientid: '',
        email: '',
        mobile_number: '',
        gender: '',
        marital_Status: '',
        organization: '',
        occupation: ''
    })
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
            const [data, summary] = await Promise.all([
                customFetch(`customers`),
                customFetch(`customers/summary`),
            ]);
            if (data && Array.isArray(data)) {
                setStore(data)
            }
            if (summary && typeof summary === 'object' && !summary.error) {
                setCustomerSummary(summary);
            }
        } catch (err) {
            toast.error("Error loading new data");
        } finally {
            setLoading(false);
        }
    }


    const handleFilterApplication = async () => {
        const [key, value] = Object.entries(advancedFilteringState).find(([_, val]) => val.trim() !== '') || [];
        if (!key || !value) return toast.error("Please fill at least one field for filtering");
        try {
            setFilterLoading(true);
            let url = `customer/advanced/filter`;
            const response = await customPost(url, 'POST', advancedFilteringState);
            const { data, count, success } = response;
            if (success && Array.isArray(data)) {
                if (data.length === 0) {
                    toast.info("No records found matching the criteria");
                }

                setStore(data);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setFilterLoading(false);
        }
    }


    const columns = [
        { Header: 'PatientID', accessor: 'fullpatientid' },
        { Header: 'registered on', accessor: 'date', Cell: ({ value }) => { return <span>{dayjs(value).format('YYYY-MM-DD HH:mm:ss')}</span> } },
        {
            Header: 'fullname', accessor: 'fullname',
            Cell: ({ value, row }) => <div className='text-uppercase fw-bold bg-success-subtle'>
                {value ? value : 'N/A'}
                <br />
                {row.original.agetype ? row.original.age + ' ' + row.original.agetype : 'N/A'}({row.original.gender === 'male' ? 'M' : row.original.gender === 'female' ? 'F' : 'N/A'})
            </div>,
            filteringMode: 'text'
        },
        {
            Header: "dob", accessor: "dob", Cell: ({ value }) => formatDateOrNA(value),
            filteringMode: 'date'
        },
        {
            Header: "relative details", accessor: 'relativecontactname', Cell: ({ row }) => (
                <div>{row.original.relativecontactname ?
                    row.original.relativecontactname : 'N/A'
                } {row.original.relativecontactnumber ? row.original.relativecontactnumber : 'N/A'}</div>
            )
        },
        {
            Header: 'contact', accessor: 'contact',
            filteringMode: 'number'
        },
        { Header: "registered By", accessor: "registeredbyusername" },
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
        Promise.all([
            customFetch(`customers`),
            customFetch(`customers/summary`),
        ]).then(([data, summary]) => {
            if (Array.isArray(data)) {
                setStore(data)
            }
            if (summary && typeof summary === 'object' && !summary.error) {
                setCustomerSummary(summary);
            }
        })
            .catch((err) => { console.log(err) })
    }, [])

    const filteredPatient = (options: Array<{ patientid: number, [key: string]: unknown }> | { patientid: number, [key: string]: unknown }) => {
        if (Array.isArray(options)) {
            if (options.length === 0) {
                setStore([]);
                return;
            }
            const hasPatientid = options.every(opt => typeof opt === "object" && opt.hasOwnProperty('patientid'));
            if (!hasPatientid) return;
            const formattedOptions = options.map(opt => {
                const fullname = [opt.firstname, opt.middlename, opt.lastname].filter(Boolean).join(' ');
                return { ...opt, fullname };
            });
            setStore(formattedOptions as Customer[]);
            return;
        }

        const hasPatientid = typeof options === "object" && options.hasOwnProperty('patientid');
        if (!hasPatientid) return;
        const fullname = [options.firstname, options.middlename, options.lastname].filter(Boolean).join(' ');
        options = { ...options, fullname };
        setStore([options] as unknown as Customer[]);
    };


    if (loading) {
        return (
            <Loader />
        )
    }



    const handleSeverSideProcessing = async (
        pagination: {
            count: number,
            page: number,
            sortby?: 'ASC' | 'DESC',
            globalFilter?: string,
            columnFilters?: Array<{ id: string; value: unknown }>,
        },
    ) => {
        try {
            const { page, count, sortby = 'DESC', globalFilter = '', columnFilters = [] } = pagination;
            const params = new URLSearchParams({
                page: String(page),
                count: String(count),
                sortby,
            });

            if (globalFilter.trim()) {
                params.set('q', globalFilter.trim());
            }

            if (Array.isArray(columnFilters)) {
                columnFilters.forEach((entry) => {
                    const value = entry?.value == null ? '' : String(entry.value).trim();
                    if (entry?.id && value) {
                        params.set(entry.id, value);
                    }
                });
            }

            const response = await customFetch(`customers?${params.toString()}`);

            const rows = Array.isArray(response)
                ? response
                : Array.isArray((response as any)?.result)
                    ? (response as any).result
                    : Array.isArray((response as any)?.data)
                        ? (response as any).data
                        : Array.isArray((response as any)?.rows)
                            ? (response as any).rows
                            : [];

            const totalCount = Number(
                (response as any)?.totalCount
                ?? (response as any)?.count
                ?? (response as any)?.total,
            );

            const totalPages = Number(
                (response as any)?.totalPages
                ?? (response as any)?.pages
                ?? (response as any)?.lastPage,
            );

            return {
                result: rows,
                error: false,
                totalCount: Number.isFinite(totalCount) ? totalCount : undefined,
                totalPages: Number.isFinite(totalPages) ? totalPages : undefined,
            };
        } catch (err) {
            return { result: [], error: true }
        }
    }



    return (
        <div className='p-2'>
            <div className='row g-3 mb-3'>
                <div className='col-12 col-sm-6 col-xl-3'>
                    <CustomerSummaryCard
                        title="Total Patient Records"
                        value={customerSummary.totalRecords}
                        subtitle="All registered records"
                        Icon={RiFileList3Line}
                        variant="primary"
                    />
                </div>
                <div className='col-12 col-sm-6 col-xl-3'>
                    <CustomerSummaryCard
                        title="Duplicate Records"
                        value={customerSummary.duplicateRecords}
                        subtitle="Records needing identity review"
                        Icon={RiErrorWarningLine}
                        variant="danger"
                    />
                </div>
                <div className='col-12 col-sm-6 col-xl-3'>
                    <CustomerSummaryCard
                        title="Unique Patients"
                        value={customerSummary.uniquePatients}
                        subtitle="Distinct patient identities"
                        Icon={RiUser3Line}
                        variant="success"
                    />
                </div>
                <div className='col-12 col-sm-6 col-xl-3'>
                    <CustomerSummaryCard
                        title="Registered Today"
                        value={customerSummary.registeredToday}
                        subtitle="Patients added today"
                        Icon={RiUserAddLine}
                        variant="info"
                    />
                </div>
            </div>
            <div className='row g-2 mb-3 align-items-end'>
                <div className='col-12 col-md-6'>
                    <PatientFiltered isDisabled={false} getSelectedPatient={filteredPatient} />
                </div>
                <div className='col-12 col-md-6'>
                    <div className='d-flex flex-column flex-sm-row justify-content-md-end align-items-stretch gap-2'>
                        <button className='btn btn-success w-100 w-sm-auto' onClick={() =>  {
                            router.push('/crm/registration')
                        }}>+ Register New Client</button>
                        <button className='btn btn-primary w-100 w-sm-auto' onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}>Advanced Filtering</button>
                        <button
                            className='btn btn-outline-secondary w-100 w-sm-auto'
                            onClick={resetFiltering}
                            disabled={loading}
                            title="Refresh to get latest data"
                        >
                            <RiRefreshLine size={16} className={loading ? 'animate-spin' : ''} style={{ marginRight: '4px' }} />
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>
            </div>
            {/* advanced Filter */}
            {showAdvancedFilter &&
                <div style={{ padding: '12px', marginTop: '12px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px', alignItems: 'end' }}>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>First Name:</label>
                            <input
                                type="text"
                                placeholder="Enter first name"
                                style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '13px', boxSizing: 'border-box' }}
                                value={advancedFilteringState.firstname}
                                onChange={(ev) => { setAdvancedFilteringState({ ...advancedFilteringState, firstname: ev.target.value }) }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Middle Name:</label>
                            <input
                                type="text"
                                placeholder="Enter middle name"
                                style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '13px', boxSizing: 'border-box' }}
                                value={advancedFilteringState.middlename}
                                onChange={(ev) => { setAdvancedFilteringState({ ...advancedFilteringState, middlename: ev.target.value }) }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Last Name:</label>
                            <input
                                type="text"
                                placeholder="Enter last name"
                                style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '13px', boxSizing: 'border-box' }}
                                value={advancedFilteringState.lastname}
                                onChange={(ev) => { setAdvancedFilteringState({ ...advancedFilteringState, lastname: ev.target.value }) }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Patient ID:</label>
                            <input
                                type="text"
                                placeholder="Full Patient ID"
                                style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '13px', boxSizing: 'border-box' }}
                                value={advancedFilteringState.patientid}
                                onChange={(ev) => { setAdvancedFilteringState({ ...advancedFilteringState, patientid: ev.target.value }) }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Email:</label>
                            <input
                                type="email"
                                placeholder="Email address"
                                style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '13px', boxSizing: 'border-box' }}
                                value={advancedFilteringState.email}
                                onChange={(ev) => { setAdvancedFilteringState({ ...advancedFilteringState, email: ev.target.value }) }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Mobile:</label>
                            <input
                                type="text"
                                placeholder="Mobile number"
                                style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '13px', boxSizing: 'border-box' }}
                                value={advancedFilteringState.mobile_number}
                                onChange={(ev) => { setAdvancedFilteringState({ ...advancedFilteringState, mobile_number: ev.target.value }) }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Gender:</label>
                            <select
                                style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '13px', boxSizing: 'border-box' }}
                                value={advancedFilteringState.gender}
                                onChange={(ev) => { setAdvancedFilteringState({ ...advancedFilteringState, gender: ev.target.value }) }}
                            >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Marital Status:</label>
                            <select
                                style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '13px', boxSizing: 'border-box' }}
                                value={advancedFilteringState.gender}
                                onChange={(ev) => { setAdvancedFilteringState({ ...advancedFilteringState, marital_Status: ev.target.value }) }}
                            >
                                <option value="">Select</option>
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Divorced">Divorced</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Organization:</label>
                            <input
                                type="text"
                                placeholder="Organization"
                                style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '13px', boxSizing: 'border-box' }}
                                value={advancedFilteringState.organization}
                                onChange={(ev) => { setAdvancedFilteringState({ ...advancedFilteringState, organization: ev.target.value }) }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Occupation:</label>
                            <input
                                type="text"
                                placeholder="Occupation"
                                style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '13px', boxSizing: 'border-box' }}
                                value={advancedFilteringState.occupation}
                                onChange={(ev) => { setAdvancedFilteringState({ ...advancedFilteringState, occupation: ev.target.value }) }}
                            />
                        </div>

                        <div>
                            <button
                                style={{ padding: '6px 16px', backgroundColor: filterLoading ? '#6c757d' : '#007bff', color: 'white', border: 'none', borderRadius: '3px', fontSize: '13px', fontWeight: '500', cursor: filterLoading ? 'not-allowed' : 'pointer', opacity: filterLoading ? 0.7 : 1 }}
                                onClick={handleFilterApplication}
                                disabled={filterLoading}
                            >
                                {filterLoading ? 'Loading...' : 'Apply Filter'}
                            </button>
                        </div>

                    </div>
                </div>}

            <div >
                {Array.isArray(tempStore)
                    && tempStore.length > 0
                    && <PrimeTable
                        column={columns}
                        data={tempStore}
                        filtering={true}
                        handleSeverSideProcessing={handleSeverSideProcessing}
                        serverSideFiltering={true}

                    />}
            </div>
        </div>
    );
}


