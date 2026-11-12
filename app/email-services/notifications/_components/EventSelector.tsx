'use client';

import { useState } from 'react';
import Select from 'react-select';
import { reactSelectCustomStyles } from '../../../../components/Auth/customFetch';
import { NotificationEvent } from '../_lib';
import styles from './EventSelector.module.css';

type Props = {
    id: string;
    events: NotificationEvent[];
    value: string;
    onChange: (code: string) => void;
    disabled?: boolean;
    templates?: { eventCode?: string; eventId?: number }[];
};

export default function EventSelector({ id, events, value, onChange, disabled, templates }: Props) {
    const [module, setModule] = useState('');
    const modules = [...new Set(events.map(event => event.module || 'Other'))].sort();
    const options = events.map(event => ({
        value: event.event_code,
        label: event.event_name || event.event_code,
        module: event.module || 'Other',
        templateCount: templates?.filter(template => template.eventCode === event.event_code || Number(template.eventId) === Number(event.id)).length,
    }));
    const filtered = options.filter(option => !module || option.module === module);
    return <div className={styles.selector}>
        <div className={styles.fields}>
            <label htmlFor={`${id}-module`}>Module
                <select id={`${id}-module`} value={module} disabled={disabled} onChange={event => setModule(event.target.value)}>
                    <option value="">All modules</option>
                    {modules.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
            </label>
            <div className={styles.event}>
                <label htmlFor={id}>Notification event</label>
                <Select inputId={id} instanceId={id} classNamePrefix="notification-event" styles={reactSelectCustomStyles}
                    options={filtered} value={options.find(option => option.value === value) || null}
                    isDisabled={disabled} isSearchable placeholder="Search event name or code…"
                    filterOption={(option, input) => `${option.label} ${option.value} ${option.data.module}`.toLowerCase().includes(input.toLowerCase().trim())}
                    onChange={option => { if (option) onChange(option.value); }}
                    formatOptionLabel={(option, context) => context.context === 'value' ? option.label : <span className={styles.option}><strong>{option.label}</strong><small>{option.value}{option.templateCount != null ? ` · ${option.templateCount} saved templates` : ''}</small></span>}
                    noOptionsMessage={() => 'No events match. Try another search or module.'}
                />
            </div>
        </div>
        <p className={styles.count} role="status">{filtered.length} of {events.length} events available{module ? ` in ${module}` : ''}</p>
    </div>;
}
