import React, { useState } from 'react';

const LabNav = () => {
  const [isLabMenuOpen, setLabMenuOpen] = useState(false);
  const [isBiomedicalMenuOpen, setBiomedicalMenuOpen] = useState(false);

  const toggleLabMenu = () => setLabMenuOpen(!isLabMenuOpen);
  const toggleBiomedicalMenu = () => setBiomedicalMenuOpen(!isBiomedicalMenuOpen);

  return (
    <ul className="nav">
      <li className="nav-item p-0 reduce-pl">
        <div className="nav-link reduce-pading-tb" onClick={toggleLabMenu}>
          <span className="oi oi-align-center" aria-hidden="true"></span>
          <div className="add-3dots reduce-pr">Lab</div>
          <span className={isLabMenuOpen ? 'up-icon' : 'down-icon'} aria-hidden="true"></span>
        </div>
        {isLabMenuOpen && (
          <div className="sub-menu">
            <div className="nav-item p-2 left-bordercolor1">
              <a className="nav-link add-bcandal" href="/LabReport">
                <span className="oi oi-british-pound" aria-hidden="true"></span>
                <div className="add-3dots reduce-pr">Lab Report</div>
              </a>
              <a className="nav-link add-bcandal" href="/LabParameterSettings">
                <span className="oi oi-flash" aria-hidden="true"></span>
                <div className="add-3dots reduce-pr">Parameter Settings</div>
              </a>
              <a className="nav-link add-bcandal" href="/LabTypes">
                <span className="oi oi-cloudy" aria-hidden="true"></span>
                <div className="add-3dots reduce-pr">Lab Types</div>
              </a>
            </div>
          </div>
        )}
      </li>

      <li className="nav-item p-0 reduce-pl">
        <div className="nav-link reduce-pading-tb" onClick={toggleBiomedicalMenu}>
          <span className="oi oi-align-center" aria-hidden="true"></span>
          <div className="add-3dots reduce-pr">Biomedical Imaging(Scan)</div>
          <span className={isBiomedicalMenuOpen ? 'up-icon' : 'down-icon'} aria-hidden="true"></span>
        </div>
        {isBiomedicalMenuOpen && (
          <div className="sub-menu">
            <div className="nav-item p-2 left-bordercolor1">
              <a className="nav-link add-bcandal" href="/NewScanWithoutImage">
                <span className="oi oi-caret-right" aria-hidden="true"></span>New Scan(Record only)
              </a>
              <a className="nav-link add-bcandal" href="/NewScanWithImage">
                <span className="oi oi-cloud" aria-hidden="true"></span>New Scan(with Image)
              </a>
              <a className="nav-link add-bcandal" href="/ScanTypes">
                <span className="oi oi-cloudy" aria-hidden="true"></span>Scan Types
              </a>
              <a className="nav-link add-bcandal" href="/PendingScanList">
                <span className="oi oi-box" aria-hidden="true"></span>
                <div className="add-3dots reduce-pr">Pending Scan List</div>
              </a>
              <a className="nav-link add-bcandal" href="/CompletedScanList">
                <span className="oi oi-contrast" aria-hidden="true"></span>
                <div className="add-3dots reduce-pr">Completed Scan List</div>
              </a>
              <a className="nav-link add-bcandal" href="/EditCompletedScan">
                <span className="oi oi-contrast" aria-hidden="true"></span>
                <div className="add-3dots reduce-pr">Edit Completed Scan</div>
              </a>
              <a className="nav-link add-bcandal" href="/ScanReport">
                <span className="oi oi-british-pound" aria-hidden="true"></span>Scan Report
              </a>
              <a className="nav-link add-bcandal" href="/ScanParameterSettings">
                <span className="oi oi-flash" aria-hidden="true"></span>
                <div className="add-3dots reduce-pr">Parameter Settings</div>
              </a>
            </div>
          </div>
        )}
      </li>
    </ul>
  );
};

export default LabNav;
