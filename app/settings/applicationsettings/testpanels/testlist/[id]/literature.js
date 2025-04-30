import { useSearchParams } from "next/navigation";
import dynamic from 'next/dynamic';
import MainSettingsLayoutView from "../../../../../components/settingsComponents/MainSettingsLayoutView";
import { useEffect, useState } from "react";
import { customFetch, customPost } from "../../../../../components/Auth/customFetch";
import Loader from "../../../../../components/accessories/Loader";
const MARKDOWN_EDITOR = dynamic(() => import('../../../../../components/accessories/markdownEditor'), { ssr: false });
import { ToastContainer, toast } from 'react-toastify';

export default function LiteratureReviewPage() {
     const [isloading, setLoading] = useState(false);
     const testname = useSearchParams().get('testname');
     const litID = useSearchParams().get('litid');
     const [data, setData] = useState({});

     const updatedata = (event, newValue) => {
          setData({ ...data, literature: newValue });
     }

  


     useEffect(() => {
          if (litID) {
               setLoading(true)
               customFetch(`test/getLiteraturereview?testid=${litID}`)
                    .then((data) => {
                         if (Object.keys(data).length != 0) setData(data)
                    })
                    .catch((err) => console.log(err))
                    .finally(() => {
                         setLoading(false);
                    })
          }
     }, [litID])


     const handleSubmit = (ev) => {
          ev.preventDefault();
          if (!data.literature || !data.literature.toString().length > 1) {
               return toast.error('fill in all blank fields', { autoClose: 5000 })
          }
          customPost(`test/getLiteraturereview`, 'PUT', {...data, testid: litID})
               .then((data) => {
                    const { status } = data;
                    if (status == "success") {
                         toast.success('UPDATE SUCCESSFULL', { autoClose: 2000 });
                    } else {
                         toast.error('UPDATE FAILED', { autoClose: 4000 })
                    }
               })
               .catch((err) => console.log(err))
     }


     const renderingView = () => {
          if (isloading) return <Loader />
          else {
               return <section className="mt-2">
                    <MARKDOWN_EDITOR
                         initialData={data.literature || ""}
                         updatedata={updatedata} />
                    <button type="button" onClick={(ev) => { handleSubmit(ev) }} className="btn btn-primary btn-sm mt-2">
                         update information
                    </button>
               </section>

          }
     }

     return (
          <MainSettingsLayoutView>
               <h5>Literature Review Page for {testname} </h5>
               <ToastContainer theme="colored" />
               {renderingView()}
          </MainSettingsLayoutView>)
}