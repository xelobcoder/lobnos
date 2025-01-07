"use server"
import { customFetch, customPost } from "../Auth/customFetch"
export async function filteringDatabaseTables(target: string, filtering: string, column: string, limit: number) {
     try {
          const response = await customFetch(`application/filtering/table/${target}?value=${filtering}&&original=${column}&&limit=${limit}`);
          console.log(response)
          return response;
     } catch (err) {
          return []
     }
} 




export async function pushDatabaseResponseForSavingScheduleMessage(data) {
     const response = await customPost(`sms/schedule/message`, 'POST', data);
     return response;
}