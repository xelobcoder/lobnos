import React from 'react'

export default function TimeOptionHtmlGenerator({ fieldItem, statehandler, index }) {
     const { name, units, value, fieldConstraints, entrymode, textReference } = fieldItem;

     const plan = fieldItem?.plan as 'date' | 'time' | 'datetime'


     if (plan == "time") {
          return (
               <tr key={index}>
                    <td>
                         <label className="pls-label">{name}</label>
                    </td>
                    <td>
                         <input type="time" value={value}
                              onChange={(ev) => {
                                   statehandler(ev, index)
                              }}

                              className="form-control form-control-sm" />
                    </td>
                    <td>
                         {units && <span className="pls-label">{units}</span>}
                    </td>
                    <td></td>
                    <td>{entrymode}</td>
                    <td>{textReference}</td>
               </tr>
          )
     }



     if (plan == "date") {
          return (
               <tr key={index}>
                    <td>
                         <label className="pls-label">{name}</label>
                    </td>
                    <td>
                         <input type="date" value={value}
                              onChange={(ev) => {
                                   statehandler(ev, index)
                              }}
                              className="form-control form-control-sm" />
                    </td>
                    <td>
                         {units && <span className="pls-label">{units}</span>}
                    </td>
                    <td></td>
                    <td>{entrymode}</td>
                    <td>{textReference}</td>
               </tr>
          )
     }


     if (plan == "datetime") {
          return (
               <tr key={index}>
                    <td>
                         <label className="pls-label">{name}</label>
                    </td>
                    <td>
                         <input type="datetime-local" value={value}

                              onChange={(ev) => {
                                   statehandler(ev, index)
                              }
                              }
                              className="form-control form-control-sm" />
                    </td>
                    <td>
                         {units && <span className="pls-label">{units}</span>}
                    </td>
                    <td></td>
                    <td>{entrymode}</td>
                    <td>{textReference}</td>
               </tr>
          )
     }
     return null;
}
