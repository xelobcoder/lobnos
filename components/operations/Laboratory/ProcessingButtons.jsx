import { RiPlayCircleLine, RiStopCircleLine } from '@remixicon/react';
import { useState } from "react";
import { Spinner } from "react-bootstrap";
import { customPost } from "../../Auth/customFetch";

export default function ProcessingButtons({ item, employeeid, updateTestCollectionAfterUpdate, BulkTargetTo, action }) {
       const [subStart, setSubmitStart] = useState(false);
       const [subStop, setSubmitEnd] = useState(false);


       const handleProcessing = async (item, action) => {
              const { ascensionid, testid, processingStartDate, processingEndDate } = item;

              if (action === "start" && processingStartDate) return;
              if (action === "stop" && processingEndDate) return;

              const stage = action === "start" ? "processingStartDate" : 'processingEndDate';

              const value = new Date().toISOString();
              const selectedItem = { ascensionid, testid, value, employeeid, stage }

              action === "start" ? setSubmitStart(true) : setSubmitEnd(true);

              const { status } = await customPost("ascension/collection/update/stage", 'POST', selectedItem);



              if (status === true) {
                     action === "start" ? setSubmitStart(false) : setSubmitEnd(false);
                     updateTestCollectionAfterUpdate(ascensionid, { ...item, [stage]: value })
              }

       }

       return (
              <div>
                     <button
                            disabled={item.processingStartDate}
                            onClick={(ev) => { handleProcessing(item, 'start') }}
                            className="btn btn-success btn-sm">
                            {(subStart || (BulkTargetTo == item.ascensionid && action === "start")) && <Spinner size="sm" />}
                            <RiPlayCircleLine size={16} className="me-1" /> Start
                     </button>
                     <button
                            disabled={item.processingEndDate}
                            onClick={(ev) => { handleProcessing(item, 'stop') }}
                            className="mx-2 btn btn-danger btn-sm">
                            {(subStop || (BulkTargetTo == item.ascensionid && action === "stop")) && <Spinner size="sm" />}
                            <RiStopCircleLine size={16} className="me-1" /> Stop
                     </button>
              </div>
       )
}
