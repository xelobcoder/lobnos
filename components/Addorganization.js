import { TextField, Button } from "@mui/material";


export default function AddOrganization() {
    return (
        <>
            <form className="add-org-wrapper" >
                <div >
                    <TextField variant='filled' type='text' label='organization name' id='orgname'></TextField>
                    <TextField variant='filled' type='text' label='organization address' id='orgaddress'></TextField>
                    <TextField variant='filled' type='tel' label='organization phone' id='orgphone'></TextField>
                    <TextField variant='filled' type='email' label='organization email' id='orgemail'></TextField>
                </div>
                <div >
                    <TextField variant='filled' type='link' label='organization website' id='orgwebsite'></TextField>
                    <TextField variant='filled' type='text' label='contact person' id='orgcontact'></TextField>
                    <TextField label="contact phone number" type='tel' variant="filled" id="contactphone"></TextField>
                    <TextField label="contact phone email" type='email' variant="filled" id="contactemail"></TextField>
                </div>
            </form>
        </>
    )
}