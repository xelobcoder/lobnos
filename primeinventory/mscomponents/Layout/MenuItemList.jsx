import { ArrowForwardIos } from '@mui/icons-material';
import React, { useState } from 'react';

export default function MenuItemList({ title, children = [], icon, links, expand }) {
  const [menuItem, setMenuItemOpen] = useState(false);
  const toggleLabMenu = () => setMenuItemOpen(!menuItem);

  return (
    <li className="nav-item p-0 reduce-pl">
      <div className="p-3 mx-1 grid-30-30-30 text-white" onClick={() => { toggleLabMenu() }}>
        <span className="oi oi-align-center" id='sidebar-main-icons' aria-hidden="true">{icon}</span>
        {expand && <div className="add-3dots reduce-pr   text-uppercase">{title}</div>}
        {expand && <span aria-hidden="true"> {children.length > 0 && <ArrowForwardIos />}</span>}
      </div>
      {menuItem && children && children.length > 0 && expand && (
        <div className="sub-menu">
          {children.map((item, index) => {
            return <div key={index} className="nav-item p-2 left-bordercolor1">
              <a className="nav-link add-bcandal" href={item.link}>
                <span className="oi oi-british-pound" aria-hidden="true"></span>
                <div className="add-3dots reduce-pr">{item.title}</div>
              </a>
            </div>
          })}
        </div>
      )}
    </li>
  );
};

