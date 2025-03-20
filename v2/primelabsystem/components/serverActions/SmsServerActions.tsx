"use server"
import { customFetch, customPost } from "../Auth/customFetch";
import { SmsTemplateFormState } from "../sms/type";



export const fetchTableColumns = async (tableName: string) => {
     try {
          const response = await customFetch(`application/get-column/${tableName}`);
          return response;
     } catch (error) {
          console.log("something wrong occured");
          return []
     }
};

export const fetchTableSmsColumns = async (category: string) => {
     if (!category || typeof category != "string") return;
     try {
          const response = await customFetch(`application/sms/create/template/columns?category=${category}`);
          return response;
     } catch (error) {
          console.log("something wrong occured");
          return []
     }
};

export type createTemeplateResponse = {
     status: boolean,
     message: string,
     error: string
}
export const createANewSmsTemplate = async function (formdata: SmsTemplateFormState): Promise<Partial<createTemeplateResponse>> {
     const { templateName, smscontent, placeholders, selectedCategory, createdby } = formdata;

     if (!templateName || !smscontent || !selectedCategory || !createdby || createdby <= 0) {
          return { message: "Missing required fields. Please fill out the template name, SMS content and category.", status: false }
     }

     if (placeholders.length === 0) {
          return { message: "Please add at least one placeholder.", status: false }
     }

     const pushRequest = await customPost(`sms/sms-templates`, 'POST', formdata);

     return pushRequest;
};
