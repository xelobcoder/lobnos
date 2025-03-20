import { customFetch } from "./customFetch";

export class BillingClass {
  constructor(patientid, billingdata, updateBillingData, cart, updateCart) {
    this.patientid = patientid;
    this.billingdata = billingdata;
    this.updateBillingData = updateBillingData;
    this.cart = cart;
    this.updateCart = updateCart;
    this.includeTax = true;
  }

  prefillData = async () => {
    try {
      let data = await customFetch('testpanel/list/bulk');
      const organization = await customFetch('organization');
      const clinician = await customFetch('clinicians');
      const paymentModes = await customFetch('paymentmodes');
      const taxes = await customFetch('application/tax');
      this.updateBillingData((prev) => {
        return {
          ...prev,
          allpanels: data?.data || [],
          organizations: organization?.result || [],
          clinicians: clinician?.result || [],
          paymentmode: paymentModes?.data || [],
          taxes: taxes?.result || [],
        }

      })
    } catch (error) {
      alert('Error fetching data required for billing');
    }
  };

  updateBillingData = (data) => {
    this.updateBillingData(...this.cart, data);
  }

  isInCart = (id) => {
    return this.cart.some((item) => item.id === id);
  };

  addToCart = (item) => {
    if (this.cart.length === 0) {
      this.updateCart([item]);
    } else {
      const { id } = item;
      if (!this.isInCart(id)) {
        this.updateCart([...this.cart, item]);
      } else {
        alert('Item already in cart');
      }
    }
  };


  calculateCost = (cart) => {
    return cart.reduce((acc, curr) => {
      return acc + curr.price;
    }, 0);
  }

  emptyCart = () => {
    this.updateCart([]);
  }

  removeFromCart = (id) => {
    const filteredCart = this.cart.filter((item) => item.id !== id);
    this.updateCart(filteredCart);
  }

  excludeTax = () => {
    this.includeTax = false;
  }

  addTax = () => {
    this.includeTax = true;
  }

  totalTaxValue = (taxes) => {
    if (Array.isArray(taxes)) {
      return taxes.reduce((acc, curr) => {
        return acc + curr.value;
      }, 0);
    } else {
      return 0;
    }
  }

  payableAmount = (cart, discount, taxes, includeTax) => {
    const totalTax = this.totalTaxValue(taxes);
    const totalBill = this.calculateCost(cart);
    if (includeTax) {
      return (totalBill - discount) + totalTax;
    } else {
      return totalBill - discount;
    }
  }
}



export const billingoptions = ['cash', 'mobile money', 'cheque', 'bank transfer'];


export const billingDefaultData = {
  organizations: 0,
  clinicians: 0,
  paymentmode: "",
  cost: 0,
  test: [],
  paid: 0,
  discount: 0,
  urgency: "none",
  patientid: null,
  branch: null
}



export const defaultpanel = { name: '', price: 0 }


export const defaultOrganization = { name: '', id: 0 }


export const defaultClinician = { name: '', id: 0 }