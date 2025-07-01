
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';

// placeholders: array of strings for the current event, from backend
interface EditTemplateModalProps {
    showEditModal: boolean;
    handleCancelEdit: () => void;
    handleSaveTemplate: () => void;
    editingEvent: any;
    selectedPlaceholder: string;
    handlePlaceholderSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    placeholdersLoading: boolean;
    usedPlaceholders: string[];
    handlePlaceholderClick: (ph: string) => void;
    handleRemovePlaceholder: (ph: string) => void;
    handleContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholders: string[]; // backend-provided for this event
}

export default function EditTemplateModal({
    showEditModal,
    handleCancelEdit,
    handleSaveTemplate,
    editingEvent,
    selectedPlaceholder,
    handlePlaceholderSelect,
    placeholdersLoading,
    usedPlaceholders,
    handlePlaceholderClick,
    handleRemovePlaceholder,
    handleContentChange,
    placeholders
}: EditTemplateModalProps) {
    return (
        <Modal show={showEditModal} onHide={handleCancelEdit} size="xl" backdrop="static" centered>
            <Modal.Header closeButton>
                <Modal.Title>Edit SMS Template</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {editingEvent && (
                    <div className="row">
                        <div className="col-md-6 border-end">
                            <div className="mb-3">
                                <label className="form-label fw-bold">Event:</label>
                                <div className="d-flex align-items-center gap-2">
                                    <code className="text-primary">{editingEvent.code}</code>
                                    <span className="text-muted">- {editingEvent.description}</span>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="templateContent" className="form-label fw-bold">
                                    SMS Template Content:
                                </label>
                                <textarea
                                    id="templateContent"
                                    className="form-control"
                                    rows={8}
                                    value={editingEvent.content}
                                    onChange={handleContentChange}
                                    placeholder="Enter your SMS template content here..."
                                />
                                <div className="form-text">
                                    You can use placeholders like <code>{'{{firstname}}'}</code>, <code>{'{{companyname}}'}</code>, etc.
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <Form.Group className="mb-3">
                                <Form.Label>Insert Placeholder (Dropdown)</Form.Label>
                                <Form.Select
                                    value={selectedPlaceholder}
                                    onChange={handlePlaceholderSelect}
                                    disabled={placeholdersLoading || !placeholders || placeholders.length === 0}
                                >
                                    <option value="">
                                        {placeholdersLoading ? 'Loading placeholders...' : 'Select placeholder to insert'}
                                    </option>
                                    {placeholders && placeholders.map((ph: string) => (
                                        <option key={ph} value={ph}>{ph}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Available Placeholders (Click to Add)</Form.Label>
                                <div className="border rounded p-2 bg-light" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                                    {placeholdersLoading ? (
                                        <div className="text-center text-muted">
                                            <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                                            Loading placeholders...
                                        </div>
                                    ) : (
                                        placeholders && placeholders.length > 0 ? (
                                            <div className="d-flex flex-wrap gap-1">
                                                {placeholders.map((ph: string) => (
                                                    <Badge
                                                        key={ph}
                                                        bg="primary"
                                                        className="cursor-pointer user-select-none"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => handlePlaceholderClick(ph)}
                                                        title={`Click to add ${ph} to your message`}
                                                    >
                                                        {ph}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-muted">No placeholders available for this event</span>
                                        )
                                    )}
                                </div>
                                <small className="text-muted">
                                    {!placeholdersLoading && 'Click any placeholder above to add it to your message body'}
                                </small>
                            </Form.Group>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Preview:</label>
                                <div className="border rounded p-3 bg-light">
                                    <small className="text-muted">SMS Preview:</small>
                                    <div className="mt-1">{editingEvent.content || 'No content entered'}</div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <Form.Label>Used Placeholders (Click to Remove)</Form.Label>
                                <div>
                                    {usedPlaceholders.length > 0 ? (
                                        usedPlaceholders.map((ph: string) => (
                                            <Badge 
                                                bg="info" 
                                                key={ph} 
                                                className="me-1 mb-1 cursor-pointer user-select-none"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleRemovePlaceholder(ph)}
                                                title={`Click to remove ${ph} from your message`}
                                            >
                                                {ph} ×
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-muted">No placeholders used yet</span>
                                    )}
                                </div>
                                <small className="text-muted">
                                    {usedPlaceholders.length > 0 ? 'Click any placeholder above to remove it from your message' : ''}
                                </small>
                            </div>
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCancelEdit}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveTemplate}>
                    Save Template
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
