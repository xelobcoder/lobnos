'use client';
import React, { useEffect, useState } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import TemplateFormModal from './TemplateFormModal';
import { toast } from 'react-toastify';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';
import Loader from '../../../../components/accessories/Loader';
import { customPost,customFetch } from '../../../../components/Auth/customFetch';
import { handleServerProcessingSmsTemplates } from '../../../../components/serverActions/ActionFiltering';


type TemplateCategory = 'patient' | 'clinician' | 'organization';

interface SMSTemplate {
     id: string;
     name: string;
     body: string;
     category: TemplateCategory;
     createdBy: string;
     createdAt: string;
}

const categoryOptions = [
     { label: 'Patient', value: 'patient' },
     { label: 'Clinician', value: 'clinician' },
     { label: 'Organization', value: 'organization' },
];

const fetchTemplates = async () => {
     const data = await customFetch('prime/sms-templates-paginated');
     if (!data || !Array.isArray(data.templates)) throw new Error('Failed to fetch templates');
     // Normalize response to SMSTemplate[]
     return data.templates.map((item) => ({
          id: String(item.templateid),
          name: item.name,
          body: item.body,
          category: item.category,
          createdBy: item.createdbyname || String(item.createdby),
          createdAt: item.createdat,
     }));
};

const fetchTemplate = async (id: string) => {
     const data = await customFetch(`prime/sms-templates/${id}`);
     if (!data) throw new Error('Failed to fetch template');
     return data;
};

const createTemplate = async (data: Partial<SMSTemplate>) => {
     const result = await customPost('prime/sms-templates', 'POST', data);
     if (!result) throw new Error('Failed to create template');
     return result;
};

const updateTemplate = async (id: string, data: Partial<SMSTemplate>) => {
     const result = await customPost(`prime/sms-templates/${id}`, 'PUT', data);
     if (!result) throw new Error('Failed to update template');
     return result;
};

const deleteTemplate = async (id: string) => {
     const result = await customPost(`prime/sms-templates/${id}`, 'DELETE', {});
     if (!result) throw new Error('Failed to delete template');
};

const SmsTemplatesPage: React.FC = () => {
     const [templates, setTemplates] = useState<SMSTemplate[]>([]);
     const [loading, setLoading] = useState(false);
     const [formLoading, setFormLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [modalVisible, setModalVisible] = useState(false);
     const [editingTemplate, setEditingTemplate] = useState<SMSTemplate | null>(null);
     const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; templateId: string | null; templateName: string }>({
          show: false,
          templateId: null,
          templateName: ''
     });

     const loadTemplates = async () => {
          setLoading(true);
          setError(null);
          try {
               const data = await fetchTemplates();
               setTemplates(data);
          } catch (e: any) {
               setError(e.message || 'Error loading templates');
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          loadTemplates();
     }, []);

     const handleCreate = () => {
          setEditingTemplate(null);
          setModalVisible(true);
     };

     const handleEdit = async (id: string) => {
          setFormLoading(true);
          try {
               const data = await fetchTemplate(id);
               setEditingTemplate(data);
               setModalVisible(true);
          } catch (e: any) {
               toast.error(e.message || 'Failed to load template');
          } finally {
               setFormLoading(false);
          }
     };

     const handleDelete = async (id: string) => {
          setLoading(true);
          try {
               await deleteTemplate(id);
               toast.success('Template deleted successfully');
               loadTemplates();
          } catch (e: any) {
               toast.error(e.message || 'Failed to delete template');
          } finally {
               setLoading(false);
               setConfirmDelete({ show: false, templateId: null, templateName: '' });
          }
     };

     const showDeleteConfirmation = (id: string, name: string) => {
          setConfirmDelete({ show: true, templateId: id, templateName: name });
     };

     const handleConfirmDelete = () => {
          if (confirmDelete.templateId) {
               handleDelete(confirmDelete.templateId);
          }
     };

     const handleCancelDelete = () => {
          setConfirmDelete({ show: false, templateId: null, templateName: '' });
     };

     const handleFormSubmit = async (status: boolean) => {
          try {
               if (!status) return;
               setFormLoading(true);
               fetchTemplates()
          } catch (e: any) {
               toast.error(e.message || 'Failed to submit form');
          } finally {
               setFormLoading(false);
               setModalVisible(false);
               setEditingTemplate(null);
               loadTemplates();
          }
     }



     const columns = [
          { Header: 'Template Name', accessor: 'name' },
          { Header: 'Body', accessor: 'body' },
          { Header: 'Category', accessor: 'category', Cell: ({ value }: { value: TemplateCategory }) => categoryOptions.find((c) => c.value === value)?.label || value },
          { Header: 'Created By', accessor: 'createdBy' },
          { Header: 'Created At', accessor: 'createdAt', Cell: ({ value }: { value: string }) => new Date(value).toLocaleString() },
          {
               Header: 'Actions',
               accessor: 'actions',
               Cell: ({ row }: any) => (
                    <>
                         <button className="btn  p-0 me-2" onClick={() => handleEdit(row.original.id)}>
                              Edit
                         </button>
                         <button
                              className="btn  text-danger p-0"
                              onClick={() => showDeleteConfirmation(row.original.id, row.original.name)}
                         >
                              Delete
                         </button>
                    </>
               ),
               disableSortBy: true,
          },
     ];

     if (loading && templates.length === 0) return <Loader />

     if (templates.length === 0 && !loading) {
          return (
               <div>
                    <Card >
                         <Card.Header>
                              <h5 className="mb-0">SMS Templates</h5>
                         </Card.Header>
                         <Card.Body className="text-center">
                              <h3 className="mb-3">No SMS Templates Found</h3>
                              <Button variant="primary" onClick={handleCreate}>Create Template</Button>
                         </Card.Body>
                    </Card>
               </div>
          );
     }

     return (
          <div>
               <h2>SMS Template Management</h2>
               <button className="btn btn-primary mb-3" onClick={handleCreate}>
                    Create Template
               </button>
               <PrimeTable
                    data={templates}
                    column={columns}
                    serverSideFiltering={true}
                    handleSeverSideProcessing={handleServerProcessingSmsTemplates}
               />
               <TemplateFormModal
                    visible={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    onSubmit={handleFormSubmit}
                    initialValues={editingTemplate || undefined}
                    loading={formLoading}
               />
               
               {/* Delete Confirmation Modal */}
               <Modal show={confirmDelete.show} onHide={handleCancelDelete} centered size="sm">
                    <Modal.Header closeButton>
                         <Modal.Title>Confirm Delete</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         <p className="mb-0">
                              Are you sure you want to delete the template <strong>{confirmDelete.templateName}</strong>?
                         </p>
                         <p className="text-muted small mt-2 mb-0">This action cannot be undone.</p>
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={handleCancelDelete}>
                              Cancel
                         </Button>
                         <Button variant="danger" onClick={handleConfirmDelete}>
                              Delete
                         </Button>
                    </Modal.Footer>
               </Modal>
          </div>
     );
};

export default SmsTemplatesPage;