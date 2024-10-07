import { customFetch } from "../../Auth/customFetch";

const formatDate = (date) => {
       return new Date(date).toISOString().split('T')[0];
};

export async function getAscensionData(ascension_stage, setCollection, queryParams, setLoading) {
       try {
              setLoading(true);
              const result = await customFetch(
                     `operations/ascension/staging?operationsStaging=${ascension_stage}` +
                     `&&dateFrom=${formatDate(queryParams._dateFrom)}` +
                     `&&dateEnd=${formatDate(queryParams._dateEnd)}` +
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

