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
     const [savingMessage, setSavingMessage] = useState<boolean>(false);


     const resetForm = () => {
          setSelectedRecipients([]);
          setIscheduled(false);
          setScheduledDate('');
          setScheduledTime('');
          setEndDate('');
          setMessageFormat({ isTemplate: false, templateid: null, content: '' })
          setFrequency('')
          setUseCase('')
     }

     const handleSelectedCategory = (category: SmsCategoryType) => {
          setSelectedCategory(category);
          resetForm();
     }

     const handleSubmit = async (e: React.FormEvent) => {
          setSavingMessage(true);
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

               setSavingMessage(false);
               return toast.error(`A template is being used for the message , however the templateid is missing`);

          }


          if (data.isScheduled && (!data.scheduledDate || !data.scheduledTime)) {
               setSavingMessage(false);
               return toast.error('A date not provided  for a scheduled message');

          }

          if (data.isBulk == 0 && (
               Array.isArray(data.receipients) == false || data.receipients.length == 0)
          ) {
               setSavingMessage(false);
               return toast.error(`Receipients not added`);

          }

          const response = await pushDatabaseResponseForSavingScheduleMessage(data);
          setSavingMessage(false);
          const { status } = response;

          if (status && status == true) {
               toast.success("Message scheduled successfully");
          } else {
               toast.error("Message scheduling failed");
          }

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
          const regex = /\{@(\w+)\.\w+\}/g;
          const matches = content.smscontent.match(regex);

          if (Array.isArray(matches) && matches.length > 0) {
               const placeholderCategories = matches.map((match) => {
                    const stringifyMatch = `${match}`.toLowerCase();
                    return stringifyMatch.match(/\{@(\w+)\./)?.[1]
               })
               
               if (placeholderCategories.includes(selectedCategory?.value?.toLowerCase())) {
                    setMessageFormat({
                         templateid: content.tempateid,
                         content: content.smscontent,
                         isTemplate: true,
                    });
               } else {
                    toast.warning("Template does not match selected category");
               }
          } else {
               toast.warning("No placeholders found in the template");
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
               id = value?.outsourceid;
          } else if (selectedCategory?.value === "clients") {
               mobile = value?.mobile_number;
               id = value?.patientid;
               const { firstname, middlename, lastname } = value;
               name = `${firstname} ${middlename} ${lastname}`
          } else if (selectedCategory?.value == "clinicians") {
               name = value?.name;
               mobile = value?.phone
               id = value?.id
          } else if (selectedCategory?.value === "staffs") {
               name = value?.username;
               mobile = value?.mobile;
               id = value?.employeeid
          }

          if (selectedRecipients.length === 0) {
               setSelectedRecipients([{ mobile, name, id }])
          } else {


               setSelectedRecipients((prev) => {
                    const hasMatch = prev.filter((item, index) => item.id === id);

                    if (hasMatch.length > 0) {
                         return prev
                    }
                    return [...prev, { mobile, name, id }]
               })
          }
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
          savingMessage,
          handleFilteredClient,
          handleSelectedCategory,
          isScheduled,
          setIscheduled,
          clearRecipients,
          messageFormat,
          handleSelectedTemplateToUse,
     };
}
