import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import CheckIcon from '@mui/icons-material/Check';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ActionDropdown = ({
     onValidate,
     onViewResult,
     onEdit,
     onDelete,
     onFilterChange
}) => {
     const [filterValue, setFilterValue] = useState('');
     const [filterType, setFilterType] = useState('');

     const handleFilterOption = (selectedFilterType) => {
          setFilterType(selectedFilterType);
          setFilterValue(''); // Reset input field
          onFilterChange(selectedFilterType); // Trigger parent filter change
     };

     const handleApplyFilter = () => {
          if (filterValue && filterType) {
               // Call the parent's filter function with value and type
               onFilterChange(filterType, filterValue);
               setFilterType(''); // Reset filter type
               setFilterValue(''); // Reset input field
          }
     };

     return (
          <Dropdown>
               <Dropdown.Toggle variant="link" size="sm" className="p-0">
                    <MoreVertIcon fontSize="small" />
               </Dropdown.Toggle>
               <Dropdown.Menu>
                    <Dropdown.Item onClick={onValidate}>
                         <CheckIcon fontSize="small" className="me-2" /> Validate
                    </Dropdown.Item>
                    <Dropdown.Item onClick={onViewResult}>
                         <VisibilityIcon fontSize="small" className="me-2" /> View Result
                    </Dropdown.Item>
                    <Dropdown.Item onClick={onEdit}>
                         <EditIcon fontSize="small" className="me-2" /> Edit
                    </Dropdown.Item>
                    <Dropdown.Item onClick={onDelete} className="text-danger">
                         <DeleteIcon fontSize="small" className="me-2" /> Delete
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Header>Filter Options</Dropdown.Header>
                    <Dropdown.Item onClick={() => handleFilterOption('match')}>
                         Match
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleFilterOption('contain')}>
                         Contain
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleFilterOption('doesNotContain')}>
                         Does Not Contain
                    </Dropdown.Item>
                    {filterType && (
                         <div className="p-2">
                              <input
                                   type="text"
                                   className="form-control"
                                   placeholder={`Enter value to ${filterType}`}
                                   value={filterValue}
                                   onChange={(e) => setFilterValue(e.target.value)}
                              />
                              <button
                                   className="btn btn-primary btn-sm mt-1"
                                   onClick={handleApplyFilter}
                              >
                                   Apply
                              </button>
                         </div>
                    )}
               </Dropdown.Menu>
          </Dropdown>
     );
};

export default ActionDropdown;
