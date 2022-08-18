import SidebarFrontPage from "../../components/frontpagesidebar";
import Header from "../../components/header";
import { TextField, Button, Typography, Box, Container } from '@mui/material';
import axios from "axios";
export default function Activator() {
    return (
        <>
            <Container sx={{ display: 'grid', gridTemplateColumns: '30% 20% 20% auto', gridGap: '20px 20px', marginTop: '20px' }}>
                <TextField label="Enter patient id or fullname" size="small" />
                <TextField type='date' size='small' />
                <TextField type='date' size='small' />
                <Button type='button' variant="contained" color="success">search</Button>
            </Container>
        </>
    )
}




Activator.getLayout = function (page) {
    return (
        <>
            <Header />
            <div className="wrapper">
                <div className="side">
                    <SidebarFrontPage />
                </div>
                <div className="main">{page}</div>
            </div>
        </>
    )
}


// get server side props
export async function getServerSideProps(context) {
    let endpoint = 'http://localhost:3000/api/register';
    let res = await axios.get(endpoint);
    let data = res.data;
    return {
        props: {
            data
        }
    }
}