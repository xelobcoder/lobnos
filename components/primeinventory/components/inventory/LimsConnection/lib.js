import { customFetch } from "../../../Lib/fetcher";

export const fetchTestTemplate = async function (testId) {
     try {
          const data = await customFetch(`lims/inventory/connection/template/fetch?testid=${testId}`);

          if (data.result && Array.isArray(data.result.template) && data.result.template.length > 0) {
               return data.result;
          }
          return [];
     } catch (error) {
          console.error('Fetch error:', error);
          return [];
     }
}

