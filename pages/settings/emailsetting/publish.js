import { useState } from "react";
import MainSettingsLayoutView from "../../../components/settingsComponents/MainSettingsLayoutView";
import EmailSidebarJSX from "../../../components/settingsComponents/EmailSidebar";
import { customFetch } from "../../../components/Auth/customFetch";
import { Close } from "@mui/icons-material";
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


  const handleChecked = function (ev,item) {
    const { checked } = ev.target;
    
    if (checked) {
      const { email } = item;
      if (selectedEmails.length == 0) { setSelectedEmails([item]); return; }
      const _isfound = selectedEmails.some((item) => item.email === email);
      if (!_isfound) { setSelectedEmails([...selectedEmails, item]); }
      return;
     }
  }

  const removeEmail = function (ev,item) {
    const { email } = item;
    const _isNotremovable = selectedEmails.filter((item) => item.email !== email);
    setSelectedEmails(_isNotremovable);
   }
  return (
    <MainSettingsLayoutView sidebar={<EmailSidebarJSX />}>
      <div className='grid grid-2'>
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
                <div className='list-group ' >
                {emails.length > 0 && emails.map((email, index) => (
                    <div key={index} className='list-group-item' style={{display:'grid',gridTemplateColumns:'5% 30% 30% 30%',gridGap:'10px'}} >
                      <input  onChange={(ev) => handleChecked(ev,email)} key={index} type='checkbox' />
                      <span> {email?.email}</span>
                    <span> {(`${email?.firstname} ${email?.middlename} ${email.lastname}`) && category === "client"}
                    {category === "staff" &&  (`${email?.fullname}`)}
                    </span>
                      <span>{ email?.patientid}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
        </div>
        {/* second column for selected emails and timing */}
        <div className="selected-emailwrapper">
          <h5 className="text-primary">{selectedEmails.length} selected Emails</h5>
          <div className="selected-emails">
            {selectedEmails.length > 0 ? selectedEmails.map((item, index) => (
              <span key={index}>{item?.email}
               <Close onClick={(ev) => removeEmail(ev,item)} fontSize="medium" color="error" id="remove-email"/>
              </span>
            )) : 
            <div className="d-flex fw-bold">No email selected</div>}
          </div>
          <div>
            <label>schedule a date and time</label>
            <input style={{width:'80%'}} type="date" className="custom-input" />
          </div>
          {/* /time  */}
          <div>
            <label>schedule a date and time</label>
            <input style={{ width: '80%' }} type="time" className="custom-input" />
          </div>
          <div className="my-2">
            <button className="btn btn-primary btn-sm">publish email</button>
          </div>
        </div>
         </div>
    </MainSettingsLayoutView>
  )
}