import SidebarFrontPage from '../../components/frontpagesidebar'
import Header from '../../components/header'
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react'
import { Autocomplete, Button, TextField, Box, Container } from '@mui/material'
import TESTCART from '../../components/registration/testCart';
import CancelScheduleSendIcon from '@mui/icons-material/CancelScheduleSend';
import SendIcon from '@mui/icons-material/Send';
import AddBoxIcon from '@mui/icons-material/AddBox';

export default function Billing({ allpanels, organization, clinicians }) {
    const [testoptions, setTestoptions] = useState(allpanels);
    const [data, setData] = useState({
        organizations: null,
        clinicians: null,
    });
    const [selected, setSelected] = useState(null);
    const [testArray, setTestArray] = useState([]);


    const getOrgOptions = organization.map((item, index) => {
        return item.NAME;
    })

    const getCliOptions = clinicians.map((item, index) => {
        return item.NAME;
    })

    const emptytestcart = (e) => {
        setTestArray([])
    }

    const handleAutocomplete = (e) => {
        // check cart to ensure no duplicate data is found
        let cart = testArray.filter((item) => item.ID == selected.ID)
        // if duplicate found ignore, else add to cart
        cart.length == 0 ? setTestArray([...testArray, selected]) : null
    }

    const handleRemove = (e, single) => {
        // filter out the selected test from the cart
        let cart = testArray.filter((item) => item.ID != single.ID)
        // return all tests except the selected test
        // set test array to the new cart
        setTestArray(cart)
    }
    console.log(data)
    return (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: '50% auto', gridGap: '20px 20px' }}>
                <div >
                    <div style={{ display: 'flex', justifyContent: 'flex-start', width: '40vw', height: '40px', marginTop: '40px', marginLeft: '20px' }}>
                        <Autocomplete sx={{ width: '80%' }}
                            options={allpanels}
                            getOptionLabel={(option) => option.NAME}
                            value={selected}
                            size='small'
                            onChange={(e, newValue) => { setSelected(newValue) }}
                            renderInput={(params) => <TextField {...params} label="Select a panel" variant="outlined" />}
                        />
                        <Button startIcon={<AddBoxIcon />} onClick={(e) => { handleAutocomplete(e) }} color='primary' variant='contained' sx={{ borderRadius: 0, marginLeft: '10px' }}>add</Button>
                    </div>
                    <div style={{ width: '40vw', marginLeft: '20px', marginTop: '20px' }}>
                        <div style={{ marginTop: '20px', width: '80%' }}>
                            <Autocomplete value={data.organizations} size='small'
                                options={getOrgOptions.map((option) => option)}
                                getOptionLabel={(option) => option}
                                onChange={(e, newValue) => { setData({ ...data, organizations: newValue }) }}
                                renderInput={(params) => <TextField {...params} label="Select a organization" variant="outlined" />}
                            />
                        </div>
                        {/* same autocomplete for clinicians */}
                        <div style={{ marginTop: '20px', width: '80%' }}>
                            <Autocomplete value={data.clinicians} size='small'
                                options={getCliOptions.map((option) => option)}
                                getOptionLabel={(option) => option}
                                onChange={(e, newValue) => { setData({ ...data, clinicians: newValue }) }}
                                renderInput={(params) => <TextField {...params} label="Select a clinician" variant="outlined" />}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ width: '40vw' }}>
                    <TESTCART testArray={testArray} handleRemove={handleRemove} emptytestcart={emptytestcart} />
                    <div style={{display:'flex',justifyContet:'flex-start'}}>
                        <TextField    disabled={testArray.length == 0 ? true : false} sx={{ mt:5,mr:3 }} label='amount paid' size='small' type='number'></TextField>
                        <TextField
                          disabled={testArray.length == 0 ? true : false}
                        sx={{ mt:5 }} label='discount' type='number' size='small'/>
                        <Button type='button' color='primary' variant='contained' sx={{ mt:5,ml:2,borderRadius:0 }}
                        endIcon={testArray.length == 0 ? <CancelScheduleSendIcon /> : <SendIcon />}
                        disabled={testArray.length == 0 ? true : false}>submit</Button>
                    </div>
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
    // get all organizations
    let organizationApi = `http://localhost:3000/api/organization`
    let organizationResponse = await fetch(organizationApi)
    let organizationData = await organizationResponse.json()
    // get all clinicians   
    let cliniciansApi = `http://localhost:3000/api/clinicians`
    let cliniciansResponse = await fetch(cliniciansApi)
    let cliniciansData = await cliniciansResponse.json()

    return {
        props: {
            allpanels: data,
            organization: organizationData,
            clinicians: cliniciansData
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
