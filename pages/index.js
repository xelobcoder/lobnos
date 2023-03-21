import { Container } from '@mui/system';
import Head from 'next/head';
import { Component } from 'react';


function DataTable({ data }) {
    const vx = data.result
    return (
        <>
          <Container sx={{p:5}}>
          <div className='list-group'>
                {
                    vx.map((item, index) => {
                        return (
                            <div key={index} className='list-group-item'>
                                <p>{item.rating}</p>
                                <p>{item.comment}</p>
                            </div>
                        )
                    })
                }
            </div>
          </Container>
        </>
    )
}




export default DataTable;

export async function getServerSideProps() {
    const res = await fetch('http://localhost:5000/api/v1/hello');
    const data = await res.json();
    return { props: { data } }
}