import React, { useContext, useState, useEffect, useCallback } from 'react';
import { BillingContext } from '../BillingContextComponents/BillingContext.jsx'; // Adjusted path
import Select from 'react-select';
import { 
    billingSource as billingSourceOptionsArray, // Renamed for clarity
    LoadOrganizationalTest,
    fetchServices // Assuming this fetches a list of available services
} from '../../../../lib/billingLib.js'; // Adjusted path
import { customFetch } from '../../../Auth/customFetch.js'; // Adjusted path
import { toast } from 'react-toastify'; // Assuming toast is configured globally
import RenderingBillingSourceLayout from '../BillingContextComponents/Lib/RenderingSelectedBillingSourecAccessories.jsx'; // Adjusted path
import SelectPackages from '../BillingContextComponents/Lib/packages/SelectPackages.tsx'; // Adjusted path
import { RiAddLine } from '@remixicon/react'; // For Add button icon

// Define interfaces for items if not already in context/billingLib
interface TestPanelItem {
    id: number;
    name:string;
    discountedValue: number; // Price
    isoutsourced?: number; // 0 or 1
    // ... other properties from your test panel structure
    discount?: number; // for potential future use
    originalValue?: number; // for night adjustments
    testid?: number; // for org tests
}

interface OutsourcingOrg {
    outsourceid: number;
    name: string;
    // ... other properties
}

const BillableItemsStep = () => {
  const { 
    billingdata, 
    updateBilling, 
    recalculateTotalBill, 
    goToNextStep, 
    BILLING_STEPS 
  } = useContext(BillingContext);

  const [isClient, setIsClient] = useState(false); // For react-select hydration
  const [isLoadingTestPanels, setIsLoadingTestPanels] = useState(false);
  
  // States for item selection with outsourcing
  const [selectedItemForCart, setSelectedItemForCart] = useState<TestPanelItem | null>(null);
  const [isLoadingOutsourceOrgs, setIsLoadingOutsourceOrgs] = useState(false);
  const [outsourcingOrgsList, setOutsourcingOrgsList] = useState<OutsourcingOrg[]>([]);
  const [selectedOutsourceOrg, setSelectedOutsourceOrg] = useState<OutsourcingOrg | null>(null);
  
  const [availableServices, setAvailableServices] = useState<TestPanelItem[]>([]);

  useEffect(() => {
    setIsClient(true); // For react-select to work correctly with SSR
    // Fetch general services if needed, or they might be part of testpanels based on source
    // For now, let's assume a general fetch for additional services
    const loadServices = async () => {
        try {
            const services = await fetchServices(); // from billingLib.js
            if (Array.isArray(services)) {
                setAvailableServices(services.map(s => ({...s, id: s.serviceid || s.id, discountedValue: s.price}))); // Adapt service structure
            }
        } catch (error) {
            toast.error("Failed to load additional services.");
            console.error("Failed to load additional services:", error);
        }
    };
    loadServices();
  }, []);

  const updateBillingSourceSelected = (selectedOption: { value: number; label: string } | null) => {
    const value = selectedOption?.value;
    if (value !== undefined && !isNaN(value)) {
        // Reset relevant parts of billingdata when source changes
        updateBilling({
            ...billingdata,
            billingSource: value,
            organizationId: "",
            clinicianId: "",
            insuranceId: "", // Assuming 'phis' maps to insuranceId
            cart: [],
            testpanels: [],
            servicesProvided: [], // Reset services if they depend on source
            payable: 0,
            testcost: 0,
            outstanding: 0,
            discount: 0,
            billingSourceTitle: selectedOption?.label || `Billing Source: ${value}`,
            isPackageUsed: false, // Reset package usage
        });
    }
  };
  
  // Adapted from BillingOptionsSource.jsx for Organization Test Loading
  useEffect(() => {
    if (billingdata.organizationId && billingdata.billingSource === 2) { // 2 for Organization
        setIsLoadingTestPanels(true);
        LoadOrganizationalTest(billingdata.organizationId)
            .then(({ testList }) => {
                if (Array.isArray(testList)) {
                    updateBilling({
                        ...billingdata,
                        testpanels: testList,
                    });
                }
            })
            .catch(() => {
                toast.error('Error loading organizational tests');
                updateBilling({...billingdata, testpanels: []});
            })
            .finally(() => setIsLoadingTestPanels(false));
    }
  }, [billingdata.organizationId, billingdata.billingSource]); // updateBilling removed from deps to avoid loop

  // Adapted from BillingOptionsSource.jsx for Clinician/Insurance Test Loading
  const handleLoadClinicianOrInsuranceTests = async (targetType: 'clinicians' | 'phis', uniqueId: string | number) => {
    try {
        setIsLoadingTestPanels(true);
        const response = await customFetch(`clinicians/billing/strategies/get/testpanels/${uniqueId}/${targetType}`);
        if (Array.isArray(response)) {
            updateBilling({
                ...billingdata,
                testpanels: response,
                [targetType === "clinicians" ? "clinicianId" : "insuranceId"]: uniqueId,
                type: targetType, // 'clinicians' or 'phis'
                billingSourceTitle: `${targetType === "clinicians" ? "Clinician" : "Insurance"}: ${response[0]?.name || uniqueId}` // Example title
            });
        } else {
            updateBilling({...billingdata, testpanels: []});
        }
    } catch (err) {
        console.error(err);
        toast.error(`Error loading ${targetType} data`);
        updateBilling({...billingdata, testpanels: []});
    } finally {
        setIsLoadingTestPanels(false);
    }
  };
  
  // Callback for RenderingBillingSourceLayout
  const updateContextForOrgSelection = async (value: { id: string | number; name: string }) => {
      if (billingdata.billingSource === 2 && typeof value === "object") { // Organization
          updateBilling({
              ...billingdata,
              organizationId: value.id,
              cart: [],
              type: 'organization',
              servicesProvided: [],
              testpanels: [], // Will be loaded by useEffect above
              billingSourceTitle: `Organizational Billing: ${value.name}`,
          });
      }
  };
  const handleClinicianSelectionForLayout = async (value: { id: string | number }) => {
      if (value?.id) await handleLoadClinicianOrInsuranceTests('clinicians', value.id);
  };
  const handleInsuranceSelectionForLayout = async (value: { id: string | number }) => {
      if (value?.id) await handleLoadClinicianOrInsuranceTests('phis', value.id);
  };


  // Adapted addtoCart logic from TableTr.jsx
  const handleAddItemToCart = async (item: TestPanelItem) => {
    if (!item || typeof item !== "object") return;

    // Check if item already in cart (simple check by id)
    const isInCart = billingdata.cart.some(cartItem => cartItem.id === item.id && cartItem.package_id === item.package_id); // package_id check if applicable
    if (isInCart) {
        toast.info(`${item.name} is already in the bill.`);
        return;
    }

    if (item.isoutsourced === 1) {
        setSelectedItemForCart(item); // Store item, trigger UI for outsource org selection
        try {
            setIsLoadingOutsourceOrgs(true);
            // Use item.testid if source is organization, otherwise item.id
            const testIdForOutsourceQuery = billingdata.billingSource === 2 ? item.testid : item.id;
            const storedOrgs = await customFetch(`outsourcing/organization/testpanel/outsourceinfo?testid=${testIdForOutsourceQuery}`);
            setOutsourcingOrgsList(Array.isArray(storedOrgs) ? storedOrgs.map(org => ({ ...org, outsourceid: org.outsourceid || org.id })) : []); // Ensure outsourceid
            if (!Array.isArray(storedOrgs) || storedOrgs.length === 0) {
                toast.warn(`No outsourcing organizations configured for ${item.name}. Item added without outsource details or cannot be added.`);
                // Decide if item can be added without outsource org, or if it's mandatory
                // For now, let's add it without, similar to TableTr.jsx's fallback for managers
                // const newItemDirect = { ...item, discount: item.discount || 0 };
                // recalculateTotalBill({ ...billingdata, cart: [...billingdata.cart, newItemDirect] });
                // setSelectedItemForCart(null); // Reset
                // return; 
                // OR, prevent adding:
                 setSelectedItemForCart(null); // Reset
                 return;
            }
        } catch (error) {
            toast.error(`Error fetching outsourcing organizations for ${item.name}.`);
            console.error(error);
            setIsLoadingOutsourceOrgs(false);
            setSelectedItemForCart(null); // Reset
            return; // Prevent adding if fetch fails
        } finally {
            setIsLoadingOutsourceOrgs(false);
        }
        return; // Wait for outsource org selection
    }

    // If not outsourced, or after outsource org is selected
    const newItem = { ...item, discount: item.discount || 0 };
    recalculateTotalBill({ ...billingdata, cart: [...billingdata.cart, newItem] });
    toast.success(`${newItem.name} added to bill.`);
    resetOutsourceSelection();
  };

  const handleConfirmAddOutsourcedItem = () => {
    if (!selectedItemForCart) return;
    if (!selectedOutsourceOrg && selectedItemForCart.isoutsourced === 1 && outsourcingOrgsList.length > 0) {
        toast.warn("Please select an outsourcing organization.");
        return;
    }

    const newItem = {
        ...selectedItemForCart,
        ...(selectedItemForCart.isoutsourced === 1 && selectedOutsourceOrg ? 
            { 
                outsourceid: selectedOutsourceOrg.outsourceid, 
                outsourcename: selectedOutsourceOrg.name, // Add outsource name to cart item
            } : {}
        ),
        discount: selectedItemForCart.discount || 0,
    };
    
    recalculateTotalBill({ ...billingdata, cart: [...billingdata.cart, newItem] });
    toast.success(`${newItem.name} added to bill.`);
    resetOutsourceSelection();
  };
  
  const resetOutsourceSelection = () => {
    setSelectedItemForCart(null);
    setOutsourcingOrgsList([]);
    setSelectedOutsourceOrg(null);
  };

  const handleIncludeServicesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    updateBilling({ ...billingdata, includeServices: isChecked });
    if (isChecked) {
        // Add all available services to cart, or implement a selection UI
        // For now, let's add all available services that are not already in cart
        const servicesToAdd = availableServices.filter(service => 
            !billingdata.cart.some(cartItem => cartItem.id === service.id && cartItem.isService) // Assuming an isService flag
        ).map(service => ({...service, isService: true})); // Mark as service

        if(servicesToAdd.length > 0) {
            recalculateTotalBill({ ...billingdata, includeServices: isChecked, cart: [...billingdata.cart, ...servicesToAdd] });
            toast.info("Additional services added to bill.");
        }
    } else {
        // Remove services added by this checkbox (optional, could be complex)
        // For simplicity, we might just uncheck and let user remove manually in review step
        // Or, if services are clearly marked:
        const cartWithoutServices = billingdata.cart.filter(item => !item.isService);
        recalculateTotalBill({ ...billingdata, includeServices: isChecked, cart: cartWithoutServices });
        toast.info("Additional services removed (if previously added by this checkbox).");
    }
  };

  const isNextDisabled = !billingdata.billingSource || (billingdata.cart?.length === 0 && !billingdata.isServiceOnly);


  return (
    <div className="container-fluid p-3">
      <h2 className="h4 mb-4">Step 1: Select Billable Items</h2>
      
      {/* Billing Source Selection */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h5 className="mb-0">Billing Configuration</h5>
        </div>
        <div className="card-body">
          <div className="form-group mb-3">
            <label htmlFor="billingSourceSelect" className="form-label">Billing Source</label>
            {isClient && (
              <Select
                inputId="billingSourceSelect"
                options={billingSourceOptionsArray}
                value={billingSourceOptionsArray.find(option => option.value === billingdata.billingSource)}
                onChange={updateBillingSourceSelected}
                placeholder="Select Billing Source..."
                classNamePrefix="react-select"
              />
            )}
          </div>
          {billingdata.billingSource > 0 && (
            <RenderingBillingSourceLayout
                isClient={isClient} // Pass isClient
                billingdata={billingdata}
                handleClinicianSelection={handleClinicianSelectionForLayout}
                handleInsuranceSelection={handleInsuranceSelectionForLayout}
                updateValuesToContext={updateContextForOrgSelection} // For organization selection
            />
          )}
        </div>
      </div>

      {/* Packages Selection */}
      {billingdata.billingSource > 0 && !billingdata.previewPrevious && (
          <div className="mb-4">
            <SelectPackages />
          </div>
      )}
      
      {/* "Include Services" Checkbox */}
      {billingdata.billingSource > 0 && !billingdata.isPackageUsed && !billingdata.previewPrevious && (
          <div className="form-check my-3">
              <input
                  className="form-check-input"
                  type="checkbox"
                  id="includeServicesCheckbox"
                  checked={billingdata.includeServices || false}
                  onChange={handleIncludeServicesChange}
              />
              <label className="form-check-label" htmlFor="includeServicesCheckbox">
                  Include Additional Services
              </label>
          </div>
      )}
      {billingdata.includeServices && availableServices.length > 0 && !billingdata.isPackageUsed && (
          <div className="card shadow-sm mb-4">
              <div className="card-header"><h5 className="mb-0">Available Services</h5></div>
              <div className="list-group list-group-flush">
                  {availableServices.map(service => (
                      <div key={`service-${service.id}`} className="list-group-item d-flex justify-content-between align-items-center">
                          {service.name} - {billingdata.currency_symbol || '$'}{service.discountedValue.toFixed(2)}
                          <button 
                              className="btn btn-sm btn-outline-primary" 
                              onClick={() => handleAddItemToCart({...service, isService: true})}
                              disabled={billingdata.cart.some(ci => ci.id === service.id && ci.isService)}
                          >
                              <RiAddLine size={18} /> Add
                          </button>
                      </div>
                  ))}
              </div>
          </div>
      )}


      {/* Item/Service Selection */}
      {billingdata.billingSource > 0 && !billingdata.isPackageUsed && !billingdata.previewPrevious && (
        <div className="card shadow-sm mb-4">
          <div className="card-header">
            <h5 className="mb-0">Available Items/Tests</h5>
          </div>
          <div className="card-body">
            {isLoadingTestPanels && <p>Loading test panels...</p>}
            {!isLoadingTestPanels && (!billingdata.testpanels || billingdata.testpanels.length === 0) && (
              <p>No items found for the selected billing configuration. Please select a source or check configuration.</p>
            )}
            {billingdata.testpanels && billingdata.testpanels.length > 0 && (
              <ul className="list-group">
                {billingdata.testpanels.map((item: TestPanelItem) => (
                  <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      {item.name} <small className="text-muted">({billingdata.currency_symbol || '$'}{item.discountedValue.toFixed(2)})</small>
                      {item.isoutsourced === 1 && <span className="badge bg-warning text-dark ms-2">Outsourced</span>}
                    </div>
                    <button 
                        className="btn btn-sm btn-outline-primary" 
                        onClick={() => handleAddItemToCart(item)}
                        disabled={billingdata.cart.some(cartItem => cartItem.id === item.id && !cartItem.package_id)} // Simple check
                    >
                        <RiAddLine size={18} /> Add
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Modal/Section for Outsourcing Selection */}
      {selectedItemForCart && selectedItemForCart.isoutsourced === 1 && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Select Outsourcing Organization for {selectedItemForCart.name}</h5>
                        <button type="button" className="btn-close" onClick={resetOutsourceSelection}></button>
                    </div>
                    <div className="modal-body">
                        {isLoadingOutsourceOrgs && <p>Loading organizations...</p>}
                        {!isLoadingOutsourceOrgs && outsourcingOrgsList.length === 0 && (
                            <p>No outsourcing organizations configured for this item. It cannot be added as outsourced.</p>
                        )}
                        {!isLoadingOutsourceOrgs && outsourcingOrgsList.length > 0 && (
                            <Select
                                options={outsourcingOrgsList.map(org => ({ value: org, label: org.name }))}
                                onChange={(selected) => setSelectedOutsourceOrg(selected ? selected.value : null)}
                                placeholder="Select Outsourcing Organization..."
                                classNamePrefix="react-select"
                                value={selectedOutsourceOrg ? {value: selectedOutsourceOrg, label: selectedOutsourceOrg.name} : null}
                            />
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={resetOutsourceSelection}>Cancel</button>
                        <button 
                            type="button" 
                            className="btn btn-primary" 
                            onClick={handleConfirmAddOutsourcedItem}
                            disabled={isLoadingOutsourceOrgs || (outsourcingOrgsList.length > 0 && !selectedOutsourceOrg)}
                        >
                            Add to Bill
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
      
      {/* Current Cart Summary */}
      <div className="card shadow-sm mb-4">
        <div className="card-header"><h5 className="mb-0">Pending Bill Summary</h5></div>
        <div className="card-body">
            <p>Items in Bill: {billingdata.cart?.length || 0}</p>
            <p className="fw-bold">Estimated Total: {billingdata.currency_symbol || '$'}{(billingdata.payable || 0).toFixed(2)}</p>
        </div>
      </div>

      <div className="d-flex justify-content-end mt-4">
        <button className="btn btn-primary" onClick={goToNextStep} disabled={isNextDisabled}>
          Next: Review Bill
        </button>
      </div>
    </div>
  );
};

export default BillableItemsStep;
