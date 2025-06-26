import { useEffect, useState } from 'react';

export default function ExcelFilteringLike({ openFilter, uniqueValues, filterRef, triggerRef, onApplyFilters, target }) {
     const [position, setPosition] = useState({ top: 0, left: 0 });
     const [filteredValues, setFilteredValues] = useState([]);
     const [searchTerm, setSearchTerm] = useState('');

     useEffect(() => {
          if (triggerRef.current) {
               const rect = triggerRef.current.getBoundingClientRect();
               setPosition({
                    top: rect.bottom + window.scrollY - 100,
                    left: rect.left + rect.width / 2,
               });
          }
     }, [triggerRef]);

     const handleAddFilterValues = (ev, value) => {
          const { checked } = ev.target;

          setFilteredValues((prev) => {
               if (checked) {
                    return [...prev, value];
               } else {
                    return prev.filter((item) => item !== value);
               }
          });
     };

     const handleSearchChange = (ev) => {
          setSearchTerm(ev.target.value);
     };

     const handleApplyFilters = () => {
          onApplyFilters(filteredValues);
     };

     const handleCancelFilters = () => {
          setFilteredValues([]);
          onApplyFilters([]);
     };

     if (!openFilter) return null;

     return (
          <div
               ref={filterRef}
               className="position-absolute bg-white shadow-lg p-2"
               style={{
                    top: `${position.top}px`,
                    left: `${position.left}px`,
                    transform: 'translateX(-50%)',
                    zIndex: '1000',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    minWidth: '150px',
                    maxWidth: 'max-content'
               }}
          >
               <input
                    className='custom-input'
                    placeholder={`search ${target}`}
                    value={searchTerm}
                    onChange={handleSearchChange}
               />
               {uniqueValues
                    .filter(_single => _single != undefined)
                    .filter(value => {
                         if (typeof value === 'string' || value instanceof String) {
                              return value.toLowerCase().includes(searchTerm.toLowerCase());
                         }
                         return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
                    })
                    .map((value) => (
                         <div key={value}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '15px', margin: '5px' }}>
                                   <input
                                        type="checkbox"
                                        className="form-check"
                                        checked={filteredValues.includes(value)}
                                        onChange={(ev) => handleAddFilterValues(ev, value)}
                                        style={{ marginRight: '8px' }}
                                   />
                                   {value}
                              </span>
                         </div>
                    ))}
               <div className='d-flex justify-content-between mt-2'>
                    <button className='btn btn-light btn-sm' onClick={handleApplyFilters}>Okay</button>
                    <button className='btn btn-light btn-sm' onClick={handleCancelFilters}>Cancel</button>
               </div>
          </div>
     );
}
