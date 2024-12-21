"use client";
import { useEffect, useState } from "react";
import { Recipient } from "../../app/sms/schedule-sms-campaign/page";
import { SmsCategoryType, SmsSmsCategoryData } from "./SmsInterfaces";

const frequencyOptions = ['one-time', 'daily', 'weekly', 'monthly'];

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

     const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          const now = new Date();
          const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
          if (scheduledDateTime <= now) {
               alert("Scheduled date and time must be in the future.");
               return;
          }
          const data = {
               message,
               recipients: recipients.split(",").map((r) => r.trim()),
               sender,
               scheduled_date: `${scheduledDate} ${scheduledTime}`,
               use_case: useCase,
               category: selectedCategory ? selectedCategory.value : null,
               frequency,
               end_date: endDate,
          };
          console.log("SMS Campaign Scheduled:", data);
     };

     const handleFilteredClient = (value: Recipient) => {
          if (value && !selectedRecipients.some((recipient) => recipient.mobile_number === value.mobile_number)) {
               setSelectedRecipients([...selectedRecipients, value]);
          }
     };

     const clearRecipients = () => {
          setSelectedRecipients([]);
     };

     const handleSelectedTemplateToUse = (selectedOption: any) => {
          const { content } = selectedOption;
          if (content && Object.keys(content).length > 0) {
               setMessageFormat({ templateid: content.templateid, content: content.smscontent, isTemplate: true });
          }
          let placeholderCategoryArray = content.smscontent.toString().split("{@");

          if (Array.isArray(placeholderCategoryArray) && placeholderCategoryArray.length > 0) {
               placeholderCategoryArray = placeholderCategoryArray.filter((item) => item.trim() !== "");
               if (placeholderCategoryArray.length > 0) {
                    let placeholder = placeholderCategoryArray[0];
                    placeholder = placeholder.toString().includes(".") ? placeholder.split(".") : "";
                    if (Array.isArray(placeholder) && placeholder.length > 0) {
                         placeholder = placeholder[0];
                    }
                    console.log(placeholder,selectedCategory);
               }

          }
          console.log(placeholderCategoryArray);
     };

     const handleMessageFormat = (value: string) => {
          if (value === "template") {
               setMessageFormat({ templateid: null, content: '', isTemplate: true });
          } else {
               setMessageFormat({ templateid: null, content: '', isTemplate: false });
          }
     };

     useEffect(() => { setIsClient(true); }, []);

     return {
          message,
          setMessage,
          selectedRecipients,
          setSelectedRecipients,
          recipients,
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
          clearRecipients,
          messageFormat,
          handleSelectedTemplateToUse,
     };
}
