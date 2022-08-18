import SidebarFrontPage from "../../components/frontpagesidebar";
import Header from "../../components/header";
import { TextField, Button, Typography, Box, Container } from '@mui/material';
import axios from "axios";
import Link from 'next/link';


export default function Activator({ data }) {
    return (
        <>
            <Container sx={{ display: 'grid', gridTemplateColumns: '30% 20% 20% auto', gridGap: '20px 20px', marginTop: '20px' }}>
                <TextField label="Enter patient id or fullname" size="small" />
                <TextField type='date' size='small' />
                <TextField type='date' size='small' />
                <Button type='button' variant="contained" color="success">search</Button>
            </Container>
            <Container>
                <table className="activation-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>patient id</th>
                            <th>fullname</th>
                            <th>date</th>
                            <th>status</th>
                            <th>action</th>
                            <th>options</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            data.map((item, index) => {
                                return (
                                    <tr key={item.ID}>
                                        <td>{item.ID}</td>
                                        <td>{item.PATIENTID}</td>
                                        <td>{item.FULLNAME}</td>
                                        <td>{item.DATE.slice(0, 10)}</td>
                                        <td>
                                            <div className={item.ACTIVATION_STATUS == 'TRUE' ? 'activated' : 'deactivated'}>
                                                {item.ACTIVATION_STATUS == 'TRUE' ? 'activated' : 'deactivated'}
                                            </div>
                                        </td>
                                        <td className="activation-cell">
                                            <Button variant="outlined" color={item.ACTIVATION_STATUS == 'TRUE' ? 'error' : 'success'}>
                                                {item.ACTIVATION_STATUS == 'FALSE' ? 'activate' : 'deactivate'}
                                            </Button>
                                        </td>
                                        <td>
                                            <Button variant='teal'>
                                                <Link href={`/registration/?patientid=${item.PATIENTID}`}>
                                                 <a> edit info</a>
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
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
                <div className="main" style={{ maxHeight: '80vh !important', backgroundColor: 'whitesmoke' }}>{page}</div>
            </div>
        </>
    )
}


// get server side props
export async function getServerSideProps(context) {
    let endpoint = 'http://localhost:3000/api/activation';
    let res = await axios.get(endpoint);
    let data = res.data;
    console.log(data)
    return {
        props: {
            data
        }
    }
}