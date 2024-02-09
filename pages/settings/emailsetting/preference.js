import { useState, useEffect } from 'react'
import EmailSidebarJSX from '../../../components/settingsComponents/EmailSidebar';
import { customFetch, customPost, emailPreference, handleResponse } from '../../../components/Auth/customFetch';
import { Form,Switch } from 'react-bootstrap';
import MainSettingsLayoutView from '../../../components/settingsComponents/MainSettingsLayoutView';
import { ToastContainer, toast } from 'react-toastify';
import ISLOADING from "../../../components/isLoading";
import Loader from '../../../components/accessories/Loader';
import CustomFormSwitch from '../../../components/settingsComponents/ApplicationSettings/CustomFormSwitch';

export default function EmailPreference() {
  const [preference, setPreference] = useState(emailPreference);
  const [loading, setLoading] = useState(true);

  const handleSubmit = async (ev) => {
    const pushPreference = await customPost('applicationssettings/emailpreference', 'POST', preference);
    handleResponse(pushPreference,toast)
  }


  async function getPreference() {
    try {
      setLoading(true);
      const response = await customFetch('applicationssettings/emailpreference');
      const { statusCode, status, message, result } = response;
      if (statusCode === 200 && status === 'success' && result) {
        if (Object.keys(result).length > 0) {
          setPreference(result);
        } else {
          setPreference(emailPreference);
        }
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error(err.message ||"something went wrong");
    }
  }


  const handleChangeWithState = (value, key) => {
    setPreference({ ...preference, [key]: value });
  };

  useEffect(() => { getPreference() }, []);



  const renderer = () => {
    if (loading) return <Loader />
    else {
      return (
        <div className='grid-30-30-30'>
          {
            Object.keys(preference).map((item, index) => {
              return (<CustomFormSwitch
                key={index + 1}
                title={item}
                update={handl}
                text='vjsv  jvjvj jdjvkv jjje uefjvejx jefjkkefj mhejgej hedwjigk ueriuweuig ugeriu ueuieui uierguiegeruig3ruiguiwrguiwrgirigweifgiow;gioefiogeriogioegioeigerigioergiergio'
              />)
            })
          }
        </div>
      )
    }
  }

  console.log(preference)

  return (
    <>
      <MainSettingsLayoutView sidebar={<EmailSidebarJSX />}>
        <ToastContainer />
        {renderer()}
        {loading ?
          <ISLOADING />
          :
          (
                <Form className='container br-5'>
              <h5 className='text-capitalize mt-2'>update email preferences</h5>
              <div className='alert alert-info'> Send email  notification when the following events occur. toggle to activate or deactivate</div>
              <div className='list-group'>
              {Object.keys(preference).map((key) => (
               <div key={key} className='list-group-item d-flex justify-content-between p-3'>
                  <span className='fw-light text-md-start'>{` ${key.replace(/^\w/, c => c.toUpperCase())}`}</span>
                  <Form.Check type='switch' style={{ fontSize: '25px' }}
                    onChange={(ev) => handleChangeWithState(ev.target.checked, key)}
                    checked={preference[key] === 'Yes' }
                    className='float-end'
              />
            </div>
          ))}
        </div>

          <button type='button' className='btn btn-primary mt-2 btn-sm mx-1' onClick={handleSubmit}>
            update preference
          </button>
        </Form>
        )}
      </MainSettingsLayoutView>
    </>
  )
}
