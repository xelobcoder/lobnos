import React, { useState } from 'react';

const CustomDropdown = ({ columns, visibleColumns, toggleColumnVisibility }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleDropdownToggle = () => {
        setIsOpen(prev => !prev);
    };

    const handleCheckboxChange = (columnId) => {
        toggleColumnVisibility(columnId);
    };

    const dropdownStyles = {
        position: 'relative',
        display: 'inline-block',
    };

    const buttonStyles = {
        backgroundColor: 'lightgrey',
        border: '1px solid #ddd',
        padding: '10px',
        cursor: 'pointer',
        borderRadius: '4px',
        userSelect: 'none',
    };

    const menuStyles = {
        position: 'absolute',
        top: '100%',
        left: '0',
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
        width: '200px',
        zIndex: '1000',
        maxHeight: '300px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
    };

    const itemStyles = {
        padding: '10px',
        cursor: 'pointer',
        borderBottom: '1px solid #ddd',
    };

    const itemHoverStyles = {
        backgroundColor: '#f1f1f1',
    };

    return (
        <div style={dropdownStyles}>
            <button style={buttonStyles} onClick={handleDropdownToggle}>
                <span>Toggle Columns</span>
            </button>
            {isOpen && (
                <div style={menuStyles}>
                    {columns.map((column) => (
                        <div
                            key={column.id}
                            style={itemStyles}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = itemHoverStyles.backgroundColor)}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                        >
                            <label>
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.includes(column.id)}
                                    onChange={() => handleCheckboxChange(column.id)}
                                />
                                <span style={{ marginLeft: '10px' }}>{column.Header}</span>
                            </label>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
