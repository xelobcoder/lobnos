"use client";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { inventorySettings, updateInventorySettings } from "../../../components/inventory/Util";

interface InventorySettings {
    alertdays: number;
    stocksAutoDeduct: boolean;
    hasMultipleDepartments: boolean;
    isConnectedToLIMS: boolean;
    strictBrand: boolean;
    strictBatchNumber: boolean;
    lowStockThreshold: number;
    allowNegativeStock: boolean;
    autoArchiveExpiredStock: boolean;
    restrictDepartmentAccess: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    notificationFrequency: string;
}


export default function InventoryApplicationSettings() {
    const [settings, setSettings] = useState<InventorySettings>(inventorySettings);

    const updateSettings = () => {
        updateInventorySettings(settings, toast);
    };

    return (
        <div>
            <ToastContainer />
            <h4 className="mx-4 text-decoration-underline text-uppercase">Customization Settings</h4>
            <div className="px-3">
                {/* Days to expiry date */}
                <div className="d-flex  border-1 border border-end-0 border-start-0 border-top-0 border pls-color  p-3 border-bottom mb-2">
                    <span className="col-5">Days to expiry date</span>
                    <input
                        className="custom-input"
                        type="number"
                        min={0}
                        step={1}
                        value={settings.alertdays}
                        onChange={(ev) =>
                            setSettings((prev) => ({
                                ...prev,
                                alertdays: parseInt(ev.target.value, 10),
                            }))
                        }
                    />
                </div>

                {/* Automatic deduction of stock */}
                <div className="d-flex  border-1 border border-end-0 border-start-0 border-top-0 border pls-color  p-3">
                    <span className="col-5">
                        Automatic deduction of stock (deducts brands and batches closest to expiry)
                    </span>
                    <select
                        className="custom-select"
                        value={settings.stocksAutoDeduct.toString()}
                        onChange={(ev) =>
                            setSettings((prev) => ({
                                ...prev,
                                stocksAutoDeduct: JSON.parse(ev.target.value),
                            }))
                        }
                    >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>

                {/* Low Stock Threshold */}
                <div className="d-flex  border-1 border border-end-0 border-start-0 border-top-0 border pls-color  p-3">
                    <span className="col-5">Low Stock Threshold</span>
                    <input
                        className="custom-input"
                        type="number"
                        min={0}
                        value={settings.lowStockThreshold}
                        onChange={(ev) =>
                            setSettings((prev) => ({
                                ...prev,
                                lowStockThreshold: parseInt(ev.target.value, 10),
                            }))
                        }
                    />
                </div>

                {/* Allow Negative Stock */}
                <div className="d-flex  border-1 border border-end-0 border-start-0 border-top-0 border pls-color  p-3">
                    <span className="col-5">Allow Negative Stock</span>
                    <select
                        className="custom-select"
                        value={settings.allowNegativeStock.toString()}
                        onChange={(ev) =>
                            setSettings((prev) => ({
                                ...prev,
                                allowNegativeStock: JSON.parse(ev.target.value),
                            }))
                        }
                    >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>

                {/* Auto Archive Expired Stock */}
                <div className="d-flex  border-1 border border-end-0 border-start-0 border-top-0 border pls-color  p-3">
                    <span className="col-5">Auto-Archive Expired Stock</span>
                    <select
                        className="custom-select"
                        value={settings.autoArchiveExpiredStock.toString()}
                        onChange={(ev) =>
                            setSettings((prev) => ({
                                ...prev,
                                autoArchiveExpiredStock: JSON.parse(ev.target.value),
                            }))
                        }
                    >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>

                {/* Restrict Department Access */}
                <div className="d-flex  border-1 border border-end-0 border-start-0 border-top-0 border pls-color  p-3">
                    <span className="col-5">Restrict Department Access</span>
                    <select
                        className="custom-select"
                        value={settings.restrictDepartmentAccess.toString()}
                        onChange={(ev) =>
                            setSettings((prev) => ({
                                ...prev,
                                restrictDepartmentAccess: JSON.parse(ev.target.value),
                            }))
                        }
                    >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>

                {/* Email Notifications */}
                <div className="d-flex  border-1 border border-end-0 border-start-0 border-top-0 border pls-color  p-3">
                    <span className="col-5">Email Notifications</span>
                    <select
                        className="custom-select"
                        value={settings.emailNotifications.toString()}
                        onChange={(ev) =>
                            setSettings((prev) => ({
                                ...prev,
                                emailNotifications: JSON.parse(ev.target.value),
                            }))
                        }
                    >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>

                {/* SMS Notifications */}
                <div className="d-flex  border-1 border border-end-0 border-start-0 border-top-0 border pls-color  p-3">
                    <span className="col-5">SMS Notifications</span>
                    <select
                        className="custom-select"
                        value={settings.smsNotifications.toString()}
                        onChange={(ev) =>
                            setSettings((prev) => ({
                                ...prev,
                                smsNotifications: JSON.parse(ev.target.value),
                            }))
                        }
                    >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>

                {/* Notification Frequency */}
                <div className="d-flex  border-1 border border-end-0 border-start-0 border-top-0 border pls-color  p-3">
                    <span className="col-5">Notification Frequency</span>
                    <select
                        className="custom-select"
                        value={settings.notificationFrequency}
                        onChange={(ev) =>
                            setSettings((prev) => ({
                                ...prev,
                                notificationFrequency: ev.target.value,
                            }))
                        }
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
            </div>

            {/* Update Button */}
            <div className="d-flex justify-content-end">
                <button onClick={updateSettings} className="btn btn-primary mx-4 my-3">
                    Update Settings
                </button>
            </div>
        </div>
    );
}
