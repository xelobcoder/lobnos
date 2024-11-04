import { useEffect, useState } from 'react';
import { Modal, ListGroup, ListGroupItem } from 'react-bootstrap';
import { customPost, getDataAndUpdateState } from '../../Auth/customFetch';
import { Delete, Edit, Restore } from '@mui/icons-material';
import { Button } from '@mui/material';
export default function AddStockCategory({ show, onHide, edit }) {
	const [category, setcategory] = useState({ category: '', edit: false });
	const [CategoryList, setCategoryList] = useState([]);
	const [message, setMessage] = useState({ message: '', state: '' });
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);
		getDataAndUpdateState(setCategoryList, 'stock/category');
		setLoading(false);
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
		const method = category.edit === true ? 'PUT' : 'POST';
		const pushCat = await customPost('stock/category', method, category);
		const { statusCode, status, message } = pushCat;
		if (statusCode === 200 && status === 'success') {
			setMessage({ message, state: 'alert alert-success' });
			setcategory({ category: '', edit: false })
			return;
		}
		setMessage({ message, state: 'alert alert-danger' })
	}


	const deleteCategory = async (categoryid) => {
		if (!categoryid) return;
		const confirmation = window.confirm('Are certain you want to delete this stock category, this will affect your stocks records');
		if (!confirmation) return;
		setLoading(true);
		const pushDelete = await customPost('stock/category', 'DELETE', { id: categoryid });
		const { statusCode, status, message } = pushDelete;
		if (statusCode === 200 && status === 'success') {
			setMessage({ message, state: 'alert alert-success' });
			setCategoryList(
				CategoryList.filter((item, index) => item?.id != categoryid)
			)
			setLoading(false);
			return;
		}
		setMessage({ message, state: 'alert alert-danger' });
		setLoading(false);
	}
	return (
		<>
			<Modal show={show}>
				<Modal.Header className=' bg-secondary-subtle br-0 text-capitalize' closeButton onHide={onHide}>
					Add stock category
				</Modal.Header>
				<Modal.Body>
					<div className={`${message.state} mx-1 mt-2 text-sm p-2 bg-opacity-50`}>
						{message.message}
					</div>
					<form>
						<label className='label text-sm mb-0'>Category name</label>
						<div className='d-flex justify-content-between pointer'>
							<input
								value={category.category}
								onChange={(ev) => { setcategory({ ...category, category: ev.target.value }) }}
								className='custom-input' type='text' />
							<Button onClick={(ev) => { setcategory({ category: '', edit: false }) }} size='small' className='mx-2 p-1' sx={{ marginTop: '-5px' }} variant='outline'>
								<Restore />
							</Button>
						</div>
					</form>
					{
						loading ? (<div className='loader'></div>) :
							(
								<ListGroup className='br-0 mt-2'>
									{
										CategoryList.map((item, index) => {
											return (
												<ListGroupItem key={index} className='text-sm  d-flex justify-content-between pointer'>
													<span>{item?.category}</span>
													<div>
														<span>
															<Edit onClick={(ev) => { EditCat(item?.id); }} color='primary' />
														</span>
														<span>
															<Delete onClick={(ev) => { deleteCategory(item?.id); }} color='error' />
														</span>
													</div>
												</ListGroupItem>
											)
										})
									}
								</ListGroup>
							)
					}
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