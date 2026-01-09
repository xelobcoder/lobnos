import { useState } from "react"
import { Spinner } from "react-bootstrap";
import { calculateTimeUsed, customPost } from "../Auth/customFetch";
import moment from "moment/moment";
import { RiPlayCircleLine, RiCheckDoubleLine, RiPlayFill, RiStopFill } from '@remixicon/react';

export default function ReceivedCollectionModalTableTr({ item, toggleMultipleSelection, multipleSelected, toast, updateCollectionStatus }) {
    const [isCollectionLoading, setIsCollectionLoading] = useState(false);
    const [isCompletedLoading, setIsCompletedLoading] = useState(false);

    const handleIndividualSample = async (stage, item) => {
        try {
            if (!stage || typeof item != "object" || !['collectionStartDate', 'collectionEndDate'].includes(stage)) return;
            const value = new Date().toISOString()
            const updatedItem = {
                ascensionid: item.id, testid: item.testid, collection: "true", samplemessage: "", value, stage
            };
            stage === "collectionStartDate" && setIsCollectionLoading(true);
            stage === "collectionEndDate" && setIsCompletedLoading(true);
            await updateCollectionStatus(updatedItem, stage, value)

        } catch (err) {
            toast.error("Failed to initiate sample");
        } finally {
            stage === "collectionStartDate" && setIsCollectionLoading(false);
            stage === "collectionEndDate" && setIsCompletedLoading(false)
        }
    };





    const statusView = (item) => {
        return (<div>
            {item.collectionStartDate && <span><RiPlayFill className="text-warning" />{moment(item.collectionStartDate).format('LLLL')}</span>}
            <br />
            {item.collectionEndDate && <span><RiStopFill className="text-success" />{moment(item.collectionEndDate).format('LLLL')}</span>}<br />
            {item.collectionEndDate && item.collectionStartDate && calculateTimeUsed(item.collectionStartDate, item.collectionEndDate)}
        </div>)
    }


    return (
        <tr className="text-sm">
            <td className="fw-bold" style={{ width: '20%' }}>
                <input
                    type="checkbox"
                    onChange={(ev) => toggleMultipleSelection(ev, item)}
                    checked={multipleSelected.includes(item.testid)}
                />
                <span className="mx-2">{item.name}</span>
            </td>
            <td style={{ width: '20%' }}>
                <div className="d-flex flex-column">
                    <span className={item.sampletype === "serum" ? "text-warning" : item.sampletype === "blood" ? "text-danger" : "text-dark"}>
                        {item.sampletype}
                    </span>
                    <span>
                        {item.qty_required} {item.unit}
                    </span>
                    <span>
                        {item.sample_container}
                    </span>
                </div>
            </td>
            <td style={{ width: '20%' }}>
                {item.status}{statusView(item)}
            </td>
            <td style={{ width: '10%' }}>
                <div className="d-flex flex-column gap-1">
                    <button
                        disabled={isCollectionLoading || item.collectionStartDate}
                        onClick={() => handleIndividualSample('collectionStartDate', item)}
                        className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                    >
                        {isCollectionLoading ? <Spinner size="sm" /> : <RiPlayCircleLine />}
                        Initiate
                    </button>
                    <button
                        onClick={() => handleIndividualSample('collectionEndDate', item)}
                        disabled={isCompletedLoading || item.collectionEndDate || !item.collectionStartDate}
                        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                    >
                        {isCompletedLoading ? <Spinner size="sm" /> : <RiCheckDoubleLine />}
                        Complete
                    </button>
                </div>
            </td>
            <td style={{ width: '20%' }}>
                <textarea
                    value={item.samplemessage}
                    onChange={(ev) => handleSampleMessageChange(ev, item.id)}
                    className="form-control"
                    placeholder="Type a message here"
                    disabled={item.collection === "true"}
                    style={{ minHeight: '80px' }}
                />
            </td>
        </tr>
    )
}