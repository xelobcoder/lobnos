import React from 'react';
import VerticalTimeline from '../components/accessories/UIAccessories/VerticalTimeline';


const TimelinePage = () => {
     const events = [
          { title: 'Processing Start Date', date: '2023-01-01' },
          { title: 'Processing End Date', date: '2023-01-10' },
          { title: 'Result Entry Date', date: '2023-01-15' }
     ];

     return (
          <div>
               <h1 className="text-center my-5" style={{height:'10vh'}}>Project Timeline</h1>
               <VerticalTimeline events={events} />
          </div>
     );
};

export default TimelinePage;
