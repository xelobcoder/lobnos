import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import CheckIcon from '@mui/icons-material/Check';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';


const ActionDropdown = ({
     onValidate,
     onViewResult,
}) => {
  

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
               </Dropdown.Menu>
          </Dropdown>
     );
};

export default ActionDropdown;
