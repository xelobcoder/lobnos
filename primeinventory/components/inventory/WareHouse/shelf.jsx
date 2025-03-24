import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { customPost } from '../../../Lib/fetcher';


const AddShelfForm = ({ handleClose, showModal, warehxlist, editdata = null }) => {
  const [warehouseList, setWarehouseList] = useState(warehxlist || []);
  const [message, setMessage] = useState({ message: '', target: '' });
  const [shelfData, setShelfData] = useState({ warehouseId: '', name: '' });


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
        handleClose(true);
      }, 1000);
    } else {
      setMessage({ target: 'alert alert-danger opacity-75', message })
    }
  };



  return (
    <div>
      <Modal show={showModal} onHide={handleClose} size='lg' style={{ zIndex: 9999 }}>
        <Modal.Header className='fw-bold' closeButton>
          Add Shelf
        </Modal.Header>
        <Modal.Body>
          <div className={message.target}>
            {message.message}
          </div>
          <form>
            <label className='text-sm'>
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
            <label className='text-sm'>
              Shelf Name:
            </label>
            <input
              type="text"
              name="name"
              className='custom-input'
              value={shelfData.name}
              onChange={handleInputChange}
            />
            <label className='text-sm'>Max Quantity it can contain</label>
            <input type='number' name='quantity' className='custom-input' value={shelfData.quantity} />
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
