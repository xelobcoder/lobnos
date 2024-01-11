import { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { customPost } from '../../Auth/customFetch';

const AddShelfForm = ({ handleClose, showModal, warehxlist, editdata=null}) => {
  const [warehouseList, setWarehouseList] = useState(warehxlist || []);
  const [message, setMessage] = useState({ message: '', target: '' });
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
      alert('Warehouse and Shelf Name are required!');
      return;
    }

    addShelfToDatabase(shelfData);
  };

  const addShelfToDatabase = async (data) => {
    const pushResponse = await customPost('inventory/shelve', 'POST', shelfData);
    const { message, statusCode, status } = pushResponse;
    if (statusCode === 200 && status === "success") {
      setMessage({ target: 'alert alert-success', message });
      setShelfData({ warehouseId: '', name: '' });
      setTimeout(() => {
           handleClose();
      }, 1000);
    } else {
      setMessage({target:'alert alert-danger opacity-75',message})
    }
  };



  return (
    <div>
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header className='fw-bold' closeButton>
           Add Shelf
        </Modal.Header>
      <Modal.Body>
      <div className={message.target}>
         {message.message}
       </div>
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
      <Button onClick={handleFormSubmit} variant="primary" type='button' className='btn-sm mx-2'>
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
