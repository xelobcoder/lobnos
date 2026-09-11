"use client"
import dynamic from 'next/dynamic';
const MARKDOWN_EDITOR = dynamic(() => import("../../../accessories/markdownEditor"), {
     ssr: false
});
import { toast } from 'react-toastify';
import { useState, useEffect, ChangeEvent } from "react";
import Loader from "../../../accessories/Loader";
import { customFetch, customPost } from "../../../Auth/customFetch";

interface LiteratureData {
     literature?: string;
     [key: string]: any;
}

export default function LiteratureTab({ testid }: { testid: number | string }) {
     const [isloading, setLoading] = useState<boolean>(false);
     const [data, setData] = useState<LiteratureData>({});

     const updatedata = (event: ChangeEvent<HTMLTextAreaElement>, newValue: string) => {
          setData({ ...data, literature: newValue });
     }

     useEffect(() => {
          if (testid) {
               setLoading(true);
               customFetch(`test/getLiteraturereview?testid=${testid}`)
                    .then((response) => {
                         if (Object.keys(response).length !== 0) setData(response);
                    })
                    .catch((err: Error) => console.log(err))
                    .finally(() => {
                         setLoading(false);
                    });
          }
     }, [testid]);

     const handleSubmit = (ev: React.FormEvent) => {
          ev.preventDefault();
          if (!data.literature || data.literature.trim().length < 1) {
               return toast.error('Fill in all required fields', { autoClose: 5000 });
          }
          customPost(`test/getLiteraturereview`, 'PUT', { ...data, testid })
               .then((response) => {
                    if (response.status === "success") {
                         toast.success('Update successful', { autoClose: 2000 });
                    } else {
                         toast.error('Update failed', { autoClose: 4000 });
                    }
               })
               .catch((err: Error) => console.log(err));
     }

     if (isloading) return <Loader />;

     return (
          <section className="mt-2">
               <MARKDOWN_EDITOR
                    initialData={data.literature || ""}
                    updatedata={updatedata}
               />
               <button
                    type="button"
                    onClick={handleSubmit}
                    className="btn btn-primary btn-sm mt-2"
               >
                    Update Information
               </button>
          </section>
     );
}
