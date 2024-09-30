import { customFetch } from "../../Auth/customFetch";

export async function getAscensionData(ascension_stage, setCollection, queryParams, searchString, setLoading) {
       try {
              setLoading(true);
              const result = await customFetch(`operations/ascension/staging?operationsStaging=${ascension_stage}&&dateFrom=${queryParams._dateFrom}&&dateEnd=${queryParams._dateEnd}&&searchString=${searchString}`);
              setCollection(result);
       } catch (err) {
              setCollection([]);
       } finally {
              setLoading(false);
       }
}

