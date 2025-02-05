"use server"
import { customFetch, customPost } from "../Auth/customFetch"
export async function filteringDatabaseTables(target: string, filtering: string, column: string, limit: number) {
     try {
          const response = await customFetch(`application/filtering/table/${target}?value=${filtering}&&original=${column}&&limit=${limit}`);
          return response;
     } catch (err) {
          return []
     }
} 




export async function pushDatabaseResponseForSavingScheduleMessage(data) {
     const response = await customPost(`sms/schedule/message`, 'POST', data);
     return response;
}


export async function loadClinicianPackage(packageid: number) {
     const response = await customFetch(`clinician-packages/${packageid}`);
     return response;
}


               