
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
    // Add state and filter logic at the top of the component
    const [filterText, setFilterText] = React.useState('');
    const filteredPlaceholders = React.useMemo(() => {
        if (!placeholders) return [];
        if (!filterText) return placeholders;
        return placeholders.filter((ph: string) => ph.toLowerCase().includes(filterText.toLowerCase()));
    }, [placeholders, filterText]);
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
                                <div className="mb-2">
                                    <Form.Control
                                        type="text"
                                        placeholder="Search placeholders..."
                                        size="sm"
                                        className="mb-2"
                                        onChange={e => setFilterText(e.target.value)}
                                        value={filterText}
                                        disabled={placeholdersLoading || !placeholders || placeholders.length === 0}
                                        style={{ maxWidth: 300 }}
                                    />
                                </div>
                                <div className="border rounded p-2 bg-light" >
                                    {placeholdersLoading ? (
                                        <div className="text-center text-muted">
                                            <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                                            Loading placeholders...
                                        </div>
                                    ) : (
                                        filteredPlaceholders.length > 0 ? (
                                            <div className="d-flex flex-wrap gap-1">
                                                {filteredPlaceholders.map((ph: string) => (
                                                    <Badge
                                                        key={ph}
                                                        bg="primary"
                                                        className="cursor-pointer user-select-none placeholder-pill"
                                                        style={{ cursor: 'pointer', fontSize: '0.95em', padding: '0.45em 0.8em', borderRadius: '1em', transition: 'background 0.2s' }}
                                                        onClick={() => handlePlaceholderClick(ph)}
                                                        title={`Click to add ${ph} to your message`}
                                                    >
                                                        {ph}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center text-muted py-2" style={{ fontStyle: 'italic' }}>
                                                <span>No placeholders found</span>
                                            </div>
                                        )
                                    )}
                                </div>
                                <small className="text-muted">
                                    {!placeholdersLoading && 'Click any placeholder above to add it to your message body'}
                                </small>
                                <style jsx>{`
                                    .placeholder-pill:hover {
                                        background: #0d6efdcc !important;
                                    }
                                `}</style>
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
