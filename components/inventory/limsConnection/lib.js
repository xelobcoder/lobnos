import { customFetch, InventoryFetch } from "../../Auth/customFetch";

export const fetchTestTemplate = async function (testId) {
     try {
          const templates = await customFetch(`inventory/templates/test/${testId}?includeItems=true`);
          const { success, data } = templates;
          if (success == true) {
               return data;
          }
          return [];
     } catch (error) {
          console.error('Fetch error:', error);
          return [];
     }
}

