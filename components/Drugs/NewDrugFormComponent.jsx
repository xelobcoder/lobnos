import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { customFetch, customPost } from '../Auth/customFetch';
import AuthContext from '../Auth/useAuthentification';
import { ToastContainer, toast } from 'react-toastify';

export default function AddNewDrugFormPLSMASTER({ editing }) {
    const { auth } = useContext(AuthContext);
    const employeeid = auth?.employeeid;
    const [drugName, setDrugName] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [validated, setValidated] = useState(false);
    const [buttonNote, setButtonNote] = useState('Add New Drug');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await customFetch('drugsCategory');
                setCategories(response);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.stopPropagation();
            setValidated(true);
            return;
        }

        try {
            if (!employeeid) return; 
            const method = editing.editing == true ? 'PUT' : 'POST';
            let data = {
                drug: drugName,
                category: category,
                createdBy: employeeid
            }
            if (method === "PUT")
            {
                data['id'] = editing.editid;
            }
            const response = await customPost('drugs', method, data);
            const { status, message } = response;
            if (status) {
                setDrugName('');
                setCategory('');
                setValidated(false);
                toast.success(message);
                setButtonNote('Add New Drug')
            } else {
                toast.error(message);
            }
        } catch (error) {
            console.error('Error adding drug:', error);
        }
    };

    useEffect(() => {
        if (editing.editing) {
            const { category, drugName } = editing;
            setCategory(category);
            setDrugName(drugName);
            setButtonNote('Update Drug Information');
        }
    }, [editing]);

    return (
        <div className="p-3  bg-secondary-subtle heightedBorder">
            <ToastContainer position="top-center" theme='colored' className={'text-sm'} />
            <Form noValidate validated={validated} onSubmit={handleSubmit} className='text-sm text-capitalize'>
                <Form.Group controlId="formDrugName " className='grid-reg'>
                    <Form.Label>Drug Name</Form.Label>
                    <InputGroup>
                        <Form.Control
                            type="text"
                            className='custom-input text-sm  pls-color'
                            placeholder="Enter drug name"
                            value={drugName}
                            onChange={(e) => setDrugName(e.target.value)}
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a drug name.
                        </Form.Control.Feedback>
                    </InputGroup>
                </Form.Group>
                <Form.Group className='grid-reg mt-2' controlId="formCategory">
                    <Form.Label>Category</Form.Label>
                    <Form.Control
                        as="select"

                        className='text-sm  pls-color custom-select'
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                            <option className='pls-color' key={cat.id} value={cat.id}>
                                {cat.categoryName}
                            </option>
                        ))}
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                        Please select a category.
                    </Form.Control.Feedback>
                </Form.Group>
                <Button variant="primary" className='mt-3 btn-sm' style={{ marginLeft: '11%' }} type="submit">
                    {buttonNote}
                </Button>
            </Form>
        </div>
    );
}
