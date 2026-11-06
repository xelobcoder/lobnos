import { processingDates } from "../../../lib/laboratoryPresentation";
import { customFetch } from "../../Auth/customFetch";
import { RiPlayFill, RiStopFill } from '@remixicon/react';

export const formatDate = (date) => {
       return new Date(date).toISOString().split('T')[0]
};

export async function getAscensionData(ascension_stage, setCollection, queryParams, setLoading, employeeid, branchid,category,{ascensionid,patientid,billingid,patientname,testid,clinicianId}) {
       try {
              const { _dateFrom, _dateEnd, isUltrasound, sortby,category } = queryParams;

              const parsedFrom = _dateFrom ? formatDate(_dateFrom) : _dateFrom;
              const parsedEnd = _dateEnd ? formatDate(_dateEnd) : _dateEnd;

              if (employeeid) {
                     setLoading(true);
                     const result = await customFetch(
                            `operations/ascension/staging?operationsStaging=${ascension_stage}` +
                            `&&dateFrom=${parsedFrom}` +
                            `&&dateEnd=${parsedEnd}` +
                            `&&page=${queryParams.page}` +
                            `&&count=${queryParams.count}` +
                            `&&isUltrasound=${isUltrasound}` +
                            `&&employeeid=${employeeid}` +
                            `&&branchid=${branchid}` +
                            `&&sortby=${sortby}` +
                            `&&grouped=${category}`+
                            `&&ascensionid=${ascensionid}`+
                            `&&patientid=${patientid}`+
                            `&&billingid=${billingid}`+
                            `&&patientname=${patientname}`+
                            `&&testid=${testid}`+
                            `&&clinicianId=${clinicianId}`
                     );
                     if (Array.isArray(result)) {
                            setLoading(false)
                            setCollection(result);
                     } else {
                            const { status, message } = result;
                            setLoading(false)
                            alert(message || "Permission Denied");
                            setCollection([]);
                     }
              }
       } catch (err) {
              setCollection([]);
              console.log(err)
       } finally {
              setLoading(false);
       }
}




export const fnTiming = (item) => {
       const { start: parsedStart, end: parsedEnd } = processingDates(item);
       return (
              <div className="bg-light d-block br-5">
                     {parsedStart && <span> <RiPlayFill color="green" />{parsedStart}</span>}
                     <hr className="p-0 m-0" />
                     {parsedEnd && <span> <RiStopFill color='red' />{parsedEnd}</span>}
              </div>
       )
}




export const getAscensionStaffApproved = async (ascensionId, employeeid) => {
       const { staff } = await customFetch(`test/approval/get/staffQualifiedToValidationResult?employeeid=${employeeid}&&ascensionid=${ascensionId}`);

       return staff;
}
