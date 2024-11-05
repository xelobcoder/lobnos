import React from "react";
import { Modal, Button } from "react-bootstrap";

const ValidationModal = ({ show, onClose, test }) => {
     return (
          <Modal show={show} onHide={onClose} size="lg">
               <Modal.Header className="fw-bold bg-secondary-subtle" closeButton>
                    <Modal.Title>Validation </Modal.Title>
               </Modal.Header>
               <Modal.Body>
                  
               </Modal.Body>
               <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                    <Button variant="primary">Validate</Button>
               </Modal.Footer>
          </Modal>
     );
};

export default ValidationModal;
