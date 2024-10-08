import moment from "moment";
import { customFetch } from "../../Auth/customFetch";
import { Start, Stop } from "@mui/icons-material";

const formatDate = (date) => {
       return new Date(date).toISOString().split('T')[0];
};

export async function getAscensionData(ascension_stage, setCollection, queryParams, setLoading) {
       try {
              const { _dateFrom, _dateEnd } = queryParams;

              const parsedFrom = _dateFrom ? formatDate(_dateFrom) : _dateFrom;
              const parsedEnd = _dateEnd ? formatDate(_dateEnd) : _dateEnd;

              setLoading(true);

              const result = await customFetch(
                     `operations/ascension/staging?operationsStaging=${ascension_stage}` +
                     `&&dateFrom=${parsedFrom}` +
                     `&&dateEnd=${parsedEnd}` +
                     `&&searchString=${queryParams.searchString}` +
                     `&&page=${queryParams.page}` +
                     `&&count=${queryParams.count}`
              );
              setCollection(result);
       } catch (err) {
              setCollection([]);
              console.log(err)
       } finally {
              setLoading(false);
       }
}




export const fnTiming = (item) => {
       const { processingEndDate, processingStartDate } = item;
       const parsedStart = processingStartDate ? moment(processingStartDate).format("LLLL") : '';
       const parsedEnd = processingEndDate ? moment(processingEndDate).format('LLLL') : ''
       return (
              <div className="bg-light d-block br-5">
                     {parsedStart && <span > <Start color="success" />{parsedStart}</span>}
                     <hr className="p-0 m-0" />
                     {parsedEnd && <span> <Stop color='error' />{parsedEnd}</span>}
              </div>
       )
} 