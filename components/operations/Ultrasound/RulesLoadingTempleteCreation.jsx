import dynamic from "next/dynamic"
const MARKDOWN_EDITOR = dynamic(() => import('../../accessories/markdownEditor'), { ssr: false })

export default function RulesLoadingTempleteCreation({ rule, setImpression, impression, handleFieldChange, rulesLoading, selected }) {

       if (!selected) return null

       if (rulesLoading) return <div className="p-2 text-center bg-secondary-subtle  heightedBorder pls-color">Please wait Loading Template...</div>
       return (
              <div>
                     <section id="rule-section">
                            {Array.isArray(rule) && rule.length > 0 && rule.map((item, index) => {
                                   return (
                                          <div className='my-3 list-group' key={index}>
                                                 <div className="fw-bold pls-color list-group-item bg-secondary-subtle">{item.name}</div>
                                                 <div className="list-group-item">
                                                        <MARKDOWN_EDITOR updatedata={(ev, data) => { handleFieldChange(data, index) }} initialData={item.value} />
                                                 </div>
                                          </div>
                                   )
                            })}
                     </section>
                     <section>
                            <div className='list-group heightedBorder br-0 my-2'>
                                   <div className='list-group-item fw-bold text-uppercase bg-body-secondary pls-color'>Impression</div>
                                   <div className='list-group-item'>
                                          <MARKDOWN_EDITOR updatedata={(ev, data) => { setImpression(data) }} initialData={impression || "Impression Here"} />
                                   </div>
                            </div>
                            {rule.length > 0 && <button className="btn btn-primary btn-primary btn-sm">
                                   Save Template Information
                            </button>}
                     </section>
              </div>

       )
}