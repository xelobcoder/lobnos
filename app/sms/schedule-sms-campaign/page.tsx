"use client"
import React, { useState } from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import PatientFiltered from '../../../components/accessories/SectorFileringComponents/CustomerFiltering';
import { Container } from 'react-bootstrap';
import { SmsCategoryType, SmsSmsCategoryData } from '../../../components/sms/SmsInterfaces';



type Recipient = {
     mobile_number: string;
     firstname: string;
     middlename?: string;
     lastname: string;
};


export default function ScheduleSmsCampaign() {
     const [message, setMessage] = useState<string>('');
     const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
     const [recipients, setRecipients] = useState<string>('');
     const [sender, setSender] = useState<string>('');
     const [scheduledDate, setScheduledDate] = useState<string>('');
     const [scheduledTime, setScheduledTime] = useState<string>('');
     const [useCase, setUseCase] = useState<string>('transactional');
     const [selectedCategory, setSelectedCategory] = useState<SmsCategoryType | undefined>(SmsSmsCategoryData.find((c) => c.value === 'clients'));

     const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();

          const now = new Date();
          const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);

          if (scheduledDateTime <= now) {
               alert('Scheduled date and time must be in the future.');
               return;
          }

          const data = {
               message,
               recipients: recipients.split(',').map((r) => r.trim()),
               sender,
               scheduled_date: `${scheduledDate} ${scheduledTime}`,
               use_case: useCase,
               category: selectedCategory ? selectedCategory.value : null,
          };

          console.log('SMS Campaign Scheduled:', data);
     };

     const handleFilteredClient = (value: Recipient) => {
          if (value && !selectedRecipients.some((recipient) => recipient.mobile_number === value.mobile_number)) {
               setSelectedRecipients([...selectedRecipients, value]);
          }
     };

     const clearRecipients = () => {
          setSelectedRecipients([]);
     };

     return (
          <Container fluid>
               <h3 className="text-decoration-underline border-1">Schedule SMS Campaign</h3>
               <div className="d-flex justify-content-lg-between">
                    <div className="col-9">
                         <form onSubmit={handleSubmit} className="col-11">
                              <div className="grid-reg my-3 d-flex">
                                   <div>
                                        <label htmlFor="category" className="form-label">
                                             Recipients Category
                                        </label>
                                   </div>
                                   <div className="d-flex col-10">
                                        <div className="col-4">
                                             <DropdownButton
                                                  id="category-dropdown"
                                                  variant="light"
                                                  title={selectedCategory ? selectedCategory.label : "Select Category"}
                                                  onSelect={(key) => {
                                                       const category = SmsSmsCategoryData.find((cat) => cat.value === key);
                                                       setSelectedCategory(category);
                                                  }}
                                             >
                                                  {SmsSmsCategoryData.map((category) => (
                                                       <Dropdown.Item key={category.value} eventKey={category.value}>
                                                            {category.label}
                                                       </Dropdown.Item>
                                                  ))}
                                             </DropdownButton>
                                        </div>
                                        <div className="mx-2 col-8">
                                             <PatientFiltered
                                                  getSelectedPatient={handleFilteredClient}
                                                  isDisabled={selectedCategory?.isBulk || false}
                                             />
                                        </div>
                                   </div>
                              </div>

                              <div className="grid-reg my-3">
                                   <label htmlFor="message" className="form-label">
                                        Message
                                   </label>
                                   <textarea
                                        className="form-control"
                                        id="message"
                                        rows={4}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Enter SMS message"
                                        maxLength={160}
                                   />
                              </div>

                              <div className="grid-reg my-3">
                                   <label htmlFor="scheduledDate" className="form-label">
                                        Scheduled Date
                                   </label>
                                   <input
                                        type="date"
                                        className="custom-input"
                                        id="scheduledDate"
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                   />
                              </div>

                              <div className="grid-reg my-3">
                                   <label htmlFor="scheduledTime" className="form-label">
                                        Scheduled Time
                                   </label>
                                   <input
                                        type="time"
                                        className="custom-input"
                                        id="scheduledTime"
                                        value={scheduledTime}
                                        onChange={(e) => setScheduledTime(e.target.value)}
                                   />
                              </div>

                              <div className="grid-reg my-3">
                                   <label htmlFor="useCase" className="form-label">
                                        Use Case
                                   </label>
                                   <select
                                        id="useCase"
                                        className="custom-input"
                                        value={useCase}
                                        onChange={(e) => setUseCase(e.target.value)}
                                   >
                                        <option value="transactional">Transactional</option>
                                        <option value="marketing">Marketing</option>
                                        <option value="promotional">Promotional</option>
                                   </select>
                              </div>

                              <button type="submit" className="btn btn-primary">
                                   Schedule SMS
                              </button>
                         </form>
                    </div>
                    <div className="col-3">
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
                                                                 style={{ height: '13px' }}
                                                                 id={`recipient-${index}`}
                                                            />
                                                            <label htmlFor={`recipient-${index}`}>
                                                                 {item.firstname} {item.middlename} {item.lastname}
                                                            </label>
                                                       </span>
                                                       <span>{item.mobile_number}</span>
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
