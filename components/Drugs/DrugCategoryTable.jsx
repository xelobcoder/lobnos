import React, { useEffect, useState } from 'react';
import { Table, Spinner, Button } from 'react-bootstrap';
import { customFetch, customPost } from '../Auth/customFetch';
import { Delete, Edit, Refresh } from '@mui/icons-material';

export default function DrugCategoryTable({ handleEditCategory, refreshList }) {
    const [drugCategories, setDrugCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDrugCategories();
    }, []);

    const fetchDrugCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await customFetch('drugsCategory');
            setDrugCategories(response);
        } catch (error) {
            console.error('Error fetching drug categories:', error);
            setError('Failed to fetch drug categories');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            setLoading(true);
            setError(null);
            try {
                await customPost(`drugsCategory/:${id}`, 'DELETE');
                fetchDrugCategories(); 
            } catch (error) {
                console.error('Error deleting drug category:', error);
                setError('Failed to delete drug category');
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading) {
        return (
            <div className='d-flex justify-content-center mt-4'>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className='alert alert-danger mt-4' role='alert'>
                {error}
            </div>
        );
    }

    return (
        <div >
            <div className='heightedBorder my-3 p-2 d-flex justify-content-between bg-body-secondary'>
                <h5>Drug Categories</h5>
                <Refresh onClick={fetchDrugCategories} />
            </div>
            <Table className='ttable' >
                <thead>
                    <tr>
                        <th style={{ width: '5%' }}>#</th>
                        <th style={{ width: '10%' }}>Category Name</th>
                        <th style={{ width: '55%' }}>Description</th>
                        <th style={{ width: '20%' }}>Created By</th>
                        <th style={{ width: '10%' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(drugCategories) && drugCategories.length > 0 ? (
                        drugCategories.map((category, index) => (
                            <tr key={category.id}>
                                <td>{index + 1}</td>
                                <td>{category.categoryName}</td>
                                <td>{category.description}</td>
                                <td>{category.createdBy}</td>
                                <td>
                                    <Button
                                        type='button'
                                        onClick={() => handleEditCategory(category)}
                                        className='p-0'
                                        variant='primary'
                                    >
                                        <Edit />
                                    </Button>
                                    <Button
                                        className='p-0 mx-1'
                                        variant='danger'
                                        onClick={() => handleDelete(category.id)}
                                    >
                                        <Delete />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center">No categories found</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );
}
