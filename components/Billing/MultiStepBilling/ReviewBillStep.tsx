import React, { useContext, useState } from 'react';
import { BillingContext } from '../BillingContextComponents/BillingContext.jsx'; // Adjusted path
import Select from 'react-select';
import { customFetch, currencyFormatter } from '../../../Auth/customFetch.js'; // Adjusted path
import { RiPencilLine, RiDeleteBinLine } from '@remixicon/react';
import { toast } from 'react-toastify'; // Assuming toast is configured

// Define item interface matching cart item structure
interface CartItem {
  id: number; // This should be unique enough for cart operations or use a UUID if items can be duplicated
  name: string;
  discountedValue: number;
  discount?: number;
  isoutsourced?: number;
  outsourcename?: string;
  outsourceid?: number;
  // Add other properties that might be in your cart item
  testid?: number; // Original test ID if different from cart item ID (e.g. for org tests)
  isService?: boolean; // To differentiate services from tests
}

interface OutsourcingOrgOption {
    value: number; // outsourceid
    label: string; // name ( + type)
    name: string;
    organizationType?: string;
}


const ReviewBillStep: React.FC = () => {
  const { 
    billingdata, 
    // updateBilling, // Prefer recalculateTotalBill for cart changes
    recalculateTotalBill, 
    goToNextStep, 
    goToPreviousStep 
  } = useContext(BillingContext);

  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [outsourcingOrgs, setOutsourcingOrgs] = useState<OutsourcingOrgOption[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);

  // Use a more robust way to identify items if IDs are not unique in the cart
  // For this example, assuming item.id is sufficiently unique for removal for now.
  // If items can be duplicated, pass the item object or index instead.
  const handleRemoveItem = (itemToRemove: CartItem) => {
    // If multiple identical items can exist, this will remove all with that id.
    // Consider using a unique key per cart item if that's not desired.
    // For now, filtering by id. A safer approach for non-unique IDs would be to filter by reference or index.
    const updatedCart = billingdata.cart.filter((item: CartItem) => item.id !== itemToRemove.id || item.name !== itemToRemove.name); // Example: use id and name
    recalculateTotalBill({ ...billingdata, cart: updatedCart });
    toast.info(`Removed ${itemToRemove.name} from bill.`);
  };

  const openEditOutsourcingModal = async (item: CartItem) => {
    if (!item.isoutsourced) return;
    setEditingItem(item);
    setIsLoadingOrgs(true);
    try {
      const itemIdForQuery = billingdata.billingSource === 2 && item.testid ? item.testid : item.id; // Use testid for org billing source
      const response = await customFetch(`outsourcing/organization/testpanel/outsourceinfo?testid=${itemIdForQuery}`);
      if (Array.isArray(response)) {
        const orgOptions: OutsourcingOrgOption[] = response.map(org => ({
          value: org.outsourceid,
          label: `${org.name} (${org.organizationType || 'N/A'})`,
          name: org.name,
          organizationType: org.organizationType,
        }));
        setOutsourcingOrgs(orgOptions);
      } else {
        setOutsourcingOrgs([]);
        toast.warn(`No outsourcing organizations found for ${item.name}.`);
      }
    } catch (error) {
      console.error("Error fetching outsourcing orgs:", error);
      toast.error(`Error fetching organizations for ${item.name}.`);
      setOutsourcingOrgs([]);
    } finally {
      setIsLoadingOrgs(false);
    }
  };

  const handleSaveOutsourcingChange = (selectedOrgOption: OutsourcingOrgOption | null) => {
    if (editingItem && selectedOrgOption) {
      const updatedCart = billingdata.cart.map((cartItem: CartItem) =>
        cartItem.id === editingItem.id // Assuming id is unique enough here
          ? { 
              ...cartItem, 
              outsourceid: selectedOrgOption.value, 
              outsourcename: selectedOrgOption.name 
            }
          : cartItem
      );
      recalculateTotalBill({ ...billingdata, cart: updatedCart });
      toast.success(`Outsourcing for ${editingItem.name} updated to ${selectedOrgOption.name}.`);
    }
    setEditingItem(null);
    setOutsourcingOrgs([]);
  };
  
  const isNextDisabled = !billingdata.cart || billingdata.cart.length === 0;

  return (
    <div className="container-fluid p-3">
      <h2 className="h4 mb-4">Step 2: Review Your Bill</h2>

      {billingdata.cart && billingdata.cart.length > 0 ? (
        <>
          <div className="table-responsive mb-4 card shadow-sm">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Item Name</th>
                  <th>Outsourcing To</th>
                  <th className="text-end">Price</th>
                  <th className="text-end">Discount</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {billingdata.cart.map((item: CartItem, index: number) => (
                  <tr key={item.id + '-' + index}> {/* Use index for key if IDs not guaranteed unique */}
                    <td>{item.name} {item.isService && <span className="badge bg-info text-dark ms-1">Service</span>}</td>
                    <td>
                      {item.isoutsourced === 1 ? (
                        editingItem?.id === item.id ? ( // Check if this item is being edited
                          isLoadingOrgs ? (
                            <span>Loading Orgs...</span>
                          ) : (
                            <Select
                              options={outsourcingOrgs}
                              onChange={handleSaveOutsourcingChange}
                              defaultValue={outsourcingOrgs.find(org => org.value === item.outsourceid)}
                              placeholder="Select Organization..."
                              className="react-select-container"
                              classNamePrefix="react-select"
                              isClearable
                            />
                          )
                        ) : (
                          <>
                            {item.outsourcename || '-'}
                            <RiPencilLine
                              className="text-primary ms-2"
                              onClick={() => openEditOutsourcingModal(item)}
                              style={{ cursor: 'pointer' }}
                              size={18}
                              title="Edit Outsourcing"
                            />
                          </>
                        )
                      ) : (
                        '-' 
                      )}
                    </td>
                    <td className="text-end">{currencyFormatter.format(item.discountedValue)}</td>
                    <td className="text-end">{currencyFormatter.format(item.discount || 0)}</td>
                    <td className="text-center">
                      <button 
                        className="btn btn-sm btn-outline-danger" 
                        onClick={() => handleRemoveItem(item)}
                        title="Remove Item"
                      >
                        <RiDeleteBinLine size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Bill Summary Section */}
          <div className="card shadow-sm">
            <div className="card-header"><h5 className="mb-0">Bill Summary</h5></div>
            <div className="card-body">
                <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                        Items in Bill: <span>{billingdata.cart.length}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                        Subtotal (Tests & Services): 
                        <span>
                            {currencyFormatter.format((billingdata.testcost || 0) + (billingdata.totalCostOfServices || 0))}
                        </span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                        Total Discount: 
                        <span className="text-danger">
                            -{currencyFormatter.format((billingdata.totalTestDiscount || 0) + (billingdata.totalServiceDiscount || 0))}
                        </span>
                    </li>
                     <li className="list-group-item d-flex justify-content-between align-items-center">
                        Tax ({billingdata.appsettings?.taxValue || 0}%): 
                        <span>
                            {currencyFormatter.format(billingdata.amountIncurredDueTax || 0)}
                        </span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center fw-bold h5">
                        Total Payable:
                        <span>
                            {currencyFormatter.format(billingdata.payable || 0)}
                        </span>
                    </li>
                </ul>
            </div>
          </div>
        </>
      ) : (
        <div className="alert alert-info" role="alert">
            Your bill is currently empty. Go back to the previous step to add items.
        </div>
      )}

      <div className="d-flex justify-content-between mt-4">
        <button className="btn btn-secondary" onClick={goToPreviousStep}>
          Previous: Select Items
        </button>
        <button 
            className="btn btn-primary" 
            onClick={goToNextStep} 
            disabled={isNextDisabled}
        >
          Next: Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export default ReviewBillStep;
