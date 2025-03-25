"use client"
import React, { useState } from 'react';
import PatientImage from '../../../../components/petientsComponent/patientportal/PatientImage';
import PatientPersonalInformationViewOnly from '../../../../components/petientsComponent/patientportal/PatientPersonalInfromationViewOnly';
import { RiHomeLine, RiHomeFill, RiFirstAidKitLine, RiFirstAidKitFill, RiLockLine, RiLockFill, 
    RiSettingsLine, RiSettingsFill, RiMessage2Line, RiMessage2Fill, RiWalletLine, RiWalletFill } from '@remixicon/react';
import styles from './styles/tabs.module.css';
import AddressViewOnly from '../../../../components/petientsComponent/patientportal/AddressViewOnly';
import EmergencyContactViewOnly from '../../../../components/petientsComponent/patientportal/EmergencyContactViewOnly';
import CommunicationsViewOnly from '../../../../components/petientsComponent/patientportal/CommunicationsViewOnly';
import CredentialsViewOnly from '../../../../components/petientsComponent/patientportal/CredentialsViewOnly';
import TransactionsViewOnly from '../../../../components/petientsComponent/patientportal/TransactionsViewOnly';


export default function PatientInformationPage() {
    const [activeTab, setActiveTab] = useState('personal-info');
    const patientId = 1;

    return (
        <div className="container-fluid p-0">
            <div className="row g-0">
                // Add this state at the top of the component
                const [showLeftColumn, setShowLeftColumn] = useState(true);
                
                // Add toggle button in the left column header
                <div className="col-lg-4 col-xl-3 bg-light border-end shadow-sm" style={{ display: showLeftColumn ? 'block' : 'none' }}>
                    <div className="p-4 bg-white rounded-3 m-3 shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <button 
                                className={`btn btn-sm btn-light ${styles.toggleButton}`}
                                onClick={() => setShowLeftColumn(!showLeftColumn)}
                                title="Toggle sidebar"
                            >
                                <RiArrowLeftSLine size={20} />
                            </button>
                        </div>
                        <div className="text-center mb-3">
                            <PatientImage patientid={patientId}/>
                        </div>
                        <PatientPersonalInformationViewOnly patientid={patientId}/>
                    </div>
                </div>

                // Update the right column to be responsive to toggle
                <div className={`col-lg-${showLeftColumn ? '8' : '12'} col-xl-${showLeftColumn ? '9' : '12'}`}>
                    <div className="p-0">
                        {!showLeftColumn && (
                            <button 
                                className={`btn btn-sm btn-light position-absolute ${styles.toggleButtonExpanded}`}
                                onClick={() => setShowLeftColumn(true)}
                                title="Show sidebar"
                            >
                                <RiArrowRightSLine size={20} />
                            </button>
                        )}
                        <nav className={`nav ${styles.tabNav}`}>
                            <button 
                                className={`${styles.tabButton} ${activeTab === 'address' ? styles.activeTab : styles.inactiveTab}`}
                                onClick={() => setActiveTab('address')}
                            >
                                {activeTab === 'address' ? (
                                    <RiHomeFill className={styles.tabIcon} />
                                ) : (
                                    <RiHomeLine className={styles.tabIcon} />
                                )}
                                Address
                            </button>
                            
                            <button 
                                className={`${styles.tabButton} ${activeTab === 'emergency-contact' ? styles.activeTab : styles.inactiveTab}`}
                                onClick={() => setActiveTab('emergency-contact')}
                            >
                                {activeTab === 'emergency-contact' ? (
                                    <RiFirstAidKitFill className={styles.tabIcon} />
                                ) : (
                                    <RiFirstAidKitLine className={styles.tabIcon} />
                                )}
                                Emergency
                            </button>
                            
                            <button 
                                className={`${styles.tabButton} ${activeTab === 'credentials' ? styles.activeTab : styles.inactiveTab}`}
                                onClick={() => setActiveTab('credentials')}
                            >
                                {activeTab === 'credentials' ? (
                                    <RiLockFill className={styles.tabIcon} />
                                ) : (
                                    <RiLockLine className={styles.tabIcon} />
                                )}
                                Credentials
                            </button>
                            
                            <button 
                                className={`${styles.tabButton} ${activeTab === 'settings' ? styles.activeTab : styles.inactiveTab}`}
                                onClick={() => setActiveTab('settings')}
                            >
                                {activeTab === 'settings' ? (
                                    <RiSettingsFill className={styles.tabIcon} />
                                ) : (
                                    <RiSettingsLine className={styles.tabIcon} />
                                )}
                                Settings
                            </button>
                            
                            <button 
                                className={`${styles.tabButton} ${activeTab === 'communications' ? styles.activeTab : styles.inactiveTab}`}
                                onClick={() => setActiveTab('communications')}
                            >
                                {activeTab === 'communications' ? (
                                    <RiMessage2Fill className={styles.tabIcon} />
                                ) : (
                                    <RiMessage2Line className={styles.tabIcon} />
                                )}
                                Communications
                            </button>
                            
                            <button 
                                className={`${styles.tabButton} ${activeTab === 'transactions' ? styles.activeTab : styles.inactiveTab}`}
                                onClick={() => setActiveTab('transactions')}
                            >
                                {activeTab === 'transactions' ? (
                                    <RiWalletFill className={styles.tabIcon} />
                                ) : (
                                    <RiWalletLine className={styles.tabIcon} />
                                )}
                                Transactions
                            </button>
                        </nav>
                        
                        <div className={styles.tabContent}>
                            {activeTab === 'address' && (
                                <AddressViewOnly patientid={patientId} />
                            )}
                            {activeTab === 'emergency-contact' && (
                                <EmergencyContactViewOnly patientid={patientId} />
                            )}
                            {activeTab === 'credentials' && (
                                <CredentialsViewOnly patientid={patientId}/>
                            )}
                            {activeTab === 'settings' && (
                                <div className="alert alert-info py-2 small">Account settings coming soon</div>
                            )}
                            {activeTab === 'communications' && (
                                <CommunicationsViewOnly patientid={patientId} />
                            )}
                            {activeTab === 'transactions' && (
                                <TransactionsViewOnly patientid={patientId} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
