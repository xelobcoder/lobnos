import { useEffect, useState } from "react";
import MainSettingsLayoutView from "../../../components/settingsComponents/MainSettingsLayoutView";
import EmailSidebarJSX from "../../../components/settingsComponents/EmailSidebar";
import {useSearchParams,useRouter } from "next/navigation";
import { customFetch, customPost } from "../../../components/Auth/customFetch";
import ISLOADING from "../../../components/isLoading";
import { Delete, Edit, Preview, Publish } from "@mui/icons-material";
export default function DraftEmailPage() {
  const params = useSearchParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [category, setCategory] = useState("all");

  const handlecategory = (value) => { 
    const defaultPath = "/settings/emailsetting/emails";
    setCategory(value);
    router.push(`${defaultPath}?category=${value}`);
  }

  const paramcat = params.get("category");

  const getdata = async function (paramcat) {
    try {
      const response = await customFetch(`email/composed/draft?target=${paramcat}&&mode=brief&&limit=20`);
    const { statusCode, status, result } = response;
    if (statusCode === 200 && status === "success") {
      setData(result);
      setLoading(false);
    } else {
      setData([]);
      setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      setData([]);
   }
  }
  useEffect(() => {
    setLoading(true);
    getdata(paramcat);
  }, [paramcat]);


  const publishEmail = async (id) => { 
    if (!id) return;
    const response = await customPost(`email/publish`,'POST',{id});
    console.log(response);
  }
  return (
    <MainSettingsLayoutView sidebar={<EmailSidebarJSX />}>
      <div className="w-25 mx-2 my-2">
        <select value={category} onChange={(ev) => { handlecategory(ev.target.value); }} className='custom-input'>
        <option value='all'>all</option>
        <option value='published'>published</option>
        <option value='draft'>draft</option>
      </select>
      </div>
      {loading && <ISLOADING />}
      {data.length > 0 && (
        <div className='list-group mx-2'>
          {data.map((item, index) => (
            <div key={index} className='list-group-item grid' id="email-draft-list">
              <div className="first-row">
              <span>{item?.id}</span>
                <span>{item?.subject}</span>
                <span>{new Date(item?.created_on).toLocaleDateString()}</span>
                <span
                 className={item?.ispublished == "true" ? "text-success" : "text-danger"}
                >{item?.ispublished == "true" ? "Published" : "Draft"}</span>   
                <div>
                      <span>
                      <button onClick={(ev) => {router.push(`/settings/emailsetting/customemail?id=${item.id}`)} } className="btn btn-sm btn-primary"><Edit fontSize="small"/> edit</button>
                    </span>
                    {/* previrw */}
                    <span>
                      <button onClick={(ev) =>  {router.push(`/settings/emailsetting/preview?id=${item.id}`)}} className="btn btn-sm btn-success mx-2"><Preview fontSize="small"/> preview</button>
                    </span>
                    <span>
                      <button className="btn btn-sm btn-danger"><Delete fontSize="small"/> delete</button>
                  </span>
                  {
                    item?.ispublished == 'false' && (
                      <span>
                        <button onClick={(ev) => { router.push(`/settings/emailsetting/publish?id=${item?.id}`) } } 
                        className="btn btn-sm btn-success mx-2">
                          <Publish fontSize="small"/>
                          publish
                        </button>
                      </span>
                    )
                  }
                </div>
                
            
            </div>
              <div className="second-row">
                <span>To:{item?.target}</span>
             </div>
            </div>
          ))}
        </div>
      
      )}
    </MainSettingsLayoutView>
  )
}