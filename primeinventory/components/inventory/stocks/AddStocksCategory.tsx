'use client'
import { useEffect, useState } from 'react';
import { Modal, ListGroup, ListGroupItem, Button } from 'react-bootstrap';
import { customPost } from '../../../Lib/fetcher';
import { getDataAndUpdateState } from '../Util';

interface Category {
	id?: number;
	category: string;
	edit: boolean;
}

interface Message {
	message: string;
	state: string;
}

interface AddStockCategoryProps {
	show: boolean;
	onHide: () => void;
	edit?: boolean;
}

export default function AddStockCategory({ show, onHide, edit }: AddStockCategoryProps) {
	const [category, setCategory] = useState<Category>({ category: '', edit: false });
	const [categoryList, setCategoryList] = useState<Category[]>([]);
	const [message, setMessage] = useState<Message>({ message: '', state: '' });
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			await getDataAndUpdateState({
				setfxn:setCategoryList, endpoint:'stock/category'});
			setLoading(false);
		};

		fetchData();
	}, []);

	const EditCat = (id: number) => {
		const matched = categoryList.filter(item => item.id === id);
		if (matched.length === 0) return;
		matched[0].edit = true;
		setCategory(matched[0]);
	};

	const handleSubmit = async (ev: React.FormEvent) => {
		ev.preventDefault();
		if (category.category.length === 0) {
			setMessage({ message: 'All fields are required', state: 'alert alert-danger' });
			return;
		}

		const method = category.edit ? 'PUT' : 'POST';
		const pushCat = await customPost('stock/category', method, category);
		const { statusCode, status, message } = pushCat;

		if (statusCode === 200 && status === 'success') {
			setMessage({ message, state: 'alert alert-success' });
			setCategory({ category: '', edit: false });
			return;
		}

		setMessage({ message, state: 'alert alert-danger' });
	};

	const deleteCategory = async (categoryId: number) => {
		if (!categoryId) return;
		const confirmation = window.confirm('Are certain you want to delete this stock category, this will affect your stock records');
		if (!confirmation) return;

		setLoading(true);
		const pushDelete = await customPost('stock/category', 'DELETE', { id: categoryId });
		const { statusCode, status, message } = pushDelete;

		if (statusCode === 200 && status === 'success') {
			setMessage({ message, state: 'alert alert-success' });
			setCategoryList(categoryList.filter(item => item.id !== categoryId));
			setLoading(false);
			return;
		}

		setMessage({ message, state: 'alert alert-danger' });
		setLoading(false);
	};

	return (
		<Modal show={show}>
			<Modal.Header className='bg-secondary-subtle br-0 text-capitalize' closeButton onHide={onHide}>
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
							onChange={(ev) => { setCategory({ ...category, category: ev.target.value }); }}
							className='custom-input' type='text' />
						<Button
							onClick={() => { setCategory({ category: '', edit: false }); }}
							size='sm'
							className='mx-2 p-1'
							variant='outline'>
							restore
						</Button>
					</div>
				</form>
				{loading ? (<div className='loader'></div>) : (
					<ListGroup className='br-0 mt-2'>
						{categoryList.map((item, index) => (
							<ListGroupItem key={index} className='text-sm d-flex justify-content-between pointer'>
								<span>{item.category}</span>
								<div>
									<span>
										<button onClick={() => { EditCat(item.id!); }} color='primary' >Edit</button>
									</span>
									<span>
										<button onClick={() => { deleteCategory(item.id!); }} color='error' >
											Delete
										</button>
									</span>
								</div>
							</ListGroupItem>
						))}
					</ListGroup>
				)}
			</Modal.Body>
			<Modal.Footer>
				<button onClick={handleSubmit} className='btn btn-primary btn-sm'>
					Save
				</button>
				<button type='button' onClick={onHide} className='btn btn-danger btn-sm'>
					Cancel
				</button>
			</Modal.Footer>
		</Modal>
	);
}
