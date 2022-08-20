import SidebarFrontPage from '../../components/frontpagesidebar'
import Header from '../../components/header'
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react'
import { Autocomplete, Button, TextField, Box, Container } from '@mui/material'
import TESTCART from '../../components/registration/testCart';
import AddBoxIcon from '@mui/icons-material/AddBox';

export default function Billing({ allpanels }) {
    const [testoptions, setTestoptions] = useState(allpanels);
    const [selected, setSelected] = useState(null);
    const [testArray, setTestArray] = useState([]);

    const handleSubmit = useCallback((e) => {

    }, [])
 
    const emptytestcart = (e) => {
        setTestArray([])
    }

    const handleAutocomplete = (e) => {
        setTestArray([...testArray, selected]);
    }

    console.log(testArray)
    return (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: '50% auto', gridGap: '20px 20px' }}>
                <div style={{ display: 'flex',justifyContent:'flex-start',width:'40vw',height:'40px',marginTop:'40px',marginLeft:'20px' }}>
                    <Autocomplete sx={{width:'80%'}}
                        options={allpanels}
                        getOptionLabel={(option) => option.NAME}
                        value={selected}
                        size='small'
                        onChange={(e, newValue) => { setSelected(newValue) }}
                        renderInput={(params) => <TextField {...params} label="Select a panel" variant="outlined" />}
                    />
                    <Button startIcon={<AddBoxIcon/>} onClick={(e) => { handleAutocomplete(e) }} color='primary' variant='contained' sx={{ borderRadius: 0, marginLeft: '10px' }}>add</Button>
                </div>
                <div style={{width: '40vw'}}>
                    <TESTCART testArray={testArray} emptytestcart={emptytestcart}/>
                </div>
            </div>
        </>
    )
}

export async function getServerSideProps(ctx) {
    // get all test panels
    let endpoint = `http://localhost:3000/api/testpanel/list`
    let response = await fetch(endpoint)
    let data = await response.json()
    return {
        props: {
            allpanels: data,
        },
    }
}

Billing.getLayout = function (page) {
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
