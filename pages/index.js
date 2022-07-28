import Head from 'next/head';
import {Component} from 'react';


function DataTable({data}) {

    return(
        <h1>data</h1>
    )
  }




export default DataTable;

export async function getServerSideProps() {
    const res = await fetch('http://localhost:3000/api/hello');
    const data = await res.json();
    return { props: { data } }
}