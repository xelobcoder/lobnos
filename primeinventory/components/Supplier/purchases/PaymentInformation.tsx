import { ChangeEvent, useEffect, useState } from 'react';
import Select from 'react-select';

export type paymentInformationProps = {
    paymentAmount: number;
    paymentMode: string;
    additionalPayment: number;
    isDisabled: boolean,
    additionalPaymentDescription: string;
    handleChange: (ev: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLSelectElement | HTMLTextAreaElement>, target: string) => void;
};

const paymentModes = [
    { value: '', label: 'Select Payment Mode' },
    { value: 'cash', label: 'Cash' },
    { value: 'credit Card', label: 'Credit Card' },
    { value: 'bank Transfer', label: 'Bank Transfer' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'online Payment', label: 'Online Payment' },
];

export default function SupplierPurchasePaymentInformation({
    paymentAmount,
    paymentMode,
    isDisabled,
    additionalPayment,
    handleChange,
    additionalPaymentDescription,
}: paymentInformationProps) {
    const [isLoaded, setisLoaded] = useState(false);
    const handleSelectChange = (selectedOption: { value: string; label: string }) => {
        handleChange({ target: { name: 'paymentMode', value: selectedOption.value } } as ChangeEvent<HTMLInputElement>, 'paymentMode');
    };

    useEffect(() => { setisLoaded(true) }, [isLoaded])

    return (
        <div>
            <hr />
            <h4>Payment Information</h4>
            <form>
                <div className="d-lg-flex col-12 col-lg-4 my-2">
                    <label className="col-lg-2 mb-2 mb-lg-0">Payment Amount</label>
                    <input
                        disabled={isDisabled}
                        className="custom-input"
                        type="number"
                        value={paymentAmount}
                        onChange={(ev) => handleChange(ev, 'paymentAmount')}
                        placeholder="Enter payment amount"
                        required
                    />
                </div>
                <div className="d-lg-flex col-12 col-lg-4 my-2">
                    <label className="col-lg-2 mb-2 mb-lg-0">Payment Mode</label>
                    {isLoaded && <Select
                        isDisabled={isDisabled}
                        className='col-10'
                        value={paymentModes.find(mode => mode.value === paymentMode)}
                        onChange={handleSelectChange}
                        options={paymentModes}
                        placeholder="Select Payment Mode"
                        isClearable
                    />}
                </div>
                <div className="d-lg-flex col-12 col-lg-4 my-2">
                    <label className="col-lg-2 mb-2 mb-lg-0">Additional Payment</label>
                    <input
                        disabled={isDisabled}
                        className="custom-input"
                        type="number"
                        value={additionalPayment}
                        onChange={(ev) => handleChange(ev, 'additionalPayment')}
                        placeholder="Enter additional payment (if any)"
                    />
                </div>
                <div className="d-lg-flex col-12 col-lg-4 my-2">
                    <label className="col-lg-2 mb-2 mb-lg-0">Additional Information</label>
                    <textarea
                        defaultValue={additionalPaymentDescription}
                        className="custom-input"
                        onChange={(ev) => { handleChange(ev, 'additionalPaymentDescription') }}
                        placeholder="Enter any additional information here"
                        rows={4}

                    />
                </div>
                <small>Additional payment could include taxes, fees, or adjustments to the total amount.</small>
            </form>
        </div>
    );
}
