import React from 'react';

interface ScheduledSmsInputsProps {
     scheduledDate: string;
     scheduledTime: string;
     endDate: string;
     setScheduledDate: (date: string) => void;
     setScheduledTime: (time: string) => void;
     setEndDate: (date: string) => void;
}

const ScheduledSmsInputs: React.FC<ScheduledSmsInputsProps> = ({
     scheduledDate,
     scheduledTime,
     endDate,
     setScheduledDate,
     setScheduledTime,
     setEndDate,
}) => {
     return (
          <>
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
                         required
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
                         required
                    />
               </div>

               <div className="grid-reg my-3">
                    <label htmlFor="endDate" className="form-label">
                         End Date
                    </label>
                    <input
                         type="date"
                         className="custom-input"
                         id="endDate"
                         value={endDate}
                         onChange={(e) => setEndDate(e.target.value)}
                         required
                    />
               </div>
          </>
     );
};

export default ScheduledSmsInputs;
