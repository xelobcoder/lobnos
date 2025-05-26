"use client";

import React, { useState, useEffect, FormEvent } from 'react';

// Define the ExpenseCategory interface
interface ExpenseCategory {
  id: number;
  name: string;
  description?: string; // Make description optional to match mock data more easily if some lack it
}

// Mock data as per requirements
const mockCategoriesData: ExpenseCategory[] = [
  { id: 1, name: 'Travel', description: 'Expenses related to business travel' },
  { id: 2, name: 'Meals & Entertainment', description: 'Client meals and entertainment' },
  { id: 3, name: 'Software & Subscriptions', description: 'SaaS products and other subscriptions' },
  { id: 4, name: 'Office Supplies', description: 'Pens, paper, and other office needs' },
];

const ExpenseCategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<ExpenseCategory> | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{ name?: string }>({});

  // Simulate fetching categories
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setCategories(mockCategoriesData);
      setIsLoading(false);
    }, 500);
    // In a real app, you would fetch from an API:
    // customFetch('/api/expense-categories')
    //   .then(data => setCategories(data))
    //   .catch(error => console.error('Error fetching categories:', error))
    //   .finally(() => setIsLoading(false));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (currentCategory) {
      setCurrentCategory({ ...currentCategory, [e.target.name]: e.target.value });
    }
    // Clear specific error when user starts typing
    if (e.target.name === 'name' && formErrors.name) {
        setFormErrors(prevErrors => ({ ...prevErrors, name: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: { name?: string } = {};
    if (!currentCategory?.name?.trim()) {
      errors.name = 'Category name is required.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentCategory({ name: '', description: '' });
    setFormErrors({});
    setShowModal(true);
  };

  const handleOpenEditModal = (category: ExpenseCategory) => {
    setIsEditing(true);
    setCurrentCategory({ ...category });
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentCategory(null);
    setIsEditing(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !currentCategory) return;

    setIsLoading(true); // Simulate loading for API call

    if (isEditing && currentCategory.id) {
      // Simulate PUT request
      // console.log('Updating category:', currentCategory);
      // customFetch(`/api/expense-categories/${currentCategory.id}`, { method: 'PUT', body: JSON.stringify(currentCategory) })
      //   .then(updatedCategory => {
      //     setCategories(categories.map(cat => (cat.id === updatedCategory.id ? updatedCategory : cat)));
      //   })
      //   .catch(error => console.error('Error updating category:', error))
      //   .finally(() => setIsLoading(false));
      setTimeout(() => {
        setCategories(prevCategories =>
          prevCategories.map(cat => (cat.id === currentCategory.id ? (currentCategory as ExpenseCategory) : cat))
        );
        setIsLoading(false);
        handleCloseModal();
      }, 300);
    } else {
      // Simulate POST request
      // console.log('Adding new category:', currentCategory);
      // customFetch('/api/expense-categories', { method: 'POST', body: JSON.stringify(currentCategory) })
      //   .then(newCategory => {
      //     setCategories([...categories, newCategory]);
      //   })
      //   .catch(error => console.error('Error adding category:', error))
      //   .finally(() => setIsLoading(false));
      setTimeout(() => {
        const newCategoryWithId: ExpenseCategory = {
          ...currentCategory,
          id: Date.now(), // Simple ID generation for mock
          name: currentCategory.name!, // Name is validated
        };
        setCategories(prevCategories => [...prevCategories, newCategoryWithId]);
        setIsLoading(false);
        handleCloseModal();
      }, 300);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setIsLoading(true); // Simulate loading for API call
      // Simulate DELETE request
      // console.log('Deleting category with id:', id);
      // customFetch(`/api/expense-categories/${id}`, { method: 'DELETE' })
      //   .then(() => {
      //     setCategories(categories.filter(cat => cat.id !== id));
      //   })
      //   .catch(error => console.error('Error deleting category:', error))
      //   .finally(() => setIsLoading(false));
      setTimeout(() => {
        setCategories(prevCategories => prevCategories.filter(cat => cat.id !== id));
        setIsLoading(false);
      }, 300);
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4">Manage Expense Categories</h2>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          Add New Category
        </button>
      </div>

      {isLoading && categories.length === 0 && <p>Loading categories...</p>}
      {!isLoading && categories.length === 0 && (
        <div className="alert alert-info" role="alert">
          No expense categories found. Click "Add New Category" to get started.
        </div>
      )}

      {categories.length > 0 && (
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th style={{ width: '150px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(category => (
                    <tr key={category.id}>
                      <td>{category.name}</td>
                      <td>{category.description || '-'}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => handleOpenEditModal(category)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil-square"></i> Edit {/* Assuming Bootstrap Icons are available */}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(category.id)}
                          title="Delete"
                        >
                         <i className="bi bi-trash"></i> Delete {/* Assuming Bootstrap Icons are available */}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Add/Edit Category */}
      {showModal && currentCategory && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">{isEditing ? 'Edit' : 'Add'} Expense Category</h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="categoryName" className="form-label">Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                      id="categoryName"
                      name="name"
                      value={currentCategory.name || ''}
                      onChange={handleInputChange}
                      required
                    />
                    {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="categoryDescription" className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      id="categoryDescription"
                      name="description"
                      rows={3}
                      value={currentCategory.description || ''}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Category')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseCategoryPage;
