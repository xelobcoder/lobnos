"use client"
import { parseDate } from "../../components/Auth/customFetch";
import { plsEncryption } from "../../lib/encryption";
import PrimeTable from "../accessories/Datatables/PrimeTable";
import { handleSeverSideProcessingRejectedSample } from "../serverActions/ActionFiltering";

export default function RejectedSamplesComponent({ data }) {

	const columns = [
		{ Header: 'fullname', accessor: 'fullname', Cell: ({ value }) => <div className="text-capitalize">{value}</div> },
		{
			Header: 'details', accessor: 'age', Cell: ({ value, row }) => {
				const { gender, mobilenumber } = row.original;
				return (<div>{value}{" || "}{gender}{" || "}{mobilenumber}</div>)
			}
		},

		{ Header: 'test', accessor: 'testname', Cell: ({ value }) => <span className="border-bottom border-danger border-2">{value}</span> },
		{ Header: 'collected on', accessor: "collectionEndDate", Cell: ({ value }) => parseDate(value) },
		{ Header: 'collected by', accessor: "sampleCollectedBy" },
		{ Header: 'validated On', accessor: "samplevalidatedon", Cell: ({ value }) => <div>{new Date(value).toLocaleDateString()}</div> },
		{ Header: 'last validated by', accessor: 'validatedby', Cell: ({ value }) => <div>{value}</div> },
		{ Header: 'reason', accessor: 'rejectionmessage', width: 200 },
		{
			Header: 'actions', accessor: '', Cell: ({ row }) => {
				const item = row.original;
				return (
					<div className="d-flex justify-content-between pls-color">
						<button className="btn btn-sm btn-secondary pls-color"
							onClick={() => {
								window.open(`/operations/laboratory/sample/rejected/history?ascensionid=${plsEncryption(item.ascensionid.toString())}`)
							}}>
							history
						</button>
						<button className="btn btn-sm btn-warning mx-1 pls-color">redraw</button>
					</div>
				)
			}
		}
	]


	return (
		<>
			<h6>Rejected Sample List</h6>
			<section className="ui">
				<PrimeTable column={columns} data={data} filtering={false} serverSideFiltering={true} handleSeverSideProcessing={handleSeverSideProcessingRejectedSample}/>
			</section>
		</>
	)
}