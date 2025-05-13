import { Dropdown } from 'react-bootstrap';
import { RiCheckLine, RiEyeLine, RiMore2Fill } from '@remixicon/react';
const ActionDropdown = ({
     onValidate,
     onViewResult,
     onNavigate
}) => {
     return (
          <Dropdown>
               <Dropdown.Toggle variant="link" size="sm" className="p-0">
                    <RiMore2Fill size="16" />
               </Dropdown.Toggle>
               <Dropdown.Menu>
                    <Dropdown.Item onClick={onValidate}>
                         <RiCheckLine size="16" className="me-2" /> Validate
                    </Dropdown.Item>
                    <Dropdown.Item onClick={onViewResult}>
                         <RiEyeLine size="16" className="me-2" /> View Result
                    </Dropdown.Item>
                    <Dropdown.Item onClick={onNavigate}>
                         <RiEyeLine size="16" className="me-2" /> Update Result Values
                    </Dropdown.Item>
               </Dropdown.Menu>
          </Dropdown>
     );
};

export default ActionDropdown;
