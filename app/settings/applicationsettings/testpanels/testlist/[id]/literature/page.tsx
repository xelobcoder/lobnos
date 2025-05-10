import { useSearchParams } from "next/navigation";
import dynamic from 'next/dynamic';
const MARKDOWN_EDITOR = dynamic(() => import("../../../../../../../components/accessories/markdownEditor"), {
     ssr: false
});
import { toast } from 'react-toastify';
import { useState, useEffect, ChangeEvent } from "react";
import Loader from "../../../../../../../components/accessories/Loader";
import { customFetch, customPost } from "../../../../../../../components/Auth/customFetch";

interface LiteratureData {
     literature?: string;
     [key: string]: any;
}

export default function LiteratureReviewPage() {
     const [isloading, setLoading] = useState<boolean>(false);
     const searchParams = useSearchParams();
     const testname = searchParams?.get('testname');
     const litID = searchParams?.get('litid');
     const [data, setData] = useState<LiteratureData>({});

     const updatedata = (event: ChangeEvent<HTMLTextAreaElement>, newValue: string) => {
          setData({ ...data, literature: newValue });
     }

     useEffect(() => {
          if (litID) {
               setLoading(true);
               customFetch(`test/getLiteraturereview?testid=${litID}`)
                    .then((response) => {
                         if (Object.keys(response).length !== 0) setData(response);
                    })
                    .catch((err: Error) => console.log(err))
                    .finally(() => {
                         setLoading(false);
                    });
          }
     }, [litID]);

     const handleSubmit = (ev: React.FormEvent) => {
          ev.preventDefault();
          if (!data.literature || data.literature.trim().length < 1) {
               return toast.error('Fill in all required fields', { autoClose: 5000 });
          }
          customPost(`test/getLiteraturereview`, 'PUT', { ...data, testid: litID })
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