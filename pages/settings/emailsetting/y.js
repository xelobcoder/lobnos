import { useState } from "react";
import MainSettingsLayoutView from "../../../components/settingsComponents/MainSettingsLayoutView";
import EmailSidebarJSX from "../../../components/settingsComponents/EmailSidebar";
export default function EmailsServedPage() {
  const [value, setValue] = useState('');
  const [inputDisabled, setDisabled] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [category, setCategory] = useState("");
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [emails, setEmail] = useState([]);
  // make input active
  const makeInputActive = () => { setDisabled(false);}


  const searchEmail = async (ev) => { 
    const { value } = ev.target;
    setInputValue(value);
    if (value.length < 3) return;
    if (value.length > 3 && category) { 
      const getEmail = await customFetch(`email/custom/search?category=${category}&email=${value}`);
      const { statusCode, status, message, result } = getEmail;
      if (statusCode === 200 && result) {
        setEmail(result);
      }
      console.log(getEmail);
    }
  }
  return (
    <MainSettingsLayoutView sidebar={<EmailSidebarJSX />}>
      <h1>Emails List</h1>
      <div className='grid' style={{display:'grid',gridTemplateColumns:'20% auto',gridGap:'20px'}}>
        <div className='row p-2'>
            <div>
              <label>Category</label>
              <select value={category} onChange={(ev) => { setCategory(ev.target.value);  makeInputActive()}} className='custom-input mb-1'>
                <option >select category of the recipient</option>
                <option value={'clients'}>client</option>
                <option value={'staff'}>staff</option>
                <option value='bulk clients'>bulk clients</option>
                <option value='bulk staff'>bulk staff</option>
              </select>
              <br />
              <label>Recipient Email</label>
              <input value={inputValue} onChange={(ev) => { searchEmail(ev) }} disabled={inputDisabled} multiple type='search' className='custom-input' placeholder='search for recipient email' />
              <div className='mt-2'>
                <label className='text-primary'>Matching emails</label>
                <div className='list-group '>
                  {emails.length > 0 && emails.map((email, index) => (
                    <div key={index} className='list-group-item grid' >
                     <input key={index} type='checkbox'/>
                     <span> {email?.email}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
         </div>
    </MainSettingsLayoutView>
  )
}