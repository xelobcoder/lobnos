import React from 'react';
import Link from 'next/link';
import styles from '../styles/header.module.css';

interface ExpandedMenuProps {
    item: { title: string, link: string }[];
    index: number;
}

const ExpandedMenu: React.FC<ExpandedMenuProps> = ({ item, index }) => (
    <>
        {item.map((_dropdown, idx) => (
            <Link
                key={idx}
                href={`${_dropdown.link}?expandedTarget=${index}`}
                className={styles['expanded-menu-link']}
            >
                📦 {_dropdown.title}
            </Link>
        ))}
    </>
);

export default ExpandedMenu;
