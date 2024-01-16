import { useEffect, useState } from 'react';
import { Modal,ListGroup,ListGroupItem } from 'react-bootstrap';
import { customPost, getDataAndUpdateState } from '../../Auth/customFetch';
import { Delete, Edit } from '@mui/icons-material';
export default function AddStockCategory({ show, onHide, edit}) {
   const [category, setcategory] = useState({ category: '',edit: false });
   const [CategoryList, setCategoryList] = useState([]);
   const [message, setMessage] = useState({ message: '', state: '' });

   useEffect(() => {
      getDataAndUpdateState(setCategoryList, 'stock/category');
   }, [])

   const EditCat = (id) => {
      const matched = CategoryList.filter((item, index) => { return item.id === parseInt(id) });
      if (matched.length === 0) return;
      matched[0].edit = true;
      setcategory(matched[0]);
   }
   
   const handleSubmit = async (ev) => {
      ev.preventDefault();
      if (category.category.length === 0) {
         setMessage({ message: 'All fields are required', state: 'alert alert-danger' });
         return;
      }
      const pushCat = await customPost('stock/category', 'POST', { category: category.category });
      const { statusCode, status, message } = pushCat;
      if (statusCode === 200 && status === 'success') {
         setMessage({ message, state: 'alert alert-success' });
         setcategory({ category: '' });
         return;
      }
      setMessage({ message, state: 'alert alert-danger' });
   }
   return (
      <>
         <Modal show={show}>
            <Modal.Header closeButton onHide={onHide}>
               Add stock category
            </Modal.Header>
            <Modal.Body>
            <div className={`${message.state} mx-1 mt-2 text-sm p-2 bg-opacity-50`}>
               {message.message}
            </div>
               <form>
                  <label className='label text-sm mb-0'>Category name</label>
                  <input
                     value={category.category}
                     onChange={(ev) => {setcategory({...category,category:ev.target.value})}}
                     className='custom-input' type='text' />
               </form>
               <ListGroup className='br-0 mt-2'>
            {
               CategoryList.map((item, index) => {
                  return (
                     <ListGroupItem style={{maxHeight:'30vh',overflowY: 'auto'}} key={index} className='text-sm mx-1 d-flex justify-content-between pointer'>
                        <span>{item?.category}</span>
                        <div>
                           <span>
                              <Edit onClick={(ev) => { EditCat(item?.id); }} color='primary'/>
                           </span>
                           <span>
                              <Delete color='error'/>
                           </span>
                        </div>
                    </ListGroupItem>
                  )
               })
            }
            </ListGroup>
            </Modal.Body>
            <Modal.Footer>
               <button onClick={handleSubmit} className='btn btn-primary btn-sm'>
                  save
               </button>
               <button type='button' onClick={onHide} className='btn btn-danger btn-sm'>
                  cancel
               </button>
            </Modal.Footer>
        </Modal>
      </>
   )
}