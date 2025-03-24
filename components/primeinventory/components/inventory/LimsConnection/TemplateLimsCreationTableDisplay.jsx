import React from "react";
import { Button } from 'react-bootstrap';
import '../../../styles/prime-table.css'


const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path fill="none" d="M0 0h24v24H0z"></path>
        <path d="M16.7574 2.99678L14.7574 4.99678H5V18.9968H19V9.23943L21 7.23943V19.9968C21 20.5491 20.5523 20.9968 20 20.9968H4C3.44772 20.9968 3 20.5491 3 19.9968V3.99678C3 3.4445 3.44772 2.99678 4 2.99678H16.7574ZM20.4853 2.09729L21.8995 3.5115L12.7071 12.7039L11.2954 12.7064L11.2929 11.2897L20.4853 2.09729Z"></path>
    </svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path fill="none" d="M0 0h24v24H0z"></path>
        <path d="M4 8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8ZM6 10V20H18V10H6ZM9 12H11V18H9V12ZM13 12H15V18H13V12ZM7 5V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V5H22V7H2V5H7ZM9 4V5H15V4H9Z"></path>
    </svg>
);

const  TemplateLimsCreationTableDisplay = ({ tableData, handleEditStock, handleDeleteStock }) => {


    if (tableData.length == 0) {
        return (<div className="alert alert-info  text-sm ">Template Not Defined for test</div>)
    }

    return (
        <div >
            <div className="d-none d-md-block bt-wrapper">
                <table className="bt mb-3 ">
                    <thead>
                        <tr>
                            <th>Stock Name</th>
                            <th>Unit</th>
                            <th>Deduction Quantity</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((item, index) => (
                            <tr key={item.value}>
                                <td>{item.label}</td>
                                <td>{item.consumptionunit}</td>
                                <td>{item.quantity}</td>
                                <td>
                                    <Button className="p-1" variant="primary" size="sm" onClick={() => handleEditStock(index)}>
                                        <EditIcon />
                                    </Button>
                                    <Button className="mx-2 p-1" variant="danger" size="sm" onClick={() => handleDeleteStock(index)}>
                                        <DeleteIcon />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="d-block d-md-none">
                <ul className="list-group m-0 pls-color">
                    {tableData.map((item, index) => (
                        <React.Fragment key={item.value}>
                            <li className="list-group-item bg-secondary-subtle fw-bold text-capitalize">
                                Stock Name: {item.label}
                            </li>
                            <div className="list-group-item">
                                <div className="d-flex flex-column flex-md-row justify-content-between">
                                    <span>Unit: {item.consumptionunit}</span>
                                    <span>Deduction Quantity: {item.quantity}</span>
                                </div>
                            </div>
                            <div className="list-group-item">
                                <div className="d-flex pointer justify-content-end">
                                    <span onClick={() => handleEditStock(index)} aria-label="Edit">
                                        <EditIcon />
                                    </span>
                                    <span onClick={() => handleDeleteStock(index)} aria-label="Delete">
                                        <DeleteIcon />
                                    </span>
                                </div>
                            </div>
                        </React.Fragment>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TemplateLimsCreationTableDisplay;
