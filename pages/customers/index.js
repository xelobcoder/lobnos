import { useEffect, useState, } from 'react';
import { useRouter } from 'next/navigation';
import { handleActivation } from '../../components/Auth/registerclient';
import { customFetch, generateRandomTextAndNumbers, parseDate } from '../../components/Auth/customFetch';
import FrontDeskLayout from '../../components/Layout/FrontDeskLayout';
import Loader from '../../components/accessories/Loader';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TableDisplay from '../../components/accessories/TableDisplay';
import { ToastContainer, toast } from 'react-toastify';
import { Dropdown } from 'react-bootstrap';
import PatientFiltered from '../../components/accessories/CustomerFiltering';
import CustomersActions from '../../components/customer/CustomersActionDropDown';
import Pagination from '../../components/accessories/pagination';



export default function Activator() {
	const [loading, setLoading] = useState(false);
	const [tempStore, setStore] = useState([]);
	const router = useRouter();





	const handleBilling = (item) => {
		const { patientid } = item;
		if (patientid) {
			router.push(`/billing/patientid?patientid=${patientid}&&isNewTransaction=1`);
		} else {
			alert('Patientid not included')
		}
	};






	const callActivation = async (stat, ptid, toast, cb) => {
		const status = await handleActivation(stat, ptid, toast, cb);
		if (status == true) {
			const prev = [...tempStore];
			const matchedIndex = prev.findIndex((item, index) => item.patientid == ptid);
			if (matchedIndex >= 0) {
				const desiredStatus = stat == 'TRUE' ? 'FALSE' : 'TRUE'
				prev[matchedIndex]['activation_status'] = desiredStatus;
			}
			setStore(prev);
		}
	}


	const gotoPrevTrans = (item) => {
		let { patientid } = item;
		if (patientid) {
			patientid = `${generateRandomTextAndNumbers(50)}${patientid}`;
		}
		window.open(`operations/laboratory/patientarchives/transactions?ptid=${patientid}`)
	}






	const columns = [
		{ Header: 'patientid', accessor: 'patientid' },
		{ Header: 'registered on', accessor: 'date', Cell: ({ value }) => { return <span>{parseDate(value)}</span> } },
		{ Header: 'fullname', accessor: 'fullname', Cell: ({ value }) => <div className='text-capitalize'>{value}</div> },
		{ Header: "dob", accessor: "dob", Cell: ({ value }) => parseDate(value) },
		{
			Header: "age", accessor: "age", Cell: ({ row, value }) => {
				return <span>{value} {row.original.agetype}</span>
			}
		},
		{ Header: "gender", accessor: "gender" },
		{ Header: 'contact', accessor: 'contact' },
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
		setStore([options])
	};


	if (loading) {
		return (
			<FrontDeskLayout>
				<Loader />
			</FrontDeskLayout>
		)
	}



	return (
		<FrontDeskLayout>
			<ToastContainer theme='colored' position='top-center' className="text-sm" />
			<div className="col-md-8 col-sm-12 col-lg-4 my-2 d-lg-flex justify-content-end">
				<PatientFiltered getSelectedPatient={filteredPatient} />
			</div>
			<div >
				{Array.isArray(tempStore) && tempStore.length > 0 && <TableDisplay  styling={'ttable table'} minHeight={'50vh'} column={columns} data={tempStore} showpage={false} exporters={false} />}
			</div>
			<div className=' d-lg-flex  justify-content-lg-center d-sm-block'>
				<Pagination/>
			</div>
		</FrontDeskLayout>
	);
}


