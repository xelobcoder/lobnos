import React from 'react';

export default function UseCustomResultTemplateUltrasound({ result, testname }) {
     return (
          <div>
               <div>
                    <h5 className="text-uppercase ui text-center border-bottom border-2 border-secondary">
                         <span className="fw-bold">
                              {testname && testname.includes("_") ? testname.split("_").join(" ") : testname}
                         </span>
                    </h5>
               </div>
               <div>
                    {Array.isArray(result) && result.map((item, index) => {
                         return (
                              <div key={index}>
                                   <div className='fw-bold text-capitalize'>{item.name}</div>
                                   <div className="list-group-item ">
                                        <span dangerouslySetInnerHTML={{ __html: item.value }} />
                                   </div>
                              </div>
                         );
                    })}
               </div>
          </div>
     );
}
