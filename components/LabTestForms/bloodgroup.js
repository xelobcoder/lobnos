import { Autocomplete, TextField, Container, Button } from "@mui/material";
import { useState,useEffect } from "react";
import { useRouter } from "next/router";
import FastApipush from "../Auth/testpush";

export default function BloodGroup() {
 const option = ['', 'A', 'B', 'AB', 'O'];
 const optionRhesus = ['', 'positive', 'negative'];
 const [group, setGroup] = useState('');
 const [rhesus, setRhesus] = useState('');
 // use Router hooks to edit client record
 const record = useRouter().query.record;

 useEffect(() => {
   if (record) {
    let endpoint = `http://localhost:3000/api/test/?test=bloodgroup&record=${record}`;
    let Api_get = new FastApipush('GET', "",endpoint);
    Api_get.getdata()
     .then(data => { console.log(data) })
     .catch(error => { console.log(error) })
   }
 }, [record])


 const handleSubmit = async (e) => {
   let endpoint = `http://localhost:3000/api/test/?test=bloodgroup`;
   let Api_post = new FastApipush('POST', { group, rhesus }, endpoint);
   let response = await Api_post.postdata();
   console.log(response);
 }


 return (
  <>
   <div className="p-4">
    <div style={{ width: '50%', marginTop: '30px' }}>
     <Autocomplete size="small"
      options={option} getOptionLabel={(option) => option}
      renderInput={(params) => <TextField {...params} label="blood group" variant="outlined" />}
      value={group} onChange={(e, newValue) => setGroup(newValue)}>

     </Autocomplete>
    </div>
    <div style={{ width: '50%', marginTop: '30px' }}>
     <Autocomplete size="small"
      options={optionRhesus}
      getOptionLabel={(option) => option}
      renderInput={(params) => <TextField {...params} label="rhesus" variant="outlined" />}
      value={rhesus} onChange={(e, newValue) => { setRhesus(newValue) }}
     >
     </Autocomplete>
    </div>
    <div>
     <Button className="mt-3" variant='contained' color='primary' type='button'
      onClick={(e) => handleSubmit(e)}
     >save result</Button>
    </div>
   </div>
  </>
 )
}