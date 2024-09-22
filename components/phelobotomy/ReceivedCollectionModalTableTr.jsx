import { useState } from "react"
import { Spinner } from "react-bootstrap";
import { customPost } from "../Auth/customFetch";
import moment from "moment/moment";
import { Start, Stop } from "@mui/icons-material";

export default function ReceivedCollectionModalTableTr({ item, toggleMultipleSelection, multipleSelected, toast, updateCollectionStatus}) {
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
            await updateCollectionStatus(updatedItem,stage,value)

        } catch (err) {
            toast.error("Failed to initiate sample");
        } finally {
            stage === "collectionStartDate" && setIsCollectionLoading(false);
            stage === "collectionEndDate" && setIsCompletedLoading(false)
        }
    };

    const calculateTimeUsed = (startTime, endTime) => {
        const start = moment(startTime);
        const end = moment(endTime);
        const h = end.diff(start, 'hours');
        const m = end.diff(start, 'minutes');
        const d = end.diff(start, 'days');
        const s = end.diff(start, 'seconds');
        if (d > 0) {
            return `${d} days~ ${h} hours ~ ${m} mins`
        } else if (h > 0) {
            return `${h} hours ~ ${m} mins`
        } else if (m > 0) {
            return `${m} mins`
        } else {
            return `${s} seconds`
        }
    }


    const statusView = (item) => {
        return (<div>
            {item.collectionStartDate && <span><Start color="warning" />{moment(item.collectionStartDate).format('LLLL')}</span>}
            <br />
            {item.collectionEndDate && <span><Stop color="success" />{moment(item.collectionEndDate).format('LLLL')}</span>}<br />
            {item.collectionEndDate && item.collectionStartDate && calculateTimeUsed(item.collectionStartDate, item.collectionEndDate)}
        </div>)
    }


    return (
        < tr className="text-sm" >
            <td className="fw-bold">
                <input
                    type="checkbox"
                    onChange={(ev) => toggleMultipleSelection(ev, item)}
                    checked={multipleSelected.includes(item.testid)}
                />
                <span className="mx-2">   {item.name}</span>
            </td>
            <td className={item.sampletype === "serum" ? "text-warning" : item.sampletype === "blood" ? "text-danger" : "text-dark"}>
                {item.sampletype}
            </td>
            <td>
                {item.qty_required} {item.unit}
            </td>
            <td>{item.sample_container}</td>
            <td>{item.status}{statusView(item)} </td>
            <td>
                <button disabled={isCollectionLoading || item.collectionStartDate} onClick={() => handleIndividualSample('collectionStartDate', item)} className="btn btn-primary btn-sm">
                    {isCollectionLoading && <Spinner size="sm" />}    Initiate
                </button>
                <button onClick={() => handleIndividualSample('collectionEndDate', item)} disabled={isCompletedLoading || item.collectionEndDate} className="btn btn-success mx-2 btn-sm">
                    {isCompletedLoading && <Spinner size="sm" />}    Complete</button>
            </td>
            <td>
                <textarea
                    value={item.samplemessage}
                    onChange={(ev) => handleSampleMessageChange(ev, item.id)}
                    className="form-control"
                    placeholder="Type a message here"
                    disabled={item.collection === "true"}
                />
            </td>
        </tr >
    )
}