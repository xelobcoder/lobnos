import React from 'react'
import { RiSearchLine, RiCloseLine } from '@remixicon/react';
import styles from './PrimeTable.module.css';

export default function GlobalFilter({ filter, setFilter }) {
     return (
          <div className={styles.searchField}>
               <RiSearchLine size={17} aria-hidden="true" />
               <input type='search'
                    placeholder='Search records…'
                    aria-label='Search table'
                    value={filter || ''} onChange={e => setFilter(e.target.value)} />
               {filter && <button type="button" aria-label="Clear table search" onClick={() => setFilter('')}><RiCloseLine size={16} aria-hidden="true" /></button>}
          </div>
     )
}
