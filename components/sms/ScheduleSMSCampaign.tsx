"use client";
import { useEffect, useState } from "react";
import { Recipient } from "../../app/sms/schedule-sms-campaign/page";
import { SmsCategoryType, SmsSmsCategoryData } from "./SmsInterfaces";
import { toast } from "react-toastify";
import { pushDatabaseResponseForSavingScheduleMessage } from "../serverActions/ActionFiltering";



export function useSmsHandlers() {
     const [message, setMessage] = useState<string>("");
     const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
     const [recipients, setRecipients] = useState<string>("");
     const [sender, setSender] = useState<string>("");
     const [scheduledDate, setScheduledDate] = useState<string>("");
     const [scheduledTime, setScheduledTime] = useState<string>("");
     const [useCase, setUseCase] = useState<string>("transactional");
     const [selectedCategory, setSelectedCategory] = useState<SmsCategoryType | undefined>(
          SmsSmsCategoryData.find((c) => c.value === "clients")
     );
     const [frequency, setFrequency] = useState<string>("one-time");
     const [endDate, setEndDate] = useState<string>("");
     const [messageFormat, setMessageFormat] = useState({ isTemplate: false, templateid: null, content: '' });
     const [isClient, setIsClient] = useState(false);
     const [isScheduled, setIscheduled] = useState(true);

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          const now = new Date();
          const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
          if (scheduledDateTime <= now) {
               alert("Scheduled date and time must be in the future.");
               return;
          }

          const data = {
               isTemplateused: messageFormat.isTemplate,
               isBulk: selectedCategory?.isBulk === true ? 1 : 0,
               scheduledDate,
               scheduledTime,
               isScheduled,
               endDate,
               usecase: useCase,
               templateid: messageFormat.templateid,
               templateCategory: selectedCategory?.categorization,
               receipients: selectedRecipients,
               frequency,
               message: messageFormat.content,
               isSent: 0,
          }

          if (data.isTemplateused && (!data.templateid || data.templateid < 0)) {
               return toast.error(`A template is being used for the message , however the templateid is missing`);
          }


          if (data.isScheduled && (!data.scheduledDate || !data.scheduledTime)) {
               return toast.error('A date not provided  for a scheduled message');
          }

          if (data.isBulk == 0 && (
               Array.isArray(data.receipients) == false || data.receipients.length == 0)
          ) {
               return toast.error(`Receipients not added`);
          }

          const response = await pushDatabaseResponseForSavingScheduleMessage(data);

          console.log(response);

     };

     const handleFilteredClient = (value: Recipient) => {
          if (value && !selectedRecipients.some((recipient) => recipient.mobile === value.mobile)) {
               setSelectedRecipients([...selectedRecipients, value]);
          }
     };

     const clearRecipients = () => {
          setSelectedRecipients([]);
     };

     const handleSelectedTemplateToUse = (selectedOption: any) => {
          const { content } = selectedOption;
          let placeholderCategoryArray = content.smscontent.toString().split("{@");

          if (Array.isArray(placeholderCategoryArray) && placeholderCategoryArray.length > 0) {
               placeholderCategoryArray = placeholderCategoryArray.filter((item) => item.trim() !== "");

               if (placeholderCategoryArray.length > 0) {
                    let placeholder = placeholderCategoryArray[0];
                    placeholder = placeholder.toString().includes(".") ? placeholder.split(".") : "";
                    if (Array.isArray(placeholder) && placeholder.length > 0) {
                         placeholder = placeholder[0];
                    }
                    if (placeholder.trim().toLowerCase() === selectedCategory?.value) {
                         setMessageFormat({ templateid: content.tempateid, content: content.smscontent, isTemplate: true });
                    } else {
                         toast.warning("Template do not match selected category")
                    }
               }

          }
     };

     const handleMessageFormat = (value: string) => {
          if (value === "template") {
               setMessageFormat({ templateid: null, content: '', isTemplate: true });
          } else {
               setMessageFormat({ templateid: null, content: '', isTemplate: false });
          }
     }

     const handleSelectedRecipient = (value: any) => {
          let mobile: string = ''
          let name: string = ''
          let id: number = 0;

          if (selectedCategory?.value == "organization") {
               mobile = value?.mobile;
               name = value?.name;
               id = value?.id
          } else if (selectedCategory?.value == "outsourcing") {
               mobile = value?.contactNumber;
               name = value?.name;
               id = value?.id
          } else if (selectedCategory?.value === "clients") {
               mobile = value?.mobile_number;
               id = value?.patientid;
               const { firstname, middlename, lastname } = value;
               name = `${firstname} ${middlename} ${lastname}`
          } else if (selectedCategory?.value == "clinician") {
               name = value?.name;
               mobile = value?.phone
               id = value?.id
          } else {

          }

          setSelectedRecipients([...selectedRecipients, { mobile, name,id }])
     }


     useEffect(() => {
          setIsClient(true);
     }, []);


     const handleMessageSubmission = async () => {
          // const { frequency, message, isTemplateused, templateid, isScheduled, sheduledDate, scheduledTime, endDate, usecase, isSent, templateCategory, isBulk, receipients } = data;


          // console.log(data);
     }


     return {
          message,
          setMessage,
          selectedRecipients,
          setSelectedRecipients,
          recipients,
          handleSelectedRecipient,
          isClient,
          setRecipients,
          sender,
          setSender,
          scheduledDate,
          setScheduledDate,
          scheduledTime,
          setScheduledTime,
          useCase,
          setUseCase,
          selectedCategory,
          setSelectedCategory,
          handleMessageFormat,
          setMessageFormat,
          frequency,
          setFrequency,
          endDate,
          setEndDate,
          handleSubmit,
          handleFilteredClient,
          isScheduled,
          setIscheduled,
          clearRecipients,
          messageFormat,
          handleSelectedTemplateToUse,
     };
}
