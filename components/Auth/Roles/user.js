import { Button } from '@mui/material'
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';

export default function USERS({ heading, button }) {
  const [userdata, setuserData] = useState({ fullname: '', username: '', password: '', role: '' ,roleid: ''})

  // determine the mode 

  const [mode, setmode] = useState('new');



  //  header query 
  const router = useRouter();
  const userid = router.query.users;

  const autoGenerate_password = function () {
    let password = '';
    let start_count = 0;
    let symbols = '/$%#@^+_()*'
    let upperCase = 'ABCDEFGHJIJKLMNOPRSTUVWSYZ'
    let lowerCase = 'abcdefghijklmnopqrstuvwsyz'
    let numbers = 123456789
    let concatValues = numbers + symbols + upperCase + lowerCase;
    while (start_count < 10) {
      start_count++;
      let randomizedValue = Math.floor(Math.random() * concatValues.length)
      password += concatValues.charAt(randomizedValue)
    }
    setuserData({ ...userdata, password })
  }


  //  handles getting data for editing a user information


  useMemo(() => {
    if (userid != null) {
      const userdata = function async() {
        const pulluser_information = async function () {
          let url = await fetch(`/api/roles?userid=${userid}`)
          let response = await url.json();
          return response;
        }
        pulluser_information().then((data) => { return data.data })
          .then((data) => {
            setmode('edit')
            setuserData({
              fullname: data[0]['FULLNAME'],
              username: data[0]['USERNAME'],
              role: data[0]['ROLE'],
              password: data[0]['PASSWORD'],
              roleid: data[0]['ROLEID']
            })
          }).catch((err) => console.log(err))
      }
      userdata()
    }
  }, [userid])



  const HandleSave = function () {
    const methodDeterminer = mode == 'new' ? 'POST' : 'PUT';
    const backend_push = function () {
      const postdata =
        fetch('http://localhost:3000/api/roles', { method:methodDeterminer, body: JSON.stringify(userdata) })
      postdata.then((e) => { return e.json() })
        .then((response) => {
          console.log(response)
        })
    }

    if (Object.values(userdata).includes('')) {
      return null;
    }
    else {
      backend_push();
    }
  }





  return (
    <>
      <div className='container-fluid'>
        <div className='container d-flex'>
          <div className='row col-8'>
            <div className='card'>
              <div className='card-header'>
                {heading.toUpperCase()}
              </div>
              <div className='card-body'>
                <div>
                  <label>
                    fullname
                  </label>
                  <input className='form-control' name='fullname' value={userdata.fullname} onChange={(e) => setuserData({ ...userdata, fullname: e.target.value })} />
                </div>
                <div className='col'>
                  <label>
                    new user name
                  </label>
                  <input value={userdata.username} className='form-control' name='newuser' onChange={(e) => setuserData({ ...userdata, username: e.target.value })} />
                </div>
                <div className='col'>
                  <label>
                    role
                  </label>
                  <select className='form-control mb-3' value={userdata.role}
                    onChange={(e) => {
                      setuserData({ ...userdata, role: e.target.value })

                    }}>
                    <option value=''> --- select an option ---- </option>
                    <option value='lab scientist'>lab scientist</option>
                    <option value='sales attendant'>sales attendant</option>
                    <option value='laboratory manager'>laboratory Manager</option>
                    <option value='admin'>admin</option>
                  </select>
                </div>
                <div className='col'>
                  <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <label>
                        password
                      </label>
                    </div>
                    <div className='mb-4'>
                      <Button variant='contained' sx={{ backgroundColor: '#00224F', borderRadius: 0 }} onClick={(e) => autoGenerate_password(10)}>
                        Auto generate password
                      </Button>
                    </div>
                  </section>
                  <div>
                    <input className='form-control' name='password' value={userdata.password} onChange={(e) => setuserData({ ...userdata, password: e.target.value })} />
                  </div>
                </div>
                <div className='mt-3'>
                  <Button variant='contained' color='primary' onClick={(e) => HandleSave(e)}>
                    {
                      button
                    }
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
