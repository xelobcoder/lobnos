'use client';

import { useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { RiArrowDownLine, RiArrowUpLine, RiDraggable, RiListOrdered2 } from '@remixicon/react';
import { applyTestParameterOrder, moveTestParameter, orderedTestParameters } from '../../../lib/testParameterOrder';
import type { OrderedTestParameter } from '../../../lib/testParameterOrder';
import ui from '../../Billing/billing-strategy/StrategyWorkspace.module.css';
import styles from './ParameterOrderModal.module.css';

interface ParameterOrderModalProps<T> {
    fields: readonly T[];
    onApply: (fields: T[]) => void;
    onHide: () => void;
}

export default function ParameterOrderModal<T extends OrderedTestParameter>({fields, onApply, onHide}: ParameterOrderModalProps<T>) {
    const [draft, setDraft] = useState(() => orderedTestParameters(fields));
    const [announcement, setAnnouncement] = useState('');
    const [editingPosition, setEditingPosition] = useState<{field: T; value: string} | null>(null);
    const [positionError, setPositionError] = useState('');
    const currentDraft = useRef(draft);
    const dragged = useRef<number | null>(null);
    const list = useRef<HTMLOListElement>(null);
    const move = (from: number, to: number, keyboard = false) => {
        const field = currentDraft.current[from];
        const next = moveTestParameter(currentDraft.current, from, to);
        currentDraft.current = next;
        setDraft(next);
        setAnnouncement(`${field.name} moved to position ${to + 1} of ${draft.length}.`);
        if (keyboard) {
            requestAnimationFrame(() => list.current?.querySelectorAll<HTMLButtonElement>('[data-order-handle]')[to]?.focus());
        }
    };
    const enterPosition = (field: T, value: string): T[] | null => {
        const position = Number(value);
        if (!value.trim() || !Number.isInteger(position) || position < 1 || position > draft.length) {
            setPositionError(`Enter a whole-number position from 1 to ${draft.length}.`);
            return null;
        }
        move(currentDraft.current.indexOf(field), position - 1);
        setEditingPosition(null);
        setPositionError('');
        return currentDraft.current;
    };
    return (
        <Modal show onHide={onHide} size="lg" scrollable aria-labelledby="parameter-order-title" className={styles.modal} dialogClassName={styles.dialog}>
            <Modal.Header closeButton>
                <div className={styles.heading}>
                    <span className={styles.icon}><RiListOrdered2 size={20} aria-hidden="true"/></span>
                    <div><Modal.Title id="parameter-order-title">Arrange test parameters</Modal.Title><p>{draft.length} parameters / Draft order</p></div>
                </div>
            </Modal.Header>
            <Modal.Body>
                <p id="parameter-order-help" className={styles.instructions}>Type a position, then press Enter. Or drag a row to reorder.</p>
                <span className="visually-hidden">Leaving a position input also moves the parameter. Use the move buttons or Alt + Arrow Up/Down on a drag handle.</span>
                <div className="visually-hidden" role="status" aria-live="polite">{announcement}</div>
                {positionError && <p id="parameter-position-error" className={styles.error} role="alert">{positionError}</p>}
                <div className={styles.columns} aria-hidden="true"><span/><span>Order</span><span>Parameter</span><span>Move</span></div>
                <ol ref={list} className={styles.list} aria-label="Parameter order">
                    {draft.map((field, index) => (
                        <li className={styles.row} key={fields.indexOf(field)}
                            onDragOver={event => { if (dragged.current != null) event.preventDefault(); }}
                            onDrop={event => {
                                event.preventDefault();
                                if (dragged.current == null) return;
                                const from = dragged.current;
                                dragged.current = null;
                                move(from, index);
                            }}>
                            <button type="button" className={styles.handle} draggable data-order-handle
                                aria-label={`Move ${field.name}, position ${index + 1} of ${draft.length}`}
                                onDragStart={event => {
                                    dragged.current = index;
                                    event.dataTransfer.effectAllowed = 'move';
                                    event.dataTransfer.setData('text/plain', String(index));
                                }}
                                onDragEnd={() => { dragged.current = null; }}
                                onKeyDown={event => {
                                    if (!event.altKey) return;
                                    if (event.key === 'ArrowUp' && index > 0) {
                                        event.preventDefault();
                                        move(index, index - 1, true);
                                    }
                                    if (event.key === 'ArrowDown' && index < draft.length - 1) {
                                        event.preventDefault();
                                        move(index, index + 1, true);
                                    }
                                }}>
                                <RiDraggable size={20} aria-hidden="true"/>
                            </button>
                            <input type="number" className={styles.position} min={1} max={draft.length} step={1}
                                aria-label={`Position for ${field.name}`}
                                aria-invalid={editingPosition?.field === field && !!positionError}
                                aria-describedby={editingPosition?.field === field && positionError ? 'parameter-position-error parameter-order-help' : 'parameter-order-help'}
                                value={editingPosition?.field === field ? editingPosition.value : index + 1}
                                onChange={event => { setEditingPosition({field, value: event.target.value}); setPositionError(''); }}
                                onBlur={event => { if (editingPosition?.field === field) enterPosition(field, event.target.value); }}
                                onKeyDown={event => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                        enterPosition(field, event.currentTarget.value);
                                    }
                                    if (event.key === 'Escape') {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        setEditingPosition(null);
                                        setPositionError('');
                                    }
                                }}
                            />
                            <div className={styles.name}>
                                <strong>{field.name}</strong>
                                <span className={ui.help}>{field.plan || 'Parameter'}{field.units ? ` / ${field.units}` : ''}</span>
                            </div>
                            <div className={styles.actions}>
                                <button type="button" className={styles.moveButton} disabled={index === 0} aria-label={`Move ${field.name} up`} onClick={() => move(index, index - 1)}><RiArrowUpLine size={16}/></button>
                                <button type="button" className={styles.moveButton} disabled={index === draft.length - 1} aria-label={`Move ${field.name} down`} onClick={() => move(index, index + 1)}><RiArrowDownLine size={16}/></button>
                            </div>
                        </li>
                    ))}
                </ol>
            </Modal.Body>
            <Modal.Footer className={styles.footer}>
                <p className={styles.saveNote}>Draft only. Use <strong>Save All Changes</strong> after applying.</p>
                <div className={styles.footerActions}>
                <button className={styles.reset} type="button" onClick={() => {
                    const reset = orderedTestParameters(fields);
                    currentDraft.current = reset;
                    setDraft(reset);
                    setEditingPosition(null);
                    setPositionError('');
                    setAnnouncement('Order reset to the current editor draft.');
                }}>Reset order</button>
                <button className={ui.secondary} type="button" onClick={onHide}>Cancel</button>
                <button className={ui.primary} type="button" onClick={() => {
                    const next = editingPosition ? enterPosition(editingPosition.field, editingPosition.value) : currentDraft.current;
                    if (next) onApply(applyTestParameterOrder(next));
                }}>Apply order</button>
                </div>
            </Modal.Footer>
        </Modal>
    );
}
