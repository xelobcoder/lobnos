"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleActivation } from '../../components/Auth/registerclient';
import { customFetch, generateRandomTextAndNumbers, parseDate } from '@/lib/customFetch';
import Loader from '@/components/accessories/Loader';
import { ToastContainer, toast } from 'react-toastify';
import CustomersActions from '../../components/customer/CustomersActionDropDown';
import PrimeTable from '../../components/accessories/Datatables/PrimeTable';
import AsyncPatientFiltering from '@/components/accessories/SectorFileringComponents/AsyncCustomerFiltering';


interface Customer {
  patientid: number;
  date: string;
  fullname: string;
  dob: string;
  age: number;
  agetype: string;
  gender: string;
  contact: string;
  activation_status: "TRUE" | "FALSE";
}

interface TableColumn {
  Header: string;
  accessor: keyof Customer | '';
  Cell?: ({ value, row }: { value: any; row?: { original: Customer } }) => JSX.Element;
  filteringMode?: 'text' | 'date' | 'number';
}

interface ServerProcessingResult {
  result: Customer[];
  error: any;
}

export default function Activator() {
  const [loading, setLoading] = useState<boolean>(false);
  const [tempStore, setStore] = useState<Customer[]>([]);
  const router = useRouter();

  const handleBilling = (item: Customer) => {
    const { patientid } = item;
    if (patientid) {
      router.push(`/billing/patientid?patientid=${patientid}&&isNewTransaction=1`);
    } else {
      alert('Patientid not included')
    }
  };

  const callActivation = async (stat: string, ptid: number, toast: any, cb?: () => void) => {
    const status = await handleActivation(stat, ptid, toast, cb);
    if (status === true) {
      const prev = [...tempStore];
      const matchedIndex = prev.findIndex((item) => item.patientid === ptid);
      if (matchedIndex >= 0) {
        const desiredStatus = stat === 'TRUE' ? 'FALSE' : 'TRUE'
        prev[matchedIndex]['activation_status'] = desiredStatus;
      }
      setStore(prev);
    }
  };

  const gotoPrevTrans = (patientid: number) => {
    if (patientid) {
      const encodedId = `${generateRandomTextAndNumbers(50)}${patientid}`;
      window.open(`operations/laboratory/patientarchives/transactions?ptid=${encodedId}`)
    }
  };

  const columns: TableColumn[] = [
    { Header: 'patientid', accessor: 'patientid', },
    { Header: 'registered on', accessor: 'date', Cell: ({ value }) => { return <span>{parseDate(value)}</span> } },
    {
      Header: 'fullname', accessor: 'fullname', Cell: ({ value }) => <div className='text-capitalize'>{value}</div>,
      filteringMode: 'text'
    },
    {
      Header: "dob", accessor: "dob", Cell: ({ value }) => parseDate(value),
      filteringMode: 'date'
    },
    {
      Header: "age", accessor: "age", Cell: ({ row, value }) => {
        return <span>{value} {row.original.agetype}</span>
      }
    },
    { Header: "gender", accessor: "gender" },
    {
      Header: 'contact', accessor: 'contact',
      filteringMode: 'number'
    },
    {
      Header: 'activation status', accessor: 'activation_status', Cell: ({ value }) => {
        return <div className={`btn btn-sm border-2 p-1 ${value === "TRUE" ? "border-success" : "border-danger"}`}>
          {value === "TRUE" ? "active" : "inactive"}
        </div>
      }
    },
    {
      Header: 'more', accessor: '', Cell: ({ value, row }) => {
        const item = row.original;
        return (
          <CustomersActions
            handleBilling={handleBilling}
            item={item} callActivation={callActivation} gotoPrevTrans={gotoPrevTrans} toast={toast} router={router} />
        )
      }
    }
  ]

  useEffect(() => {
    customFetch(`customers`)
      .then((data: Customer[]) => {
        if (Array.isArray(data)) {
          setStore(data)
        }
      })
      .catch((err) => { console.log(err) })
  }, []);

  const filteredPatient = (options: Customer | undefined) => {
    const hasPatientid = typeof options === "object" && options?.hasOwnProperty('patientid');
    if (!hasPatientid) return;
    setStore([options]);
  };

  const handleSeverSideProcessing = async (values: { page: number; count: number }): Promise<ServerProcessingResult> => {
    try {
      const { page, count } = values;
      const response = await customFetch(`customers?page=${page}&&count=${count}`);
      if (Array.isArray(response)) {
        return { result: response, error: false }
      }
      return { result: [], error: 'Invalid response' }
    } catch (err) {
      return {
        result: [], error: err
      }
    }
  };

  if (loading) return <Loader w={50} h={50} />;

  return (
    <div className='p-2'>
        <ToastContainer theme='colored' position='top-center' className="text-sm" />
        <div className="col-md-8 col-sm-12 col-lg-4 my-2 d-lg-flex justify-content-end">
          <AsyncPatientFiltering getSelectedPatient={filteredPatient}  placeholder='Type client fullname' isDisabled={false}/> 
        </div>
        <div>
          {Array.isArray(tempStore) && tempStore.length > 0 && (
            <PrimeTable 
              column={columns}
              data={tempStore}
			  filtering={false}
              handleSeverSideProcessing={handleSeverSideProcessing}
              serverSideFiltering={true}
            />
          )}
        </div>
      </div>
  );
}


