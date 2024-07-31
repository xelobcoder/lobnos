"use client"
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { data } from './data';

const AgGridTable = () => {

    const columnDefs = [
        { headerName: "Primary Key", field: "prim_key" },
        { headerName: "Name", field: "name" },
        { headerName: "Category", field: "category" },
        { headerName: "Price", field: "price" },
        { headerName: "Created On", field: "created_on" },
        { headerName: "Sample", field: "sample" },
        { headerName: "Description", field: "description" },
        { headerName: "Sample Container", field: "sample_container" },
        { headerName: "Unit", field: "unit" },
        { headerName: "Quantity Required", field: "qty_required" },
        { headerName: "Short Text", field: "shorttext" },
        { headerName: "Is Custom", field: "iscustom" },
        { headerName: "ID", field: "id" },
        { headerName: "Sample ID", field: "sampleid" }
    ];

    return (
        <div className="ag-theme-balham" style={{ height: 600, width: '100%' }}>
            <AgGridReact
                columnDefs={columnDefs}
                rowData={data}
                pagination={true}
                paginationPageSize={50}
            />
        </div>
    );
};

export default AgGridTable;
