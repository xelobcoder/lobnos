import {  ArrowForwardIos } from "@mui/icons-material";
import { useState } from "react";
export default function ToggleDownUI({ toggleUpIcon = <ArrowForwardIos />, header, content }) {
  const [show, setShow] = useState(false);
  return (
    <div className="bg-white p-1 my-2 shadow" style={{borderRadius:'3px'}}>
      <div className="toggle-header-ui p-2" onClick={(ev) =>  {setShow(!show)}}>
        <div className="icon pointer" style={{marginRight:"20px"}}  >
        <span role="presentation" className="mx-0" drop={show.toString()}  >
           {toggleUpIcon}
          </span>
        </div>
        <div>
          {header}
        </div>
      </div>
      <div className="toggle-body-ui my-2">
       
        {show && (<>
          <hr/><div>{content}</div></>)}
      </div>
    </div>
  );
}
