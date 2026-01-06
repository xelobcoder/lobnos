import { RiCheckboxMultipleLine, RiPlayCircleLine, RiStopCircleLine } from '@remixicon/react';
import { useState } from "react";
import { customPost } from "../../Auth/customFetch";
import { useApplicationSettings } from "../../Auth/useApplicationContext";
import PrimeTable from "../../accessories/Datatables/PrimeTable";
import { useLaboratoryContext } from "./LaboratoryStagesContext";
import { fnTiming } from "./Lib";
import ProcessingButtons from "./ProcessingButtons";
import { handleServerSideProcessingAscensionData } from "../../serverActions/ActionFiltering";
import dayjs from 'dayjs';

export default function AscensionProcessingTable() {
    const { isLoading, collection, queryParams, toast, setCollection } = useLaboratoryContext();
    const [bulkselection, setBulkSelection] = useState([]);
    const [selectstatus, setSelectStatus] = useState(false);
    const [currentBulkStatus, setCurrentBulkStatus] = useState({ action: null, target: null });
    const { applicationsettings } = useApplicationSettings();
    const { user } = applicationsettings;
    const employeeid = user?.employeeid;

    const toggleRowSelected = (ascensionid) => {
        const isSelected = bulkselection.some(item => item.ascensionid === ascensionid);
        if (isSelected) {
            setBulkSelection(bulkselection.filter(item => item.ascensionid !== ascensionid));
        } else {
            const itemToAdd = collection.find(item => item.ascensionid === ascensionid);
            if (itemToAdd) {
                setBulkSelection([...bulkselection, itemToAdd]);
            }
        }
    };

    const selectAllAscension = () => {
        if (selectstatus === false) {
            const updatedCollection = collection.map(item => ({ ...item, isSelected: true }));
            setBulkSelection(updatedCollection);
            setSelectStatus(true);
        } else {
            const updatedCollection = collection.map(item => ({ ...item, isSelected: false }));
            setBulkSelection([]);
            setSelectStatus(false);
        }
    };

    const updateTestCollectionAfterUpdate = (ascensionid, updateItem) => {
        const prev = [...collection];
        const indexOfAscensionId = prev.findIndex((single) => single.ascensionid === ascensionid);
        if (indexOfAscensionId >= 0) {
            prev[indexOfAscensionId] = updateItem;
        }
        setCollection(prev);
    };

    const bulkProcessingUpdate = async (action) => {
        if (bulkselection.length === 0) {
            toast.warning(`Please Select One or More Tests`);
            return;
        }

        const value = new Date().toISOString();
        const stage = action === "start" ? "processingStartDate" : "processingEndDate";
        const successAscensions = [];

        const handleProcessing = async (item) => {
            const { ascensionid, testid, processingStartDate, processingEndDate } = item;
            if ((action === "start" && processingStartDate) || (action === "stop" && processingEndDate)) return;

            const selectedItem = { ascensionid, testid, value, employeeid, stage };
            setCurrentBulkStatus({ action, target: ascensionid });

            const { status, error } = await customPost("ascension/collection/update/stage", 'POST', selectedItem);
            if (error) toast.error(`Error updating test: ${error.message}`);
            if (status === true) successAscensions.push(ascensionid);

            setCurrentBulkStatus({ action: null, target: null });
        };

        await Promise.all(bulkselection.map(item => handleProcessing(item)));

        if (successAscensions.length > 0) {
            const updatedCollection = collection.map(item =>
                successAscensions.includes(item.ascensionid) ? { ...item, [stage]: value } : item
            );
            setCollection(updatedCollection);
            setBulkSelection([]);
            setSelectStatus(false);
            toast.success(`Successfully updated ${successAscensions.length} tests.`);
        } else {
            toast.warning(`No tests were updated.`);
        }
    };

    const columns = [
        {
            Header: '#',
            accessor: 'checkbox',
            Cell: ({ row }) => (
                <input
                    type="checkbox"
                    checked={bulkselection.some(item => item.ascensionid === row.original.ascensionid)}
                    onChange={() => toggleRowSelected(row.original.ascensionid)}
                />
            ),
            width: '2%',
            style: { fontSize: '15px' },
        },
        {
            Header: 'Ascension Date(ID)',
            accessor: 'ascension_date',
            Cell: ({ value, row }) => <>{dayjs(value).format('DD-MM-YYYY hh:mm:ss')} ({row.original.ascensionid})</>,
        },
        { Header: 'CustomerId', accessor: 'fullpatientid' },
        { Header: 'BillID', accessor: 'billingid' },
        {
            Header: 'Name',
            accessor: 'fullname',
            Cell: ({ value }) => <span className="text-uppercase fw-bold">{value}</span>,
        },
        { Header: 'Age', accessor: 'age' },
        { Header: 'Test Name', accessor: 'name' },
        {
            Header: 'Timing',
            accessor: 'timing',
            Cell: ({ row }) => fnTiming(row.original),
        },
        {
            Header: 'Action',
            accessor: 'actions',
            Cell: ({ row }) => (
                <ProcessingButtons
                    BulkTargetTo={currentBulkStatus.target}
                    action={currentBulkStatus.action}
                    item={row.original}
                    updateTestCollectionAfterUpdate={updateTestCollectionAfterUpdate}
                    employeeid={employeeid}
                />
            ),
        },
    ];

    if (isLoading) return <div>Loading .......................</div>;

    return (
        <div className="">
            <div className="my-1 d-flex justify-content-between">
                <div>
                    <button onClick={selectAllAscension} className="btn btn-light btn-sm" aria-label={selectstatus ? 'Unselect all' : 'Select all'}>
                        <RiCheckboxMultipleLine /> {selectstatus ? 'Unselect all' : 'Select all'}
                    </button>
                    <button onClick={() => bulkProcessingUpdate('start')} className="btn btn-light btn-sm mx-2" aria-label="Start selected">
                        <RiPlayCircleLine /> Start selected
                    </button>
                    <button onClick={() => bulkProcessingUpdate('stop')} className="btn btn-light btn-sm mx-2" aria-label="Stop selected">
                        <RiStopCircleLine /> Stop selected
                    </button>
                </div>
            </div>
            <PrimeTable
                column={columns}
                data={collection}
                filtering={false}
                urlparams={{
                    _dateFrom: queryParams._dateFrom,
                    searchString: queryParams.searchString,
                    _dateEnd: queryParams._dateEnd,
                    isUltrasound: queryParams.isUltrasound,
                    employeeid, ascension_stage: 'PROCESSING',
                    branchid: queryParams.branchid,
                    sortby: queryParams.sortby
                }}
                handleSeverSideProcessing={handleServerSideProcessingAscensionData}
                serverSideFiltering={true} />
        </div>
    );
}