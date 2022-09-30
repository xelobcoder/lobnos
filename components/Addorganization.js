import { TextField, Button,Container} from "@mui/material";


export default function AddOrganization() {
    return (
        <>
          <form className="add-org-wrapper" >
                <div >
                    <TextField variant='outlined'  type='text' label='organization name' id='orgname'></TextField>
                    <TextField variant='outlined' type='text' label='organization address' id='orgaddress'></TextField>
                    <TextField variant='outlined' type='tel' label='organization phone' id='orgphone'></TextField>
                    <TextField variant='outlined' type='email' label='organization email' id='orgemail'></TextField>
                </div>
                <div >
                    <TextField variant='outlined' type='link' label='organization website' id='orgwebsite'></TextField>
                    <TextField variant='outlined' type='text' label='contact person' id='orgcontact'></TextField>
                    <TextField label="contact phone number" type='tel' variant='outlined'id="contactphone"></TextField>
                    <TextField label="contact phone email" type='email' variant='outlined'  id="contactemail"></TextField>
                </div>
            </form>
        </>
    )
}