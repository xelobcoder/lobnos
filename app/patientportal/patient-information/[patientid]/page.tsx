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
                <div className="col-lg-4 col-xl-3 bg-light border-end shadow-sm">
                    <div className="p-4 bg-white rounded-3 m-3 shadow-sm">
                        <div className="text-center mb-3">
                            <PatientImage patientid={patientId}/>
                        </div>
                        <PatientPersonalInformationViewOnly patientid={patientId}/>
                    </div>
                </div>

                <div className="col-lg-8 col-xl-9">
                    <div className="p-0">
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
