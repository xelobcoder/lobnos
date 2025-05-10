"use client"
import React, { useEffect } from 'react'
import { customFetch } from '../../../../components/Auth/customFetch';
import { RiCalendarEventLine, RiUserHeartLine, RiMoneyDollarCircleLine, RiFileList3Line, RiAlertLine } from '@remixicon/react'; // Add more as needed
import styles from './LaboratorySMSLifecycle.module.css';



interface Event {
  name:string,
  attachedScheduler:number,
   messageHeader:string,
   activated:boolean
}

type Placeholder ={
  [key:string]:string
}

interface IScheduler {
  tempateid: number;
  templateName: string;
  placeholders: Placeholder[];
  smscontent: string;
  createdby: number;
  createdon: string;
}
const DefaultEvents : Event[] = [
  {name:"registration", attachedScheduler:1, messageHeader:"Registration", activated: true},
  {name:"billing-receipt", attachedScheduler:1, messageHeader:"Billing Receipt", activated: true},
  {name:"appointment-confirmation", attachedScheduler:1, messageHeader:"Appointment Confirmation", activated: true},
  {name:"appointment-reminder", attachedScheduler:2, messageHeader:"Appointment Reminder", activated: true},
  {name:"result-ready", attachedScheduler:2, messageHeader:"Result Ready", activated: true},
  {name:"birthday", attachedScheduler:2, messageHeader:"Happy Birth Birthday", activated: true},
  {name:"New HealhPractioner Registration", attachedScheduler: 2, messageHeader:"New HealhPractioner Registration", activated: true},
  {name:"New Outsourcing Organization", attachedScheduler: 2, messageHeader:"New Outsourcing Organization", activated: true},
  {name:"Practioner Commission Alert", attachedScheduler:2, messageHeader: "", activated: true},

]
export default function LaboratorySMSLifecycle() {
   const [events, setEvents] = React.useState<Event[]>(DefaultEvents);
   const [schedulers, setSchedulers] = React.useState<IScheduler[]>([]);

   const fetchTemplates = async () => {
    try {
         const response = await customFetch(`sms/sms-templates/all`);
         return response;
    } catch (error) {
         console.error("Error fetching templates:", error);
         throw new Error("An error occurred while fetching templates.");
    }
};


const onChangeMessageHeader = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
  const newEvents = [...events];
  newEvents[index].messageHeader = event.target.value;
  setEvents(newEvents); 
}

const onChangeAttachedScheduler = (e: React.ChangeEvent<HTMLSelectElement>, index: number) => {
  const newEvents = [...events];
  newEvents[index].attachedScheduler = Number(e.target.value);
  setEvents(newEvents);
};

useEffect( () =>  {
    fetchTemplates().then((response) => {
      if (response?.templates && Array.isArray(response.templates)) {
        setSchedulers(response.templates);
      } else {
        console.error("Invalid response format:", response);
        setSchedulers([]);
        }
    });
},[])

  const eventIcons: { [key: string]: React.ReactNode } = {
    registration: <RiUserHeartLine size={22} color="#1976d2" />,
    "billing-receipt": <RiMoneyDollarCircleLine size={22} color="#43a047" />,
    "appointment-confirmation": <RiCalendarEventLine size={22} color="#fb8c00" />,
    "appointment-reminder": <RiCalendarEventLine size={22} color="#fb8c00" />,
    "result-ready": <RiFileList3Line size={22} color="#8e24aa" />,
    birthday: <RiUserHeartLine size={22} color="#fbc02d" />,
    "New HealhPractioner Registration": <RiUserHeartLine size={22} color="#1976d2" />,
    "New Outsourcing Organization": <RiUserHeartLine size={22} color="#1976d2" />,
    "Practioner Commission Alert": <RiAlertLine size={22} color="#e53935" />,
  };

  
  const onToggleActivated = (index: number) => {
    const newEvents = [...events];
    newEvents[index].activated = !newEvents[index].activated;
    setEvents(newEvents);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <RiFileList3Line size={28} className={styles.headingIcon} />
        <h4 className={styles.heading}>Laboratory SMS Lifecycle Events</h4>
      </div>
      <hr className={styles.headingDivider}/>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.iconCol}></th>
            <th className={styles.nameCol}>Name</th>
            <th className={styles.headerCol}>Message Header</th>
            <th className={styles.schedulerCol}>Attached Scheduler</th>
            <th className={styles.smsCol}>Sms Content</th>
            <th style={{width: 80}}>Activated</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(events) && events.length > 0 && events.map((event, index) => {
            const selectedScheduler = schedulers.find(s => s.tempateid === event.attachedScheduler);
            return (
              <tr key={index} className={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                <td className={styles.iconCell}>
                  {eventIcons[event.name] || <RiAlertLine size={22} color="#bdbdbd" />}
                </td>
                <td className={`${styles.nameCell} text-capitalize`}>{event.name}</td>
                <td>
                  <input
                    type="text"
                    className={`custom-input ${styles.input}`}
                    onChange={(ev) => { onChangeMessageHeader(ev, index) }}
                    value={event.messageHeader}
                  />
                </td>
                <td>
                  <select
                    className={styles.select}
                    value={event.attachedScheduler}
                    onChange={(e) => onChangeAttachedScheduler(e, index)}
                  >
                    <option value="">Select Scheduler</option>
                    {Array.isArray(schedulers) && schedulers.length > 0 && schedulers.map((scheduler) => (
                      <option key={scheduler.tempateid} value={scheduler.tempateid}>
                        {scheduler.templateName}
                      </option>
                    ))}
                  </select>
                </td>
                <td className={styles.smsCell}>
                  {selectedScheduler ? selectedScheduler.smscontent : <span className={styles.noContent}>No content</span>}
                </td>
                <td style={{textAlign: "center"}}>
                  <input
                    type="checkbox"
                    checked={event.activated}
                    onChange={() => onToggleActivated(index)}
                    style={{ width: 22, height: 22, accentColor: "#1976d2" }}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
