"use server"
import { redirect } from "next/navigation";
import { loadOptions } from "../../lib/appointment";
import { customFetch, customPost } from "../Auth/customFetch"
import { plsEncryption } from "../../lib/encryption";
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


export async function AsyncPatientFilteringloadOptions
     (input = "") {
     return await loadOptions(input);
}



export const handleDatePicker = async ({ branchid, date }) => {
     "use server"
     redirect(`/billing/sales/branches/${plsEncryption(branchid.toString())}?from=${date}&&to=${date}`)
}



export const handleSeverSideProcessing = async (pagination) => {
     const { page, count, from, to } = pagination;
     try {
          const data = await customFetch(
               `billing/payment/info/client?page=${page}&&count=${count}&& from=${from}&& to=${to}`

          );

          if (data.status === "success" && data.statusCode === 200) {
               return { result: data.result, error: false }
          }
          return { result: [], error: false }
     } catch (error) {
          console.error("Error fetching transactions:", error);
          return { result: [], error: true }
     }

}