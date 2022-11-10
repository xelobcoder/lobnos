import React, { useState } from "react"

export default function LIST_PARAMETERS(props) {
 const { setupdata } = props;

 const SingleParam = function (props) {
  const { index, item } = props;
  return (
   <>
    <ul className="params_list" >
     <li>{index}</li>
     <li>{item.PARAMETER}</li>
     <li>{item.UNIT}</li>
     <li>{item.LOWER}</li>
     <li>{item.UPPER}</li>
     <li><p> delete</p></li>
     <li><p>edit</p></li>
    </ul>
   </>
  )
 }


 const Multiple = function () {
  return (
   <>{setupdata.map((item, index) => { return <SingleParam key={index} index={index} item={item} /> })}</>
  )
 }
 return (
  <>
   <div>
    <ul className="params_list_header" >
     <li>No.</li>
     <li>parameter</li>
     <li>unit</li>
     <li>lower</li>
     <li>upper</li>
    </ul>
   </div>
   <div>
    {setupdata.length === 0 ? <h1>not data found </h1> : <Multiple />}
   </div>
  </>
 )
}