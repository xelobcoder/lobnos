import { Add, PlayArrowOutlined } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import Select from 'react-select';
import { currencyFormatter, customFetch } from "../Auth/customFetch";

export default function OutsourceServices() {
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [selectedTest, setSelectedTest] = useState(null);
    const [testOptions, setTestOptions] = useState([]);
    const [inputPrice, setInputPrice] = useState('');


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
                        price: test.price
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
                priceDifference: priceDifference.toFixed(3)
            };

            setCart([...cart, newItem]);
            setSelectedTest(null);
            setInputPrice('');
        }
    };

    if (loading) return <h6>Loading data..............</h6>;

    return (
        <div>
            <section className="d-flex justify-content-between my-2">
                <div>
                    <h5 className="my-2">Outsource Services Provided</h5>
                </div>
                <div>
                    <Button className="btn btn-primary" onClick={() => setLoading(true)}>
                        <PlayArrowOutlined /> Load All Tests
                    </Button>
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
                                <td className={item.priceDifference <= 0 ? "bg-danger-subtle ui" : "bg-success-subtle ui"}>{currencyFormatter.format(item.priceDifference)}</td>
                                <td>
                                    <Button variant="light" className="border-secondary-subtle">
                                        <Add />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            <section>
                <Button variant="success">
                    Save Test
                </Button>
            </section>
        </div>
    );
}
