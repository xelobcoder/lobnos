import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

const AddShelfForm = ({ handleClose, showModal,warehxlist}) => {
  const [warehouseList, setWarehouseList] = useState(warehxlist || []);
  const [shelfData, setShelfData] = useState({warehouseId: '',name: ''});


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShelfData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!shelfData.warehouseId.trim() || !shelfData.name.trim()) {
      alert('Warehouse ID and Shelf Name are required!');
      return;
    }

    addShelfToDatabase(shelfData);

    setShelfData({warehouseId: '',name: ''});

    handleClose();
  };

  const addShelfToDatabase = (data) => {
    console.log('Adding shelf to the database:', data);
  };



  return (
    <div><Modal show={showModal} onHide={handleClose}>
        <Modal.Header className='fw-bold' closeButton>
           Add Shelf
        </Modal.Header>
        <Modal.Body>
          <form>
            <label>
              Warehouse:
          </label>
          <select
              className='custom-select'
                name="warehouseId"
                value={shelfData.warehouseId}
                onChange={handleInputChange}
              >
                <option value="" disabled>Select a Warehouse</option>
                {warehouseList.map(warehouse => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            <label>
              Shelf Name:
          </label>
          <input
            type="text"
            name="name"
            className='custom-input'
              value={shelfData.name}
              onChange={handleInputChange}
            />
          </form>
      </Modal.Body>
      <Modal.Footer>
      <Button variant="primary" type='button' className='btn-sm mx-2'>
              Add Shelf
        </Button>
        <Button onClick={handleClose} variant='danger' className='btn-sm mx-2'>
          close
        </Button>
      </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddShelfForm;
