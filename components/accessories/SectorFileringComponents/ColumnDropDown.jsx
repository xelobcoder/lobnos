"use client"
import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';

const PrimeDropDown = ({ Tablecolumns, isLoading, onSelect }) => {
     const [selectedColumn, setSelectedColumn] = useState(null);
     const [columns, setColumns] = useState(Tablecolumns);

     const handleSelect = (eventKey) => {
          const column = columns.find(col => col.field === eventKey);
          if (column) {
               setSelectedColumn(column);
               onSelect(column);
          }
     };

     if (isLoading) {
          return <div >Loading...</div>;
     }

     return (
          <Dropdown onSelect={handleSelect}>
               <Dropdown.Toggle variant='light
                    {selectedColumn ? selectedColumn.field : "Select Column"}
               </Dropdown.Toggle>
               <Dropdown.Menu >
                    {Array.isArray(columns) && columns.length > 0 && columns.map((column) => (
                         <Dropdown.Item
                              key={column.field}
                              eventKey={column.field}
                              style={styles.dropdownItem}
                         >
                              {column.field}
                         </Dropdown.Item>
                    ))}
               </Dropdown.Menu>
          </Dropdown>
     );
};


export default PrimeDropDown;
