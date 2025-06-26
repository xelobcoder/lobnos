"use client";
import { createANewSmsTemplate, createTemeplateResponse } from "../serverActions/SmsServerActions";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import Select from "react-select";
import { SmsCategoryType, SmsPlaceHolderCategory } from "./SmsInterfaces";
import ColumnPlaceHolder from "../accessories/SectorFileringComponents/FetchColumns";
import { PlaceholderColumnSelectionType, SmsTemplateFormState } from "./type";
import { useApplicationSettings } from "../Auth/useApplicationContext";
import { ToastContainer, toast } from 'react-toastify';
import { reactSelectCustomStyles } from "../Auth/customFetch";


export const initialState: SmsTemplateFormState = {
     templateName: "",
     smscontent: "",
     placeholders: [],
     createdby: 0,
     selectedCategory: null,
};

export default function CreateTemplateForm() {
     const [state, setState] = useState<SmsTemplateFormState>(initialState);
     const [isWindow, setWindow] = useState(false);
     const { applicationsettings } = useApplicationSettings()
     const employeeid = applicationsettings.user.employeeid

     useEffect(() => {
          setWindow(true);
     }, []);

     const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          const { name, value } = e.target;
          setState((prevState) => ({ ...prevState, [name]: value }));
     };

     const handleCategoryChange = (selectedOption: SmsCategoryType | null) => {
          setState((prevState) => ({ ...prevState, selectedCategory: selectedOption }));
     };

     const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const { templateName, smscontent, placeholders, selectedCategory } = state;

          if (!templateName || !smscontent || !selectedCategory || placeholders.length === 0) {
               return console.log({ message: "Missing required fields. Please fill out all fields." });
          }

          const response: Partial<createTemeplateResponse> = await createANewSmsTemplate({ ...state, createdby: employeeid });

          const { status, error, message } = response

          if (status && status === true) {
               toast.success("New sms template created successfully");
          } else {
               toast.error(message + " " + error);
          }
     };

     const customStyles = {
          menuPortal: (base: any) => ({
               ...base,
               zIndex: 9999,
          }),
          menu: (base: any) => ({
               ...base,
               maxHeight: "300px",
               overflowY: "auto",
          }),
     };

     const handlePlaceholderSelect = (value: PlaceholderColumnSelectionType) => {
          setState((prevState) => ({
               ...prevState,
               placeholders: [
                    ...prevState.placeholders,
                    { ...value, category: prevState.selectedCategory?.category },
               ],
               smscontent: prevState.smscontent + `{@${value.category}.${value.field}}`,
          }));
     };

     return (
          <div>
               <ToastContainer theme="colored" position="top-center" className={'text-sm'} />
               <form onSubmit={handleSubmit}>
                    <div>
                         <label htmlFor="templateName">Template Name</label>
                         <input
                              className="custom-input"
                              type="text"
                              name="templateName"
                              id="templateName"
                              value={state.templateName}
                              onChange={handleChange}
                              placeholder="Enter template name"
                              required
                         />
                    </div>
                    <div>
                         <label htmlFor="selectedCategory">Category</label>
                         {isWindow && (
                              <Select
                                   id="selectedCategory"
                                   name="selectedCategory"
                                   options={SmsPlaceHolderCategory}

                                   value={state.selectedCategory}
                                   onChange={handleCategoryChange}
                                   getOptionLabel={(e) => e.label}
                                   getOptionValue={(e) => e.value}
                                   placeholder="Select category"
                                   styles={reactSelectCustomStyles}
                                   menuPortalTarget={document.body}
                              />
                         )}
                    </div>
                    <div>
                         <label htmlFor="placeholder">Placeholder</label>
                         <ColumnPlaceHolder
                              onSelect={handlePlaceholderSelect}
                              isSMS={true}
                              category={state.selectedCategory?.value || null}
                         />
                    </div>
                    <div>
                         <label htmlFor="smscontent">SMS Content</label>
                         <textarea
                              className="form-control"
                              id="smscontent"
                              name="smscontent"
                              value={state.smscontent}
                              onChange={handleChange}
                              placeholder="Enter SMS content"
                              rows={4}
                              required
                         ></textarea>
                    </div>
                    <button type="submit" className="btn btn-sm btn-primary my-2">
                         Create Template
                    </button>
               </form>
          </div>
     );
}
