'use client';

import React, { useState, useEffect } from 'react';
import { RiTestTubeLine, RiAddLine, RiEditLine, RiDeleteBinLine, RiEyeLine, RiSearchLine, RiFilterLine } from '@remixicon/react';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';

interface TestTemplate {
     id: string;
     name: string;
     description: string;
     items: TestTemplateItem[];
     createdDate: string;
     lastModified: string;
}

interface TestTemplateItem {
     itemId: string;
     itemName: string;
     quantity: number;
     unit: string;
}

interface InventoryItem {
     id: string;
     name: string;
     sku: string;
     unit: string;
     unitPrice: number;
}

export default function TemplatesPage() {
     const [testTemplates, setTestTemplates] = useState<TestTemplate[]>([]);
     const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
     const [showAddModal, setShowAddModal] = useState(false);
     const [selectedTemplate, setSelectedTemplate] = useState<TestTemplate | null>(null);
     const [searchTerm, setSearchTerm] = useState('');
     const [filterCategory, setFilterCategory] = useState('');

     // Form states
     const [templateForm, setTemplateForm] = useState({
          name: '',
          description: '',
          items: [] as TestTemplateItem[]
     });

     // Mock data for demonstration
     useEffect(() => {
          const mockItems: InventoryItem[] = [
               { id: '1', name: 'Blood Collection Tubes (EDTA)', sku: 'BCT-001-EDTA', unit: 'tubes', unitPrice: 45.50 },
               { id: '2', name: 'Glucose Test Strips', sku: 'GTS-050', unit: 'strips', unitPrice: 25.00 },
               { id: '3', name: 'Sodium Chloride 0.9%', sku: 'NaCl-09-500', unit: 'bottles', unitPrice: 8.75 },
               { id: '4', name: 'Microcentrifuge Tubes', sku: 'MCT-15-500', unit: 'tubes', unitPrice: 12.50 }
          ];

          const mockTemplates: TestTemplate[] = [
               {
                    id: '1',
                    name: 'Complete Blood Count (CBC)',
                    description: 'Standard CBC test template with essential blood collection and processing items',
                    items: [
                         { itemId: '1', itemName: 'Blood Collection Tubes (EDTA)', quantity: 1, unit: 'tubes' },
                         { itemId: '4', itemName: 'Microcentrifuge Tubes', quantity: 2, unit: 'tubes' }
                    ],
                    createdDate: '2025-01-15T10:00:00Z',
                    lastModified: '2025-11-01T14:30:00Z'
               },
               {
                    id: '2',
                    name: 'Glucose Tolerance Test',
                    description: 'Oral glucose tolerance test template for diabetes screening',
                    items: [
                         { itemId: '2', itemName: 'Glucose Test Strips', quantity: 5, unit: 'strips' },
                         { itemId: '3', itemName: 'Sodium Chloride 0.9%', quantity: 1, unit: 'bottles' }
                    ],
                    createdDate: '2025-02-20T09:15:00Z',
                    lastModified: '2025-10-15T16:45:00Z'
               },
               {
                    id: '3',
                    name: 'Liver Function Test (LFT)',
                    description: 'Comprehensive liver function panel template',
                    items: [
                         { itemId: '1', itemName: 'Blood Collection Tubes (EDTA)', quantity: 2, unit: 'tubes' },
                         { itemId: '4', itemName: 'Microcentrifuge Tubes', quantity: 4, unit: 'tubes' },
                         { itemId: '3', itemName: 'Sodium Chloride 0.9%', quantity: 1, unit: 'bottles' }
                    ],
                    createdDate: '2025-03-10T11:20:00Z',
                    lastModified: '2025-11-05T13:15:00Z'
               }
          ];

          setInventoryItems(mockItems);
          setTestTemplates(mockTemplates);
     }, []);

     const filteredTemplates = testTemplates.filter(template => {
          const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               template.description.toLowerCase().includes(searchTerm.toLowerCase());
          return matchesSearch;
     });

     const templateColumns = [
          {
               Header: 'Template Name',
               accessor: 'name',
          },
          {
               Header: 'Description',
               accessor: 'description',
               Cell: ({ value }) => (
                    <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                         {value}
                    </div>
               )
          },
          {
               Header: 'Items Count',
               accessor: 'items',
               Cell: ({ value }) => (
                    <span className="badge bg-info">{value.length} items</span>
               )
          },
          {
               Header: 'Created Date',
               accessor: 'createdDate',
               Cell: ({ value }) => new Date(value).toLocaleDateString()
          },
          {
               Header: 'Last Modified',
               accessor: 'lastModified',
               Cell: ({ value }) => new Date(value).toLocaleDateString()
          },
          {
               Header: 'Actions',
               accessor: 'id',
               Cell: ({ row }) => (
                    <div className="d-flex gap-1">
                         <button
                              className="btn btn-sm btn-success"
                              title="Use Template"
                              onClick={() => applyTemplate(row.original)}
                         >
                              <RiTestTubeLine size={14} />
                         </button>
                         <button
                              className="btn btn-sm btn-outline-primary"
                              title="Edit Template"
                              onClick={() => handleEditTemplate(row.original)}
                         >
                              <RiEditLine size={14} />
                         </button>
                         <button
                              className="btn btn-sm btn-outline-danger"
                              title="Delete Template"
                              onClick={() => handleDeleteTemplate(row.original.id)}
                         >
                              <RiDeleteBinLine size={14} />
                         </button>
                    </div>
               )
          }
     ];

     const handleAddTemplate = () => {
          if (!templateForm.name) {
               alert('Please enter a template name');
               return;
          }

          const newTemplate: TestTemplate = {
               id: Date.now().toString(),
               name: templateForm.name,
               description: templateForm.description,
               items: templateForm.items,
               createdDate: new Date().toISOString(),
               lastModified: new Date().toISOString()
          };

          setTestTemplates(prev => [...prev, newTemplate]);
          setShowAddModal(false);
          resetTemplateForm();
     };

     const handleEditTemplate = (template: TestTemplate) => {
          setTemplateForm({
               name: template.name,
               description: template.description,
               items: template.items
          });
          setSelectedTemplate(template);
          setShowAddModal(true);
     };

     const handleUpdateTemplate = () => {
          if (!selectedTemplate || !templateForm.name) {
               alert('Please enter a template name');
               return;
          }

          const updatedTemplate: TestTemplate = {
               ...selectedTemplate,
               name: templateForm.name,
               description: templateForm.description,
               items: templateForm.items,
               lastModified: new Date().toISOString()
          };

          setTestTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? updatedTemplate : t));
          setShowAddModal(false);
          setSelectedTemplate(null);
          resetTemplateForm();
     };

     const handleDeleteTemplate = (templateId: string) => {
          if (confirm('Are you sure you want to delete this template?')) {
               setTestTemplates(prev => prev.filter(t => t.id !== templateId));
          }
     };

     const resetTemplateForm = () => {
          setTemplateForm({
               name: '',
               description: '',
               items: []
          });
     };

     const applyTemplate = (template: TestTemplate) => {
          // This would typically navigate to a transaction page or open a modal
          alert(`Applying template: ${template.name}\nThis would open the transaction recording page with pre-filled items.`);
     };

     return (
          <div className="container-fluid p-4">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h2 className="mb-1">
                              <RiTestTubeLine className="me-2" />
                              Test Templates
                         </h2>
                         <p className="text-muted mb-0">Manage test templates for automated inventory consumption</p>
                    </div>
                    <div className="d-flex gap-2">
                         <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setShowAddModal(true)}
                         >
                              <RiAddLine className="me-1" />
                              Create Template
                         </button>
                    </div>
               </div>

               {/* Search and Filter */}
               <div className="row mb-4">
                    <div className="col-md-6">
                         <div className="input-group">
                              <span className="input-group-text">
                                   <RiSearchLine />
                              </span>
                              <input
                                   type="text"
                                   className="form-control"
                                   placeholder="Search templates..."
                                   value={searchTerm}
                                   onChange={(e) => setSearchTerm(e.target.value)}
                              />
                         </div>
                    </div>
                    <div className="col-md-6">
                         <div className="d-flex justify-content-end">
                              <span className="align-self-center me-2">Showing {filteredTemplates.length} of {testTemplates.length} templates</span>
                         </div>
                    </div>
               </div>

               {/* Templates Table */}
               <PrimeTable
                    column={templateColumns}
                    data={filteredTemplates}
                    filtering={true}
                    handleSeverSideProcessing={false}
                    serverSideFiltering={false}
               />

               {testTemplates.length === 0 && (
                    <div className="text-center py-5">
                         <RiTestTubeLine size={64} className="text-muted mb-3" />
                         <h5 className="text-muted">No templates found</h5>
                         <p className="text-muted">Create your first test template to get started</p>
                         <button
                              className="btn btn-primary"
                              onClick={() => setShowAddModal(true)}
                         >
                              <RiAddLine className="me-1" />
                              Create Template
                         </button>
                    </div>
               )}

               {/* Create/Edit Template Modal */}
               {showAddModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-lg">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">
                                             {selectedTemplate ? 'Edit Template' : 'Create Test Template'}
                                        </h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => {
                                                  setShowAddModal(false);
                                                  setSelectedTemplate(null);
                                                  resetTemplateForm();
                                             }}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="mb-3">
                                             <label className="form-label">Template Name *</label>
                                             <input
                                                  type="text"
                                                  className="form-control"
                                                  value={templateForm.name}
                                                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                                                  placeholder="e.g., Complete Blood Count (CBC)"
                                             />
                                        </div>
                                        <div className="mb-3">
                                             <label className="form-label">Description</label>
                                             <textarea
                                                  className="form-control"
                                                  rows={3}
                                                  value={templateForm.description}
                                                  onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                                                  placeholder="Template description..."
                                             />
                                        </div>
                                        <div className="mb-3">
                                             <label className="form-label">Items Required</label>
                                             <div className="border rounded p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                  {templateForm.items.map((item, index) => (
                                                       <div key={index} className="d-flex gap-2 mb-2 align-items-center">
                                                            <select
                                                                 className="form-select form-select-sm"
                                                                 value={item.itemId}
                                                                 onChange={(e) => {
                                                                      const selectedItem = inventoryItems.find(i => i.id === e.target.value);
                                                                      if (selectedItem) {
                                                                           const updatedItems = [...templateForm.items];
                                                                           updatedItems[index] = {
                                                                                ...updatedItems[index],
                                                                                itemId: selectedItem.id,
                                                                                itemName: selectedItem.name,
                                                                                unit: selectedItem.unit
                                                                           };
                                                                           setTemplateForm(prev => ({ ...prev, items: updatedItems }));
                                                                      }
                                                                 }}
                                                            >
                                                                 <option value="">Select item</option>
                                                                 {inventoryItems.map(invItem => (
                                                                      <option key={invItem.id} value={invItem.id}>
                                                                           {invItem.name} ({invItem.sku})
                                                                      </option>
                                                                 ))}
                                                            </select>
                                                            <input
                                                                 type="number"
                                                                 className="form-control form-control-sm"
                                                                 style={{ width: '100px' }}
                                                                 placeholder="Qty"
                                                                 value={item.quantity}
                                                                 onChange={(e) => {
                                                                      const updatedItems = [...templateForm.items];
                                                                      updatedItems[index].quantity = parseInt(e.target.value) || 0;
                                                                      setTemplateForm(prev => ({ ...prev, items: updatedItems }));
                                                                 }}
                                                                 min="1"
                                                            />
                                                            <span className="text-muted">{item.unit}</span>
                                                            <button
                                                                 className="btn btn-sm btn-outline-danger"
                                                                 onClick={() => {
                                                                      const updatedItems = templateForm.items.filter((_, i) => i !== index);
                                                                      setTemplateForm(prev => ({ ...prev, items: updatedItems }));
                                                                 }}
                                                            >
                                                                 <RiDeleteBinLine size={14} />
                                                            </button>
                                                       </div>
                                                  ))}
                                                  <button
                                                       className="btn btn-sm btn-outline-primary"
                                                       onClick={() => {
                                                            setTemplateForm(prev => ({
                                                                 ...prev,
                                                                 items: [...prev.items, { itemId: '', itemName: '', quantity: 1, unit: 'pieces' }]
                                                            }));
                                                       }}
                                                  >
                                                       <RiAddLine size={14} className="me-1" />
                                                       Add Item
                                                  </button>
                                             </div>
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => {
                                                  setShowAddModal(false);
                                                  setSelectedTemplate(null);
                                                  resetTemplateForm();
                                             }}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-success btn-sm"
                                             onClick={selectedTemplate ? handleUpdateTemplate : handleAddTemplate}
                                        >
                                             {selectedTemplate ? 'Update Template' : 'Create Template'}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}