import { Modal, Button } from 'react-bootstrap';

const style = {
  position: 'absolute',
  top: '20%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 450,
  bgcolor: 'background.paper',
  border: '4px solid black',
  boxShadow: 24,
  // borderRadius: '10px',
  p: 4,
};

const OptionsTrackClient = forwardRef((props, ref) => {
  const [open, setOpen] = useState(false);

  
  return (
    <div>
      <Modal 
        show={open} 
        onHide={handleClose}
        centered
        style={{
          transform: 'translate(-50%, -50%)',
          top: '20%',
          left: '50%',
          width: '450px'
        }}
      >
        <Modal.Body className="border-4 p-4">
          <h4 className="mb-4">Please, what do you want to track?</h4>
          <div className="d-flex justify-content-between">
            <Button 
              variant="warning" 
              className="lead p-2"
            >
              Track this transaction test
            </Button>
            <Button 
              variant="primary" 
              className="lead p-2"
              onClick={(ev) => console.log('Tracking at all times ')}
            >
              Track at all times
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
});

export default OptionsTrackClient;
