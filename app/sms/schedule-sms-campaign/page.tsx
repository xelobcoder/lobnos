"use client";
import { Container } from "react-bootstrap";
import { useSmsHandlers } from "../../../components/sms/ScheduleSMSCampaign";
import { SmsSmsCategoryData } from "../../../components/sms/SmsInterfaces";
import Select, { GroupBase } from 'react-select';
import { reactSelectCustomStyles } from "../../../components/Auth/customFetch";
import TemplateFiltering from "../../../components/accessories/SectorFileringComponents/TemplateFiltering";
import SmsCategoryFiltering from "../../../components/accessories/SectorFileringComponents/SmsCategoryFiltering";
import { ToastContainer } from "react-toastify";
import ScheduledSmsInputs from "../../../components/sms/ScheduledSmsInputs";

export type Recipient = {
     mobile: string;
     name: string;
     id: number;
};

export type frequencyOptionsTypes = {
     label: string;
     value: string;
};

const frequencyOptions: frequencyOptionsTypes[] = [
     { label: 'One-time', value: 'one-time' },
     { label: 'Daily', value: 'daily' },
     { label: 'Weekly', value: 'weekly' },
     { label: 'Monthly', value: 'monthly' },
];

export default function ScheduleSmsCampaign() {
     const {
          message,
          setMessage,
          selectedRecipients,
          recipients,
          setRecipients,
          sender,
          setSender,
          scheduledDate,
          handleSelectedRecipient,
          setScheduledDate,
          scheduledTime,
          setScheduledTime,
          useCase,
          setUseCase,
          selectedCategory,
          setSelectedCategory,
          handleSubmit,
          clearRecipients,
          frequency,
          setFrequency,
          setMessageFormat,
          handleMessageFormat,
          endDate,
          messageFormat,
          handleSelectedTemplateToUse,
          setEndDate,
          isScheduled,
          setIscheduled,
          isClient
     } = useSmsHandlers();



     return (
          <Container fluid>
               <ToastContainer theme="colored" closeButton={true} position="top-center" className={'text-sm'} />
               <div className="d-flex justify-content-between my-2">
                    <h5 className="text-decoration-underline border-1">Schedule SMS Campaign</h5>
                    <div>
                         <span className="rounded bg-success-subtle p-2">
                              {messageFormat.isTemplate ? 'using sms template' : "create a message"}
                         </span>
                    </div>
               </div>
               <div className="d-flex justify-content-lg-between">
                    <div className="col-9">
                         <form onSubmit={handleSubmit} className="col-11">
                              <div className="grid-reg my-3">
                                   <label htmlFor="category" className="form-label">
                                        Recipients Category
                                   </label>
                                   {
                                        !isClient ? <div>loading....</div> : <Select
                                             id="category-dropdown"
                                             options={SmsSmsCategoryData}
                                             value={selectedCategory}
                                             styles={reactSelectCustomStyles}
                                             onChange={(category) => setSelectedCategory(category as any)}
                                             getOptionLabel={(category) => category.label}
                                             getOptionValue={(category) => category.value}
                                             placeholder="Select Category"
                                             required={true}
                                        />
                                   }
                              </div>

                              <div className="grid-reg my-3">
                                   <label htmlFor="frequency" className="form-label">
                                        Frequency
                                   </label>
                                   {
                                        !isClient ? <div>loading....</div> : <Select
                                             styles={reactSelectCustomStyles}
                                             id="frequency-dropdown"
                                             options={frequencyOptions}
                                             value={frequencyOptions.find(option => option.value === frequency)}
                                             onChange={(selectedOption) => setFrequency((selectedOption as frequencyOptionsTypes).value)}
                                             getOptionLabel={(option) => option.label}
                                             getOptionValue={(option) => option.value}
                                             placeholder="Select Frequency"
                                             required={true}
                                        />
                                   }
                              </div>
                              <div className="grid-reg my-3">
                                   <label>PlaceHolders</label>
                                   <select className="custom-select" onChange={(ev) => { handleMessageFormat(ev.target.value) }}>
                                        <option>select any</option>
                                        <option value={'template'}>Use template created</option>
                                        <option value={'custom'}>
                                             Normal Message or custom template
                                        </option>
                                   </select>
                              </div>
                              {
                                   messageFormat.isTemplate && <div className="grid-reg my-3">
                                        <label className="form-label ">
                                             select template
                                        </label>
                                        <div>
                                             <TemplateFiltering onSelect={handleSelectedTemplateToUse} />
                                        </div>
                                   </div>
                              }
                              <div className="grid-reg my-3">
                                   <label htmlFor="message" className="form-label">
                                        Message
                                   </label>
                                   {
                                        messageFormat.isTemplate ?

                                             (<div className="alert alert-light pls-color">
                                                  {messageFormat.content}
                                             </div>)
                                             :
                                             <textarea
                                                  className="form-control pls-color"
                                                  id="message"
                                                  rows={4}
                                                  disabled={messageFormat.isTemplate}
                                                  value={messageFormat.content}
                                                  onChange={(e) => {
                                                       setMessageFormat({ ...messageFormat, content: e.target.value, isTemplate: false })
                                                  }}
                                                  placeholder="Enter SMS message"
                                                  maxLength={160}
                                                  required
                                             />
                                   }

                              </div>
                              <div className="grid-reg">
                                   <label>
                                        Schedule SMS
                                   </label>
                                   <input type="checkbox" checked={isScheduled} onChange={(ev) => { setIscheduled(ev.target.checked) }} />
                              </div>
                              {isScheduled &&
                                   <ScheduledSmsInputs
                                        scheduledDate={scheduledDate}
                                        scheduledTime={scheduledTime}
                                        setScheduledDate={setScheduledDate} setScheduledTime={setScheduledTime}
                                        endDate={endDate}
                                        setEndDate={setEndDate}
                                   />}
                              <div className="grid-reg my-3">
                                   <label htmlFor="useCase" className="form-label">
                                        Use Case
                                   </label>
                                   <select
                                        id="useCase"
                                        className="custom-input"
                                        value={useCase}
                                        onChange={(e) => setUseCase(e.target.value)}
                                        required
                                   >
                                        <option value="transactional">Transactional</option>
                                        <option value="marketing">Marketing</option>
                                        <option value="promotional">Promotional</option>
                                   </select>
                              </div>

                              <button type="submit" className="btn btn-primary btn-sm">
                                   Schedule SMS
                              </button>
                         </form>
                    </div>
                    <div className="col-3">
                         {selectedCategory?.value && isClient && <div className="my-2">
                              <SmsCategoryFiltering onSelect={handleSelectedRecipient} category={selectedCategory?.value} />
                         </div>
                         }
                         <div className="card">
                              <div className="d-flex justify-content-between card-header text-muted">
                                   <span>Recipients</span>
                                   <span>
                                        <button className="btn btn-dark btn-sm" onClick={clearRecipients}>
                                             Remove All
                                        </button>
                                   </span>
                              </div>
                              <div className="card-body p-2">
                                   {selectedRecipients.length > 0 ? (
                                        selectedRecipients.map((item, index) => (
                                             <div key={index}>
                                                  <div className="d-flex justify-content-lg-between">
                                                       <span className="mx-2 col-6">
                                                            <input
                                                                 type="checkbox"
                                                                 style={{ height: "13px" }}
                                                                 id={`recipient-${index}`}
                                                            />
                                                            <label htmlFor={`recipient-${index}`}>
                                                                 {item.name}
                                                            </label>
                                                       </span>
                                                       <span>{item.mobile}</span>
                                                  </div>
                                             </div>
                                        ))
                                   ) : (
                                        <p className="text-center text-muted">No recipients selected</p>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>
          </Container>
     );
}
