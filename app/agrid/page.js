"use client"
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import "ag-grid-community/styles/ag-theme-balham.css";
// import "../../styles/ag-theme-custom.css"
import { data } from './data';
import { Container, Form } from 'react-bootstrap';
const AgGridTable = () => {

    const columnDefs = [
        { headerName: "Primary Key", field: "prim_key" },
        { headerName: "Name", field: "name" },
        { headerName: "Category", field: "category" },
        { headerName: "Price", field: "price" },
        { headerName: "Created On", field: "created_on" },
        { headerName: "Sample", field: "sample" },
        { headerName: "Description", field: "description here and there" },
    ];

    return (
        <Container>
            <Form.Control />
            <div className="ag-theme-balham" style={{ height: 500, width: '40%' }}>
                <AgGridReact
                    columnDefs={columnDefs}
                    rowData={data}
                    pagination={true}
                    paginationPageSize={50}
                    columnMenu='new'
                />
            </div>
        </Container>
    );
};

export default AgGridTable;
