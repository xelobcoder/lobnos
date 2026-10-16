import dynamic from "next/dynamic"
const MARKDOWN_EDITOR = dynamic(() => import('../../accessories/markdownEditor'), { ssr: false })

export default function RulesLoadingTempleteCreation({ rule, setImpression, impression, handleFieldChange, rulesLoading, selected }) {

       if (!selected) return null

       if (rulesLoading) return <div className="py-3 text-muted" role="status" aria-busy="true">Loading template fields...</div>
       return (
              <div>
                     <section id="rule-section" aria-label="Ultrasound report fields">
                            {Array.isArray(rule) && rule.length > 0 && rule.map((item, index) => {
                                   return (
                                          <section className="my-3 pb-3 border-bottom" key={index} aria-labelledby={`ultrasound-field-${item.fieldid || index}`}>
                                                 <h3 id={`ultrasound-field-${item.fieldid || index}`} className="h6 fw-semibold mb-2">{item.name || item.field}</h3>
                                                 <div>
                                                        <MARKDOWN_EDITOR updatedata={(ev, data) => { handleFieldChange(data, index) }} initialData={item.value} />
                                                 </div>
                                          </section>
                                   )
                            })}
                     </section>
                     {/* <section>
                            <div className='list-group heightedBorder br-0 my-2'>
                                   <div className='list-group-item fw-bold text-uppercase bg-body-secondary pls-color'>Impression</div>
                                   <div className='list-group-item'>
                                          <MARKDOWN_EDITOR updatedata={(ev, data) => { setImpression(data) }} initialData={impression || "Impression Here"} />
                                   </div>
                            </div>
                     </section> */}
              </div>

       )
}