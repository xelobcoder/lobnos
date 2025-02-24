"use client";

import { useState, useEffect } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { customFetch, customPost } from "../../../../../../components/Auth/customFetch";
import { useApplicationSettings } from "../../../../../../components/Auth/useApplicationContext";
import style from '../../../../../../styles/SmsTemplateList.module.css';

interface Category {
    categoryid: number;
    categoryname: string;
    testid: number;
    createdby: string;
}

const CategoryForm = ({ params }: {
    params: {
        testid: number
    }
}) => {
    const { testid } = params;
    const [category, setCategory] = useState<string>("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const createdBy = useApplicationSettings().applicationsettings.user.employeeid;

    const API_BASE = "test/fields/category";

    const fetchCategories = async () => {
        try {
            const data = await customFetch(`${API_BASE}/test/${testid}`);
            setCategories(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [testid]);

    const handleAddCategory = async () => {
        if (!category.trim()) return alert("Category name is required");

        setLoading(true);
        try {
            const res = await customPost(API_BASE, 'POST', { categoryname: category, testid: testid, createdby: createdBy });
            setCategory("");
            await fetchCategories();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCategory = async () => {
        if (!editingCategory || !category.trim()) return;

        setLoading(true);
        try {
            const res = await customPost(`${API_BASE}/${editingCategory.categoryid}`, 'PUT', { categoryname: category });
            setEditingCategory(null);
            setCategory("");
            await fetchCategories();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (id: number) => {
        setLoading(true);
        try {
            const res = await customPost(`${API_BASE}/${id}`, 'DELETE', {});
            await fetchCategories();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (cat: Category) => {
        setEditingCategory(cat);
        setCategory(cat.categoryname);
    };

    return (
        <div>
            <Form>
                <Form.Group className="mb-3" controlId="categoryName">
                    <Form.Label className="pls-label bg-secondary-subtle p-2 br-5">
                        {editingCategory ? "Edit Field Constraints Category" : "Add Field Constraints Category"}
                    </Form.Label>
                    <Form.Control
                        type="text"
                        className="custom-input"
                        placeholder="Enter category name"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={loading}
                    />

                    <Button
                        variant={editingCategory ? "warning" : "primary"}
                        onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                        size="sm"
                        className="my-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                {editingCategory ? "Updating..." : "Adding..."}
                            </>
                        ) : (
                            editingCategory ? "Update Field Category" : "Add Field Category"
                        )}
                    </Button>

                    {editingCategory && (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="mx-2"
                            onClick={() => setEditingCategory(null)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    )}
                </Form.Group>
            </Form>

            {categories.length > 0 && (
                <div className="mt-3">
                    <h6 className="bg-secondary-subtle p-2 br-5 pls-label">Categories</h6>
                    <table className={style.table}>
                        <thead>
                            <tr>
                                <th className="pls-label">Category Name</th>
                                <th className="pls-label">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="table-sm">
                            {categories.map((cat) => (
                                <tr key={cat.categoryid}>
                                    <td className="text-sm text-capitalize">{cat.categoryname}</td>
                                    <td className="text-sm text-capitalize">
                                        <Button
                                            size="sm"
                                            variant="outline-success"
                                            onClick={() => handleEditClick(cat)}
                                            disabled={loading}
                                        >
                                            Edit
                                        </Button>{" "}
                                        <Button
                                            size="sm"
                                            variant="outline-danger"
                                            onClick={() => handleDeleteCategory(cat.categoryid)}
                                            disabled={loading}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CategoryForm;