import { customFetch, InventoryFetch } from "../../Auth/customFetch";

export const fetchTestTemplate = async function (testId, ascensionid) {
     try {
          const templates = await customFetch(`inventory/templates/test/${testId}?includeItems=true&&ascensionid=${ascensionid}`);
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

