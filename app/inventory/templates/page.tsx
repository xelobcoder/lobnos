'use client';

import React, { useState, useEffect } from 'react';
import { RiTestTubeLine, RiAddLine, RiEditLine, RiDeleteBinLine, RiEyeLine, RiSearchLine, RiFilterLine } from '@remixicon/react';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
import { toast } from 'react-toastify';
import { useApplicationSettings } from '../../../components/Auth/useApplicationContext';
import { string } from 'zod';

interface TestTemplate {
     id: string;
     name: string;
     description: string;
     items: TestTemplateItem[];
     createdDate: string;
     lastModified: string;
     testId: string;
     items_count: number;
}

interface TestTemplateItem {
     itemId: string;
     itemName: string;
     quantity: number;
     unit: string;
     item_sku?: string;
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
     const [tests, setTests] = useState<any[]>([]);
     const [showAddModal, setShowAddModal] = useState(false);
     const [selectedTemplate, setSelectedTemplate] = useState<TestTemplate | null>(null);
     const [searchTerm, setSearchTerm] = useState('');
     const [filterCategory, setFilterCategory] = useState('');
     const { branchid, user } = useApplicationSettings().applicationsettings || {};
     const employeeid = user?.employeeid;
     const [modalLoadingData, setModalLoadingData] = useState(false);
     const [isMobile, setIsMobile] = useState(false);

     // Form states
     const [templateForm, setTemplateForm] = useState({
          name: '',
          description: '',
          items: [] as TestTemplateItem[],
          testId: ''
     });

     // Load tests from bulk endpoint
     const loadTests = async () => {
          try {
               const response = await customFetch(`testpanel/list/bulk?branchid=${branchid}&employeeid=${employeeid}`);
               const data = Array.isArray(response) ? response : (response?.data || response?.result || []);
               setTests(data);
          } catch (error) {
               console.error('Error loading tests:', error);
          }
     };

     // Load data from API
     useEffect(() => {
          if (branchid && employeeid) {
               loadInventoryItems();
               loadTemplates();
               loadTests();
          }
     }, [branchid, employeeid]);

     // Mobile detection
     useEffect(() => {
          const checkMobile = () => {
               setIsMobile(window.innerWidth < 768);
          };
          checkMobile();
          window.addEventListener('resize', checkMobile);
          return () => window.removeEventListener('resize', checkMobile);
     }, []);


     const handleSeverSideProcessing = async (params: any) => {
          const { page, count } = params;
          const url = `inventory/templates?page=${page}&count=${count}&branchid=${branchid}&employeeid=${employeeid}`;
          try {
               const response = await customFetch(url);
               if (Array.isArray(response.data) && response.data.length > 0) {
                    return { result: response.data, error: false }
               } else {
                    return { result: [], error: false }
               }
          } catch (error) {
               console.error('Error in server side processing:', error);
               return { result: [], error: true }
          }
     }

     const loadInventoryItems = async () => {
          try {
               const response = await customFetch(`inventory/items?branchid=${branchid}&employeeid=${employeeid}&page=1&count=1000`);
               const data = Array.isArray(response) ? response : (response?.data || response?.result || []);
               const mappedItems = (data || []).map((item: any) => ({
                    id: item.id?.toString() || String(item.id),
                    name: item.name,
                    sku: item.sku,
                    unit: item.unit,
                    unitPrice: item.unit_price || item.unitPrice || 0
               }));
               setInventoryItems(mappedItems);
          } catch (error) {
               console.error('Error loading inventory items:', error);
          }
     };

     const loadTemplates = async () => {
          try {
               const response = await customFetch(`inventory/templates?branchid=${branchid}&employeeid=${employeeid}`);
               const data = Array.isArray(response) ? response : (response?.data || response?.result || []);
               const mappedTemplates = (data || []).map((template: any) => ({
                    id: template.id?.toString() || String(template.id),
                    name: template.name,
                    description: template.description || '',  // Ensure it's never null
                    testId: template.testId,
                    items: template.items || [],
                    createdDate: template.created_at,
                    items_count: template.items_count,
                    lastModified: template.updated_at
               }));
               setTestTemplates(mappedTemplates);
          } catch (error) {
               console.error('Error loading templates:', error);
          }
     };

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
               accessor: 'items_count',
               Cell: ({ value }) => (
                    <span>{value} items</span>
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

     const handleAddTemplate = async () => {
          if (!templateForm.name || !templateForm.testId) {
               return alert('Please select a test');
          }
          try {
               const templateData = {
                    name: templateForm.name,
                    description: templateForm.description,
                    items: templateForm.items.map(item => ({
                         itemId: item.itemId,
                         quantity: item.quantity
                    })),
                    employeeid,
                    branchid,
                    testId: templateForm.testId
               };

               const resp = await customPost('inventory/templates', 'POST', templateData);
               if (resp && (resp.success === true || resp.status === 'success' || resp.statusCode === 200)) {
                    toast.success(resp.message || 'Template created');
                    await loadTemplates();
                    setShowAddModal(false);
                    resetTemplateForm();
               } else {
                    const errMsg = resp?.error?.message || resp?.message || 'Failed to create template';
                    toast.error(errMsg);
               }
          } catch (error) {
               console.error('Error creating template:', error);
               alert('Error creating template');
          }
     };

     const handleEditTemplate = async (template: TestTemplate) => {
          try {
               // Fetch template items
               setSelectedTemplate(template);
               setShowAddModal(true);
               const templateTestId = String(template.testId);
               const matchingTest = tests.find(test => String(test.id) == templateTestId);
               const itemsResponse = await customFetch(`inventory/templates/${template.id}/items?branchid=${branchid}&employeeid=${employeeid}`);
               const itemsData = Array.isArray(itemsResponse) ? itemsResponse : (itemsResponse?.data || []);

               const mappedItems = (itemsData || []).map((item: any) => ({
                    itemId: item.item_id || item.itemId,
                    itemName: item.item_name || item.itemName,
                    quantity: item.quantity,
                    unit: item.unit,
                    item_sku: item.item_sku
               }));

               setTemplateForm({
                    name: matchingTest ? matchingTest.name : template.name,
                    description: template.description || '',
                    items: mappedItems,
                    testId: templateTestId
               });


          } catch (error) {
               console.error('Error loading template items:', error);
               toast.error('Failed to load template items');
          }
     };

     const handleUpdateTemplate = async () => {
          if (!selectedTemplate || !templateForm.name || !templateForm.testId) {
               alert('Please select a test');
               return;
          }
          try {
               const templateData = {
                    name: templateForm.name,
                    description: templateForm.description,
                    items: templateForm.items.map(item => ({
                         itemId: item.itemId,
                         quantity: item.quantity
                    })),
                    testId: templateForm.testId,
                    employeeid,
                    branchid
               };

               const resp = await customPost(`inventory/templates/${selectedTemplate.id}`, 'PUT', templateData);
               if (resp && (resp.success === true || resp.status === 'success' || resp.statusCode === 200)) {
                    toast.success(resp.message || 'Template updated');
                    await loadTemplates();
                    setShowAddModal(false);
                    setSelectedTemplate(null);
                    resetTemplateForm();
               } else {
                    const errMsg = resp?.error?.message || resp?.message || 'Failed to update template';
                    toast.error(errMsg);
               }
          } catch (error) {
               console.error('Error updating template:', error);
               alert('Error updating template');
          }
     };

     const handleDeleteTemplate = async (templateId: string) => {
          if (!confirm('Are you sure you want to delete this template?')) return;

          try {
               const resp = await customPost(`inventory/templates/${templateId}`, 'DELETE', { branchid, employeeid });
               if (resp && (resp.success === true || resp.status === 'success' || resp.statusCode === 200)) {
                    toast.success(resp.message || 'Template deleted');
                    await loadTemplates();
               } else {
                    const errMsg = resp?.error?.message || resp?.message || 'Failed to delete template';
                    toast.error(errMsg);
               }
          } catch (error) {
               console.error('Error deleting template:', error);
               alert('Error deleting template');
          }
     };

     const resetTemplateForm = () => {
          setTemplateForm({
               name: '',
               description: '',
               items: [],
               testId: ''
          });
     };

     const applyTemplate = (template: TestTemplate) => {
          // This would typically navigate to a transaction page or open a modal
          alert(`Applying template: ${template.name}\nThis would open the transaction recording page with pre-filled items.`);
     };

     return (
          <div className="container-fluid p-2 p-md-4" style={{ backgroundColor: isMobile ? '#f2f2f7' : 'transparent', minHeight: isMobile ? '100vh' : 'auto' }}>

               {/* Search and Filter */}
               <div className="row g-2 mb-3">
                    <div className="col-12 col-md-8">
                         <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="🔍 Search templates..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              style={isMobile ? {
                                   borderRadius: '8px',
                                   border: 'none',
                                   backgroundColor: '#ffffff',
                                   padding: '8px 12px',
                                   fontSize: '14px',
                                   boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                              } : {}}
                         />
                    </div>
                    <div className="col-12 col-md-4 d-flex justify-content-end">
                         <button
                              className="btn btn-outline-primary btn-sm w-100 w-md-auto"
                              onClick={() => setShowAddModal(true)}
                              style={isMobile ? {
                                   borderRadius: '8px',
                                   border: 'none',
                                   padding: '8px 14px',
                                   fontSize: '14px',
                                   fontWeight: '600',
                                   backgroundColor: '#007AFF',
                                   boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)'
                              } : {}}
                         >
                              <RiAddLine size={16} className="me-1" />
                              Create Template
                         </button>
                    </div>
               </div>

               {/* Templates Display */}
               {isMobile ? (
                    <div className="d-flex flex-column" style={{ gap: '12px' }}>
                         {filteredTemplates.map(template => (
                              <div
                                   key={template.id}
                                   style={{
                                        backgroundColor: '#ffffff',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                        border: '0.5px solid rgba(0,0,0,0.04)'
                                   }}
                              >
                                   <div style={{ padding: '12px' }}>
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                             <h6 className="mb-0" style={{
                                                  fontSize: '15px',
                                                  fontWeight: '600',
                                                  color: '#000000',
                                                  letterSpacing: '-0.3px'
                                             }}>
                                                  {template.name}
                                             </h6>
                                             <span style={{
                                                  backgroundColor: '#007AFF',
                                                  color: '#ffffff',
                                                  padding: '2px 8px',
                                                  borderRadius: '10px',
                                                  fontSize: '12px',
                                                  fontWeight: '600',
                                                  marginLeft: '8px',
                                                  whiteSpace: 'nowrap'
                                             }}>
                                                  {template.items_count}
                                             </span>
                                        </div>
                                        {template.description && (
                                             <p className="mb-0" style={{
                                                  fontSize: '13px',
                                                  color: '#8e8e93',
                                                  lineHeight: '1.3',
                                                  marginTop: '4px',
                                                  marginBottom: '8px'
                                             }}>
                                                  {template.description}
                                             </p>
                                        )}
                                        <div className="d-flex" style={{ gap: '12px', marginTop: '8px', marginBottom: '10px' }}>
                                             <div style={{ fontSize: '11px', color: '#8e8e93' }}>
                                                  <div style={{ color: '#000000', fontWeight: '500', marginBottom: '1px' }}>Created</div>
                                                  {new Date(template.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                             </div>
                                             <div style={{ fontSize: '11px', color: '#8e8e93' }}>
                                                  <div style={{ color: '#000000', fontWeight: '500', marginBottom: '1px' }}>Modified</div>
                                                  {new Date(template.lastModified).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                             </div>
                                        </div>
                                        <div className="d-flex" style={{ gap: '6px', marginTop: '10px' }}>
                                             <button
                                                  onClick={() => handleEditTemplate(template)}
                                                  style={{
                                                       flex: 1,
                                                       backgroundColor: '#007AFF',
                                                       color: '#ffffff',
                                                       border: 'none',
                                                       borderRadius: '8px',
                                                       padding: '8px',
                                                       fontSize: '13px',
                                                       fontWeight: '600',
                                                       display: 'flex',
                                                       alignItems: 'center',
                                                       justifyContent: 'center',
                                                       gap: '4px',
                                                       cursor: 'pointer',
                                                       transition: 'opacity 0.2s'
                                                  }}
                                                  onMouseDown={(e) => e.currentTarget.style.opacity = '0.7'}
                                                  onMouseUp={(e) => e.currentTarget.style.opacity = '1'}
                                                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                             >
                                                  <RiEditLine size={14} />
                                                  Edit
                                             </button>
                                             <button
                                                  onClick={() => handleDeleteTemplate(template.id)}
                                                  style={{
                                                       backgroundColor: '#FF3B30',
                                                       color: '#ffffff',
                                                       border: 'none',
                                                       borderRadius: '8px',
                                                       padding: '8px 12px',
                                                       fontSize: '13px',
                                                       fontWeight: '600',
                                                       display: 'flex',
                                                       alignItems: 'center',
                                                       justifyContent: 'center',
                                                       cursor: 'pointer',
                                                       transition: 'opacity 0.2s'
                                                  }}
                                                  onMouseDown={(e) => e.currentTarget.style.opacity = '0.7'}
                                                  onMouseUp={(e) => e.currentTarget.style.opacity = '1'}
                                                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                             >
                                                  <RiDeleteBinLine size={14} />
                                             </button>
                                        </div>
                                   </div>
                              </div>
                         ))}
                    </div>
               ) : (
                    <PrimeTable
                         pdfExport
                         pdfTitle="Test Templates"
                         column={templateColumns}
                         data={filteredTemplates}
                         filtering={true}
                         handleSeverSideProcessing={handleSeverSideProcessing}
                         serverSideFiltering={true}
                    />
               )}

               {/* Create/Edit Template Modal */}
               {showAddModal && (
                    <div className="modal show d-block" style={{ backgroundColor: isMobile ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-lg modal-dialog-scrollable" style={{
                              margin: isMobile ? '1rem 0.5rem' : '1.75rem auto',
                              maxWidth: isMobile ? 'calc(100% - 1rem)' : '',
                              borderRadius: isMobile ? '16px' : ''
                         }}>
                              <div className="modal-content" style={isMobile ? {
                                   borderRadius: '16px',
                                   border: 'none',
                                   overflow: 'hidden'
                              } : {}}>
                                   <div className="modal-header" style={isMobile ? {
                                        backgroundColor: '#f9f9f9',
                                        borderBottom: '0.5px solid #e5e5ea',
                                        padding: '12px 16px'
                                   } : {}}>
                                        <h5 className="modal-title" style={isMobile ? {
                                             fontSize: '16px',
                                             fontWeight: '600',
                                             color: '#000000',
                                             letterSpacing: '-0.3px'
                                        } : {}}>
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
                                             style={isMobile ? {
                                                  fontSize: '14px',
                                                  opacity: 1
                                             } : {}}
                                        ></button>
                                   </div>
                                   <div className="modal-body" style={isMobile ? {
                                        padding: '16px',
                                        backgroundColor: '#ffffff'
                                   } : {}}>
                                        {modalLoadingData ? (
                                             <div style={{ textAlign: 'center', padding: '30px', color: '#8e8e93', fontSize: '13px' }}>Loading...</div>
                                        ) : (<div>

                                             <div className="mb-3">
                                                  <label className="form-label" style={isMobile ? {
                                                       fontSize: '12px',
                                                       fontWeight: '500',
                                                       color: '#000000',
                                                       marginBottom: '6px'
                                                  } : {}}>Test *</label>
                                                  <select
                                                       className="form-select form-select-sm"
                                                       value={templateForm.testId}
                                                       disabled={!!selectedTemplate}
                                                       onChange={e => {
                                                            const selectedTest = tests.find(test => String(test.id) === e.target.value);
                                                            setTemplateForm(prev => ({
                                                                 ...prev,
                                                                 name: selectedTest ? selectedTest.name : '',
                                                                 testId: selectedTest ? String(selectedTest.id) : ''
                                                            }));
                                                       }}
                                                       style={isMobile ? {
                                                            borderRadius: '8px',
                                                            border: '1px solid #d1d1d6',
                                                            padding: '8px 12px',
                                                            fontSize: '14px',
                                                            backgroundColor: !!selectedTemplate ? '#f2f2f7' : '#ffffff'
                                                       } : {}}
                                                  >
                                                       <option value="">Select test</option>
                                                       {tests.map(test => (
                                                            <option key={test.id || test.name} value={String(test.id)}>
                                                                 {test.name}
                                                            </option>
                                                       ))}
                                                  </select>
                                             </div>
                                             <div className="mb-3">
                                                  <label className="form-label" style={isMobile ? {
                                                       fontSize: '12px',
                                                       fontWeight: '500',
                                                       color: '#000000',
                                                       marginBottom: '6px'
                                                  } : {}}>Description</label>
                                                  <textarea
                                                       className="form-control form-control-sm"
                                                       rows={2}
                                                       value={templateForm.description}
                                                       onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                                                       placeholder="Template description..."
                                                       style={isMobile ? {
                                                            borderRadius: '8px',
                                                            border: '1px solid #d1d1d6',
                                                            padding: '8px 12px',
                                                            fontSize: '14px',
                                                            resize: 'vertical'
                                                       } : {}}
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
                                                                           updatedItems[index].quantity = parseFloat(e.target.value) || 0;
                                                                           setTemplateForm(prev => ({ ...prev, items: updatedItems }));
                                                                      }}
                                                                      min="0.1"
                                                                      step="0.1"
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
                                        </div>)
                                        }
                                   </div>
                                   <div className="modal-footer" style={isMobile ? {
                                        borderTop: '0.5px solid #e5e5ea',
                                        padding: '12px 16px',
                                        gap: '8px',
                                        backgroundColor: '#f9f9f9'
                                   } : {}}>
                                        <button
                                             type="button"
                                             className="btn btn-outline-secondary btn-sm"
                                             onClick={() => {
                                                  setShowAddModal(false);
                                                  setSelectedTemplate(null);
                                                  resetTemplateForm();
                                             }}
                                             style={isMobile ? {
                                                  flex: 1,
                                                  borderRadius: '8px',
                                                  padding: '8px',
                                                  fontSize: '14px',
                                                  fontWeight: '600',
                                                  backgroundColor: '#e5e5ea',
                                                  color: '#000000',
                                                  border: 'none'
                                             } : {}}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-outline-success btn-sm"
                                             onClick={selectedTemplate ? handleUpdateTemplate : handleAddTemplate}
                                             style={isMobile ? {
                                                  flex: 1,
                                                  borderRadius: '8px',
                                                  padding: '8px',
                                                  fontSize: '14px',
                                                  fontWeight: '600',
                                                  backgroundColor: '#007AFF',
                                                  border: 'none'
                                             } : {}}
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