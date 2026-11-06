import { laboratoryDate } from "../../../lib/laboratoryPresentation";
import { fnTiming } from "./Lib"; 


export const getValidationColumns = (handleViewResult, ActionDropdown,openModal) => [
     {
          Header: '#',
          accessor: '',
          width: 20,
          Cell: ({ row }) => <input type="checkbox" {...row.getToggleRowSelectedProps()} />
     },
     {
          Header: "Fullname",
          accessor: "fullname",
          width: 150,
          Cell: ({ value, row }) => <div className="text-uppercase">{value}<br />{row.original.age}</div>
     },
     {
          Header: "Patient ID",
          accessor: "patientid",
          width: 60
     },
     {
          Header: "Test Name",
          accessor: "name",
          width: 150
     },
     {
          Header: "Processing",
          accessor: "processing",
          width: 150,
          Cell: ({ row }) => fnTiming(row.original)
     },
     {
          Header: "Results",
          accessor: "results",
          width: 150,
          Cell: ({ row }) => (
               <div className="list-group p-0 bg-secondary-subtle">
                    <span className="list-group-item p-0" key={`start-${row.original.patientid}`}>
                         {laboratoryDate(row.original.resultEntryStart)}
                    </span>
                    <span className="list-group-item p-0" key={`end-${row.original.patientid}`}>
                         {laboratoryDate(row.original.resultEntryEnd)}
                    </span>
               </div>
          ),
     },
     {
          Header: 'Action',
          accessor: "action",
          width: 50,
          Cell: ({ row }) => (
               <ActionDropdown
                    onValidate={() => { openModal(row.original)}}
                    onViewResult={() => handleViewResult(row.original)}
               />
          ),
     }
];
