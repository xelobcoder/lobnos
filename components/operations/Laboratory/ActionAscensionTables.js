import { ButtonGroup, Button } from "react-bootstrap";
import { RiCheckLine, RiEyeLine } from "@remixicon/react";
const ActionDropdown = ({
  onValidate,
  allowValidationUpaid,
  paymentstatus,
  onViewResult,
  onNavigate,
}) => {
  return (
    <ButtonGroup size="sm">
      <Button
        disabled={Number(allowValidationUpaid) !== 1 && String(paymentstatus || "").trim().toLowerCase() !== "paid"}
        variant="outline-success"
        onClick={onValidate}
      >
        Validate <RiCheckLine size="16" className="ms-2" />
      </Button>
      <Button variant="outline-primary" onClick={onNavigate}>
        Update  <RiEyeLine size="16" className="ms-2" />
      </Button>
    </ButtonGroup>
  );
};

export default ActionDropdown;
