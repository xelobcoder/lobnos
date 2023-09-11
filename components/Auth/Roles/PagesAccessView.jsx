import React from 'react'

export default function PagesAccessView({data, changeEvent, target,handler,pageAcesshandler,role}) {
  return (
    <>
      <div className='row'>
        {
          Object.entries(data).map((item, index) => {
            const [header, value] = item;
            if (!(['username','role','pageAccess','pageaccess','permissions'].includes(header))) {
              return (
                <div key={index} className='col-12 text-capitalize'>
                  <input
                    type="checkbox"
                    name={header}
                    onChange={(ev) =>
                      handler(ev, target, changeEvent)
                    }
                    value={data[header]}
                    checked={data[header]}
                    className="form-check-input"
                  />
                  {" "} {header}
                </div>
              )
            }
          })
        }
      </div>
      <div className="row">
        <h5 className="mt-3 text-lead text-danger">
          Page Access
        </h5>
        {data?.pageAccess && Object.entries(data?.pageAccess).map((item, index) => {
          const [keys, value] = item;
          return (
            <div className="col-12" key={index}>
              <input
                type="checkbox"
                value={data.pageAccess.keys}
                onChange={(ev) =>
                  pageAcesshandler(ev, target, changeEvent)
                }
                id={keys}
                name={keys}
                checked={target.pageAccess[keys]}
                className="form-check-input"
              />{" "}
              <label htmlFor={keys}>{keys}</label>
            </div>
          );
        })}
      </div>
    </>
  )
}
