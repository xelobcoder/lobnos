import { useEffect, useState } from 'react';
import { Form, Button, Row } from 'react-bootstrap';
import { customPost } from '../Auth/customFetch';
import { toast } from 'react-toastify';
import { useApplication} from '../Auth/useApplicationContext';


export default function DrugCategoryForm({ edit, reset }) {
    const { employeeid } = useApplication()?.user;
    const [categoryName, setCategoryName] = useState('');
    const [description, setDescription] = useState('');
    const [buttonNote, setButtonNote] = useState('Add Category');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (employeeid && categoryName) {
            const method = edit.editid ? 'PUT' : 'POST';
            let drugCategoryData = {
                categoryName,
                description,
                createdBy: employeeid,
            };
            if (method == "PUT") {
                drugCategoryData['id'] = edit.editid;
            }
            const response = await customPost(`drugsCategory`, method, drugCategoryData);
            const { status, message } = response;
            if (status && status === true) {
                setCategoryName('');
                setDescription('');
                toast.success(message);
            } else {
                toast.error(message)
            }
            if (edit.editing) {
                reset();
                setButtonNote('Add Category')
            }
        }

    };

    useEffect(() => {
        if (edit.editing) {
            const { description, name } = edit;
            setDescription(description);
            setCategoryName(name);
            setButtonNote('Update Drug Category')
        }
    }, [edit])


    return (
        <Form className='p-3 br-0 heightedBorder bg-secondary-subtle my-2' onSubmit={handleSubmit}>
            <Row className="mb-3 col-12">
                <Form.Group className='grid-reg' controlId="formCategoryName">
                    <Form.Label>Category Name</Form.Label>
                    <Form.Control
                        type="text"
                        className='custom-input pls-color text-sm'
                        placeholder="Enter category name"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className='grid-reg my-2' controlId="formDescription">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        type="text"
                        className='custom-input pls-color text-sm'
                        placeholder="Enter description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </Form.Group>
            </Row>
            <Button variant="primary" style={{ marginLeft: '10.5%' }} className='btn-sm' type="submit">
                {buttonNote}
            </Button>
        </Form>
    );
}
