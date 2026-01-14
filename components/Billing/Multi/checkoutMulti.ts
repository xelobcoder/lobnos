import { toast } from "react-toastify";
import { plsEncryption } from "../../../lib/encryption";
import { MultiBillingData } from "../../../lib/Multi/MultiTypes";
import { customPost } from "../../Auth/customFetch";

export const handleCheckout = async (billingdata: MultiBillingData, specialCode, setBillingData) => {
     try {
          const checkoutPayload = {
               patientId: billingdata.patientid,
               billingid: billingdata.billingid,
               cart: billingdata.cart,
               servicesList: billingdata.servicesProvided,
               paymentDetails: null,
               branchid: billingdata.branchid,
               billingSource: billingdata.billingSource,
               referalCode: specialCode || '',
               promoCode: billingdata.promoCode || '',
               isPromo: billingdata.isPromo || false,
               promoCodeId: billingdata?.promoDetails?.id,
               isPackageUsed: billingdata.isPackageUsed,
               packageid: billingdata.packageid,
               entityid: billingdata.entityId,
               entitytype: billingdata.entitytype,
               ispricingcheckout: billingdata.ispricingcheckout
          };

          const retriveOutsourcedFromCheckoutPayload = (currentCart: any[], previousCart: any[]) => {
               if (Array.isArray(currentCart) && Array.isArray(previousCart)) {
                    return currentCart.map((item, index) => {
                         const _current_single_test = previousCart.find(prevItem => prevItem.testid === item.testid);
                         const { organization } = _current_single_test || {};
                         if (organization && organization.outsourceid) {
                              return { ...item, organization, outsourceid: organization.outsourceid, isoutsourced: 1 };
                         } else {
                              return item;
                         }
                    })
               }
               return currentCart;
          }

          const response = await customPost('billing/multi/checkout', 'POST', checkoutPayload);
          if (response && response.success && response.data) {
               setBillingData(prev => ({
                    ...prev, ...response.data,
                    cart: response.data.isPackageUsed ?
                         response.data.packageTestList :
                         retriveOutsourcedFromCheckoutPayload(response.data.cart, billingdata.cart) || [],
                    payments: [],
                    paid: 0,
                    allowAdvancePayment: true,
                    balance: response.data.amountPayable || 0,
                    promoDetails: response.data.promoDetails || {},
                    promoCode: response.data?.promoDetails?.code,
                    promoCodeId: response.data?.promoDetails?.id,
                    promoMethod: response.data?.promoDetails?.method,
                    showsummary: true,
                    servicesProvided: response.data?.servicesList || checkoutPayload.servicesList || [],
               }));
          } else {
               toast.error(response?.message || "Checkout failed. Please try again.");
               if (response.message == 'Outstanding debt found') {
                    window.location.href = `/billing/cash-collection?patientid=${plsEncryption((billingdata.patientid ?? '').toString())}`;
                    return;
               }
          }
     } catch (error) {
          console.error("Checkout error:", error);
          toast.error("Failed to complete checkout. Please try again.");
     }
};