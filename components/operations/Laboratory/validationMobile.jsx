import VecticalTimeline from "../../accessories/UIAccessories/VerticalTimeline";
import moment from "moment";
export default function ValidationMobile({ rows, ActionDropdown, visibleTimelines, viewResultHandler, prepareRow, toggleTimeline, openModal }) {
     return (
          <div>
               {rows.map((row) => {
                    prepareRow(row);
                    const isUrgent = row.original.clientstatus === "urgent";

                    const timelineData = [
                         { event: 'processing started on', feed: moment(row.original.processingStartDate).format('LLLL'), color: 'red' },
                         { event: 'processing ended on', feed: moment(row.original.processingEndDate).format("LLLL"), color: 'green' },
                         { event: "result entry started on", feed: moment(row.original.resultEntryStart).format("LLLL") },
                         { event: "result entry ended on", feed: moment(row.original.resultEntryEnd).format("LLLL") }
                    ];

                    return (
                         <div key={row.id} className={`list-group my-2`}>
                              <div className={`list-group-item fw-bold d-flex justify-content-between ${isUrgent ? 'bg-danger text-white' : 'bg-secondary-subtle'}`}>
                                   <div className="text-capitalize">
                                        <span style={{ marginRight: '2px' }}>
                                             <input type="checkbox" {...row.getToggleRowSelectedProps()} />
                                        </span>
                                        {row.original.fullname} ({row.original.patientid})
                                   </div>
                                   <div>
                                        <ActionDropdown onValidate={() => { openModal(row.original) }} onViewResult={() => viewResultHandler(row.original)} />
                                   </div>
                              </div>
                              <div className={`list-group-item`}>
                                   <div><strong>Test Name:</strong> {row.original.name}</div>
                                   <div
                                        className="pointer text-decoration-underline pls-color text-sm"
                                        onClick={() => toggleTimeline(row.id)}
                                   >
                                        {visibleTimelines[row.id] ? "Hide Timeline" : "Show Timeline"}
                                   </div>
                                   {visibleTimelines[row.id] && <VecticalTimeline data={timelineData} />}
                              </div>
                         </div>
                    );
               })}
          </div>
     )
}