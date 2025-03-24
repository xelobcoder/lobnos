import { Add } from "@mui/icons-material";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import Select from 'react-select';
import { ToastContainer, toast } from "react-toastify";
import { currencyFormatter, customFetch, customPost } from "../Auth/customFetch";
import { useApplicationSettings } from "../Auth/useApplicationContext";

export default function OutsourceServices() {
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [selectedTest, setSelectedTest] = useState(null);
    const [testOptions, setTestOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [inputPrice, setInputPrice] = useState('');
    const outsourceid = useSearchParams().get("orgid");
    const { applicationsettings } = useApplicationSettings();
    const employeeid = applicationsettings.user.employeeid;




    useEffect(() => {
        const fetchTestOptions = async () => {
            setLoading(true);
            try {
                const response = await customFetch('testpanel/list/bulk');
                const { data } = response;
                if (Array.isArray(data) && data.length > 0) {
                    const options = data.map(test => ({
                        value: test.id,
                        label: test.name,
                        price: test.price,
                        testid: test.id
                    }));
                    setTestOptions(options);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
                setTestOptions([]);
            }
        };
        fetchTestOptions();
    }, []);

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            borderColor: state.isFocused ? '#80bdff' : '#ced4da',
            boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0, 123, 255, 0.25)' : null,
            '&:hover': {
                borderColor: state.isFocused ? '#80bdff' : '#adb5bd',
            }
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#007bff' : 'white',
            color: state.isSelected ? 'white' : '#495057',
            '&:hover': {
                backgroundColor: '#007bff',
                color: 'white'
            }
        }),
        menuPortal: base => ({ ...base, zIndex: 9999 })
    };

    const handleAddToCart = () => {
        if (selectedTest && inputPrice !== '') {
            const enteredPrice = parseFloat(inputPrice);
            const priceDifference = selectedTest.price - enteredPrice;
            const newItem = {
                name: selectedTest.label,
                price: enteredPrice.toFixed(3),
                priceDifference: priceDifference.toFixed(3),
                testid: selectedTest.testid
            };

            setCart([...cart, newItem]);
            setSelectedTest(null);
            setInputPrice('');
        }
    };


    const submitOutsourceInformation = async () => {
        await forwardResquestfn();

        async function forwardResquestfn() {
            if (outsourceid && employeeid) {
                let cartFormatted = cart.map((a, i) => {
                    const { price, testid } = a;
                    const generalTestId = testid;
                    const outsourcePrice = price;
                    return { outsourcePrice, generalTestId };
                });
                const response = await customPost(`outsourcing/organization/services`, 'PUT', { outsourceid, employeeid, testList: cartFormatted });
                const { status } = response;
                if (status === true) {
                    toast.success('services updated successfully');
                }
            }
        }
    }



    useEffect(() => {
        async function getPreviousSavedServices() {
            setIsLoading(true)
            try {
                if (outsourceid) {
                    const response = await customFetch(`outsourcing/organization/services?outsourceid=${outsourceid}`);
                    if (Array.isArray(response)) {
                        setCart(response);
                    }
                    setIsLoading(false);
                }
            } catch (error) {
                setCart([]);
                setIsLoading(false);
            }
        }
        getPreviousSavedServices()
    }, [outsourceid])


    if (loading) return <h6>Loading data..............</h6>;



    return (
        <div>
            <ToastContainer theme="colored" position="top-center" className={'text-sm'} />
            <section className="d-flex justify-content-between my-2">
                <div>
                    <h5 className="my-2">Outsource Services Provided</h5>
                </div>
            </section>
            <section>
                <table className="table table-responsive my-2 text-sm">
                    <thead className="table-secondary text-capitalize fw-bold">
                        <tr>
                            <th>Test</th>
                            <th>Price (GHS)</th>
                            <th>Price Difference (GHS)</th>
                            <th>Add</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <Select
                                    styles={customStyles}
                                    className="basic-single"
                                    classNamePrefix="select"
                                    isClearable
                                    isSearchable
                                    autoFocus
                                    placeholder="Select a test"
                                    options={testOptions}
                                    value={selectedTest}
                                    onChange={value => setSelectedTest(value)}
                                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                />
                            </td>
                            <td>
                                <Form.Control
                                    className="custom-input"
                                    type="number"
                                    value={inputPrice}
                                    onChange={(e) => setInputPrice(e.target.value)}
                                />
                            </td>
                            <td></td>
                            <td>
                                <Button
                                    variant="light"
                                    className="border-secondary-subtle"
                                    onClick={handleAddToCart}
                                >
                                    <Add />
                                </Button>
                            </td>
                        </tr>
                        {cart.map((item, index) => (
                            <tr key={index}>
                                <td>{item.name}</td>
                                <td>{currencyFormatter.format(item.price)} GHS</td>
                                <td className={item.priceDifference <= 0 ? "bg-danger-subtle ui" : "bg-success-subtle ui"}>
                                    {currencyFormatter.format(item.priceDifference)}
                                </td>
                                <td>
                                    <Button variant="light"

                                        className="border-secondary-subtle">
                                        <Add />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            <section>
                <Button variant="success" type="button"
                    onClick={(ev) => { submitOutsourceInformation(ev) }} >
                    Save Test
                </Button>
            </section>
        </div>
    );
}
