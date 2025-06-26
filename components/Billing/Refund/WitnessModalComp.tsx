import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

interface WitnessModalCompProps {
     showModal: boolean;
     modalTitleHeader?: string;
     witnessMessage: string;  
     setWitnessMessage: (message: string) => void;
     handleSubmitWitness: () => void;
     setShowModal: (show: boolean) => void;
}

export default function WitnessModalComp({
     showModal,
     modalTitleHeader = "Witness Message",
     witnessMessage,
     setWitnessMessage,
     handleSubmitWitness,
     setShowModal,
}: WitnessModalCompProps) {
     return (
          <Modal
               backdrop="static"
               show={showModal}
               onHide={() => setShowModal(false)}
          >
               <Modal.Header closeButton>
                    <Modal.Title>{modalTitleHeader}</Modal.Title>
               </Modal.Header>
               <Modal.Body>
                    <Form.Control
                         as="textarea"
                         rows={3}
                         value={witnessMessage}
                         onChange={(e) => setWitnessMessage(e.target.value)}
                         placeholder="Add a message as a witness"
                    />
               </Modal.Body>
               <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                         Close
                    </Button>
                    <Button variant="primary" onClick={handleSubmitWitness}>
                         Submit Witness Message
                    </Button>
               </Modal.Footer>
          </Modal>
     );
}
