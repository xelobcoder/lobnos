import { useSearchParams } from "next/navigation";
import { useState,useRef, useEffect, useCallback } from "react";
import { getEmailUsingid } from "../../../../components/EmailServices/util";
import Header from "../../../../components/header";
export default function PreviewEmailDraft() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const bodyRef = useRef();
  const idparams = useSearchParams().get("id");

  const getEmail = useCallback(async () =>  {getEmailUsingid(idparams,setTitle,setBody)},[idparams])

  useEffect(() => {
    if (bodyRef.current && idparams) {
      getEmail();
    }
  },[getEmail,idparams])
  return (
    <>
      <Header/>
      <div className="container-fluid bg-white " style={{height:'100vh'}}>
      <div className="container">
          <div className="row">
            <div className="col">
                <h1>{title}</h1>
                <div dangerouslySetInnerHTML={{__html: body}} ref={bodyRef}></div>
            </div>
        </div>
      </div>
      </div>
    </>
  )
}