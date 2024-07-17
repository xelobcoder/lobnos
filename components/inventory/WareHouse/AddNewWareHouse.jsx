import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { customPost } from '../../Auth/customFetch';

const AddWarehouseForm = ({ showModal, handleClose,editing,editingdata}) => {
  const [message, setMessage] = useState({ message: '', target: '' });
  const [method, setMethod] = useState("POST");
  const [warehouseData, setWarehouseData] = useState({
    name: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWarehouseData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!warehouseData.name.trim()) {
      alert('Warehouse name is required!');
      return;
    }

    addWarehouseToDatabase(warehouseData);
  };

  const addWarehouseToDatabase = async () => {
    try {
      const pushResponse = await customPost(`inventory/warehouse`,method,warehouseData);
      const { message, statusCode, status } = pushResponse;
      if (statusCode === 200 && status === "success") {
        setMessage({ target: 'alert alert-success opacity-75', message});
      } else {
        setMessage({target:'alert alert-danger opacity-75',message})
      }
      setWarehouseData({name: ''})
      setTimeout(() => {
        handleClose(true);
      },1000)
    } catch(err) {setMessage({target:'alert alert-danger opacity-75',message: err || "something went wrong"})}
  };


  useEffect(() => {
    if (editing == true && Object.keys(editingdata).length == 2) {
      const { name, warehouseid } = editingdata;
      setWarehouseData({ name,warehouseid});
      setMethod('PUT');
     }
  },[editing,editingdata])
  return (
    <Modal show={showModal} onHide={handleClose} backdrop="static">
      <Modal.Header className='fw-bold'  closeButton>
        New WareHouse
      </Modal.Header>
      <Modal.Body>
        <div className={message.target}>
         {message.message}
       </div>
        <Form autoComplete='off'>
          <Form.Group controlId="formWarehouseName">
            <Form.Label>Warehouse Name:</Form.Label>
            <Form.Control
              type="text"
              name="name"
              className='custom-input'
              value={warehouseData.name}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
      <Button variant="primary" className='btn-sm' onClick={handleFormSubmit}>
          Add Warehouse
        </Button>
        <Button variant="danger" className='btn-sm' onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddWarehouseForm;
