"use client"
import React, { useEffect, useState } from 'react';
import { Button, Nav, Tab, Alert } from 'react-bootstrap';
import { defaultResultSettings, ResultSettings } from '../../../ResultView/result-settings';
import { customFetch, customPost } from '../../../Auth/customFetch';
import { toast } from 'react-toastify';
import Loader from '../../../accessories/Loader';
import { RiSettingsLine, RiPulseLine, RiSaveLine, RiBuildingLine, RiFileSettingsLine, RiRestartLine, RiChatQuoteLine } from '@remixicon/react';
import { GeneralTab } from '../../../settings/GeneralTab';
import { CompanyTab } from '../../../settings/CompanyTab';
import { ReportOptionsTab } from '../../../settings/ReportOptionsTab';
import { UltrasoundTab } from '../../../settings/UltrasoundTab';
import { CommentsTab } from '../../../settings/CommentsTab';

const defaultTestBodyColumnNames = {
     trFirstColumnName: 'Investigation',
     trSecondColumnName: 'Observed Value',
     trThirdColumnName: 'Units',
     trFourthColumnName: 'Range',
     trFifthColumnName: 'Flag',
};

function mergeSettings(response: any): ResultSettings {
     const s = { ...defaultResultSettings };
     return {
          ...defaultResultSettings,
          ...response,
          testBody: { ...defaultTestBodyColumnNames, ...s.testBody, ...(response?.testBody || {}) },
          patientInfo: { ...defaultResultSettings.patientInfo, ...(response?.patientInfo || {}) },
          companyInfo: { ...defaultResultSettings.companyInfo, ...(response?.companyInfo || {}) },
          comments: { ...defaultResultSettings.comments, ...(response?.comments || {}) },
     };
}

export default function ReportSettingsTab({ testid, testname }: { testid: number | string; testname?: string }) {
     const [settings, setSettings] = useState<ResultSettings>(() => mergeSettings(null));
     const [isCustom, setIsCustom] = useState<boolean>(false);
     const [loading, setLoading] = useState<boolean>(true);
     const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

     const loadSettings = async () => {
          try {
               setLoading(true);
               const response = await customFetch(`testpanel/reportsettings?testid=${testid}`);
               setIsCustom(!!response?.isCustom);
               setSettings(mergeSettings(response?.data));
          } catch (error) {
               toast.error("Failed to load report settings", { autoClose: 500, position: "top-center" });
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          if (testid) loadSettings();
     }, [testid]);

     const handleChange = (e) => {
          const { name, value, type, checked } = e.target;
          if (name.startsWith('companyInfo.')) {
               const key = name.split('.')[1];
               setSettings((prev) => ({ ...prev, companyInfo: { ...prev.companyInfo, [key]: type === 'number' ? Number(value) : value } }));
          } else if (name.startsWith('patientInfo.')) {
               const key = name.split('.')[1];
               setSettings((prev) => ({ ...prev, patientInfo: { ...prev.patientInfo, [key]: value } }));
          } else if (name.startsWith('testBody.')) {
               const key = name.split('.')[1];
               setSettings((prev) => ({ ...prev, testBody: { ...prev.testBody, [key]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value } }));
          } else if (name.startsWith('ultrasoundSettings.')) {
               const key = name.split('.')[1];
               setSettings((prev: ResultSettings): ResultSettings => ({
                    ...prev,
                    ultrasoundSettings: {
                         ...prev.ultrasoundSettings,
                         [key]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
                    } as ResultSettings['ultrasoundSettings']
               }));
          } else if (name.startsWith('comments.')) {
               const key = name.split('.')[1];
               setSettings((prev) => ({ ...prev, comments: { ...prev.comments, [key]: value } }));
          } else if (type === 'checkbox') {
               setSettings((prev) => ({ ...prev, [name]: checked }));
          } else if (type === 'number') {
               setSettings((prev) => ({ ...prev, [name]: Number(value) }));
          } else {
               setSettings((prev) => ({ ...prev, [name]: value }));
          }
     };

     const handleCustomize = () => {
          // Start customization from the currently resolved (general) settings.
          setIsCustom(true);
     };

     const handleSave = async () => {
          try {
               setIsSubmitting(true);
               const response: { status: string; message?: string } = await customPost(`testpanel/reportsettings`, "PUT", { testid, data: settings });
               if (response?.status === 'success') {
                    toast.success(response.message || "Test report settings updated successfully", { autoClose: 500, position: "top-center" });
               } else {
                    toast.error(response?.message || "Failed to update test report settings", { autoClose: 500, position: "top-center" });
               }
          } catch (error) {
               toast.error("An error occurred while updating settings", { autoClose: 500, position: "top-center" });
          } finally {
               setIsSubmitting(false);
               loadSettings();
          }
     };

     const handleRevert = async () => {
          const confirmation = confirm(`Revert "${testname || 'this test'}" back to the general report settings? Its custom layout will be removed.`);
          if (!confirmation) return;
          try {
               setIsSubmitting(true);
               const response: { status: string; message?: string } = await customPost(`testpanel/reportsettings?testid=${testid}`, "DELETE", {});
               if (response?.status === 'success') {
                    toast.success(response.message || "Reverted to general report settings", { autoClose: 500, position: "top-center" });
               } else {
                    toast.error(response?.message || "Revert failed", { autoClose: 500, position: "top-center" });
               }
          } catch (error) {
               toast.error("An error occurred while reverting settings", { autoClose: 500, position: "top-center" });
          } finally {
               setIsSubmitting(false);
               loadSettings();
          }
     };

     if (loading) return <Loader />;

     if (!isCustom) {
          return (
               <div className="border bg-white border-secondary-subtle p-3">
                    <Alert variant="secondary" className="d-flex justify-content-between align-items-center mb-0">
                         <span>This test uses the general report settings. Customize it to give this test its own report layout.</span>
                         <Button size="sm" variant="dark" onClick={handleCustomize}>Customize for this test</Button>
                    </Alert>
               </div>
          );
     }

     return (
          <div className="border bg-white border-secondary-subtle p-2">
               <div className="d-flex justify-content-between align-items-center mb-3">
                    <Alert variant="info" className="mb-0 py-2 px-3">Using a custom report layout for this test.</Alert>
                    <div className="d-flex gap-2">
                         <Button
                              disabled={isSubmitting}
                              variant="outline-secondary"
                              onClick={handleRevert}
                              className="d-flex align-items-center"
                         >
                              <RiRestartLine size={16} className="me-1" />
                              Revert to General
                         </Button>
                         <Button
                              disabled={isSubmitting}
                              variant="primary"
                              onClick={handleSave}
                              className="d-flex align-items-center"
                         >
                              <RiSaveLine size={16} className="me-1" />
                              {isSubmitting ? "Saving..." : "Save Changes"}
                         </Button>
                    </div>
               </div>

               <Tab.Container defaultActiveKey="general">
                    <Nav variant="tabs" className="border-bottom-0 px-3">
                         <Nav.Item>
                              <Nav.Link eventKey="general" className="d-flex align-items-center">
                                   <RiSettingsLine size={16} className="me-2" />
                                   General
                              </Nav.Link>
                         </Nav.Item>
                         <Nav.Item>
                              <Nav.Link eventKey="company" className="d-flex align-items-center">
                                   <RiBuildingLine size={16} className="me-2" />
                                   Company Info
                              </Nav.Link>
                         </Nav.Item>
                         <Nav.Item>
                              <Nav.Link eventKey="options" className="d-flex align-items-center">
                                   <RiFileSettingsLine size={16} className="me-2" />
                                   Report Options
                              </Nav.Link>
                         </Nav.Item>
                         <Nav.Item>
                              <Nav.Link eventKey="ultrasound" className="d-flex align-items-center">
                                   <RiPulseLine size={16} className="me-2" />
                                   Ultrasound
                              </Nav.Link>
                         </Nav.Item>
                         <Nav.Item>
                              <Nav.Link eventKey="comments" className="d-flex align-items-center">
                                   <RiChatQuoteLine size={16} className="me-2" />
                                   Comments
                              </Nav.Link>
                         </Nav.Item>
                    </Nav>

                    <Tab.Content className="p-3">
                         <Tab.Pane eventKey="general">
                              <GeneralTab settings={settings} handleChange={handleChange} />
                         </Tab.Pane>

                         <Tab.Pane eventKey="company">
                              <CompanyTab settings={settings} handleChange={handleChange} />
                         </Tab.Pane>

                         <Tab.Pane eventKey="options">
                              <ReportOptionsTab settings={settings} handleChange={handleChange} />
                         </Tab.Pane>

                         <Tab.Pane eventKey="ultrasound">
                              <UltrasoundTab settings={settings} handleChange={handleChange} />
                         </Tab.Pane>

                         <Tab.Pane eventKey="comments">
                              <CommentsTab settings={settings} handleChange={handleChange} />
                         </Tab.Pane>
                    </Tab.Content>
               </Tab.Container>
          </div>
     );
}
