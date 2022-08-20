import SidebarFrontPage from '../../components/frontpagesidebar'
import Header from '../../components/header'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { Autocomplete, Button, TextField, Box, Container } from '@mui/material'

export default function Billing({ allpanels }) {
    const [testoptions, setTestoptions] = useState(allpanels);
    const [selected, setSelected] = useState(null);
    const [testArray, setTestArray] = useState([]);

    const handleSubmit = useCallback((e) => {

    }, [])


    const handleAutocomplete = (e) => {
        setTestArray([...testArray, selected]);
    }

    console.log(testArray)
    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: '100%', marginTop: '30px' }}>
            <Container style={{ display: 'grid', gridTemplateColumns: '80% auto', width: '50vw' }}>
                <Autocomplete
                    options={allpanels}
                    getOptionLabel={(option) => option.NAME}
                    value={selected}
                    size='small'
                    onChange={(e, newValue) => { setSelected(newValue) }}
                    renderInput={(params) => <TextField {...params} label="Select a panel" variant="outlined" />}
                />
                <Button onClick={(e) => { handleAutocomplete(e) }} color='primary' variant='contained' sx={{ borderRadius: 0, marginLeft: '10px' }}>add</Button>
            </Container>
            <Container>
                {
                    testArray.length == 0 ? null :
                        (
                            <>
                                <table className='table'>
                                    <thead>
                                        <tr>
                                            <th>no</th>
                                            <th>test</th>
                                            <th>cost</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            testArray.map((item, index) => {
                                                return (<tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.NAME}</td>
                                                    <td>{item.PRICE}</td>
                                                </tr>)
                                            })

                                        }
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={2}>total</td>
                                            <td>{testArray.reduce((acc, curr) => { return acc + curr.PRICE }, 0)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </>
                        )
                }
            </Container>

        </Box>
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
