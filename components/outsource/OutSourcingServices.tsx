import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Form, Card, Row, Col, Badge } from "react-bootstrap";
import Select from 'react-select';
import { ToastContainer, toast } from "react-toastify";
import { currencyFormatter, customFetch, customPost, reactSelectCustomStyles } from "../Auth/customFetch";
import { useApplicationSettings } from "../Auth/useApplicationContext";
import { 
    RiAddLine, 
    RiDeleteBin6Line, 
    RiSave3Line, 
    RiTestTubeLine,
    RiMoneyDollarCircleLine,
    RiFileListLine,
    RiArrowLeftRightLine,
    RiSearchLine
} from '@remixicon/react';

// Define interfaces for our data structures
interface TestOption {
    value: number;
    label: string;
    price: number;
    testid: number;
}

interface CartItem {
    name: string;
    price: string;
    priceDifference: string;
    testid: number;
    outserviceid?: number;
    outsourceid?: number;
}

export default function OutsourceServices() {
    const [loading, setLoading] = useState<boolean>(true);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedTest, setSelectedTest] = useState<TestOption | null>(null);
    const [testOptions, setTestOptions] = useState<TestOption[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [inputPrice, setInputPrice] = useState<string>('');

    const searchParams = useSearchParams();
    const outsourceid = searchParams ? searchParams.get("orgid") : null;
    
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

    const handleAddToCart = () => {
        if (selectedTest && inputPrice !== '') {
            const enteredPrice = parseFloat(inputPrice);
            const priceDifference = selectedTest.price - enteredPrice;
            const testExists = cart.some(item => item.testid === selectedTest.testid);
            
            if (testExists) {
                toast.warning('This test is already in your list');
                return;
            }
            
            const newItem: CartItem = {
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
                let cartFormatted = cart.map((a) => {
                    const { price, testid } = a;
                    const generalTestId = testid;
                    const outsourcePrice = price;
                    return { outsourcePrice, generalTestId };
                });
                const response = await customPost(`outsourcing/organization/services`, 'PUT', { 
                    outsourceid, 
                    employeeid, 
                    testList: cartFormatted 
                });
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

    const handleRemoveFromCart = (index: number) => {
        const updatedCart = [...cart];
        updatedCart.splice(index, 1);
        setCart(updatedCart);
        toast.info('Test removed from list');
    };
    
  
    const calculateTestPrice = (outsourcePrice: string, priceDifference: string): number => {
        const outPrice = parseFloat(outsourcePrice);
        const priceDiff = parseFloat(priceDifference);
        return priceDiff < 0 ? outPrice- Math.abs(priceDiff) : outPrice+ priceDiff;
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center p-5">
            <div className="spinner-border text-primary me-2" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <span>Loading available tests...</span>
        </div>
    );

    return (
        <Card className="shadow-sm border-0 mt-2">
            <Card.Body>
                <ToastContainer theme="colored" position="top-center" className={'text-sm'} />
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="d-flex align-items-center">
                        <RiTestTubeLine className="me-2" size={22} />
                        Outsource Services Management
                    </h5>
                    <Button 
                        variant="success" 
                        type="button"
                        className="d-flex align-items-center"
                        onClick={submitOutsourceInformation}
                        disabled={cart.length === 0}
                    >
                        <RiSave3Line className="me-1" /> Save Services
                    </Button>
                </div>

                <Row>
                    {/* Left Column - Test Selection - adjusted to 30% */}
                    <Col md={4} lg={3}>
                        <Card className="border-0 bg-light">
                            <Card.Header className="bg-primary bg-opacity-10 border-0">
                                <div className="d-flex align-items-center">
                                    <RiSearchLine className="me-2" size={18} />
                                    <h6 className="mb-0">Select Tests to Outsource</h6>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-secondary">
                                        <RiFileListLine className="me-1" /> Test Name
                                    </Form.Label>
                                    <Select
                                        className="basic-single"
                                        classNamePrefix="select"
                                        styles={reactSelectCustomStyles}
                                        isClearable
                                        isSearchable
                                        placeholder="Search for a test..."
                                        options={testOptions}
                                        value={selectedTest}
                                        onChange={value => setSelectedTest(value)}
                                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="text-secondary">
                                        <RiMoneyDollarCircleLine className="me-1" /> Outsource Price (GHS)
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.001"
                                        value={inputPrice}
                                        onChange={(e) => setInputPrice(e.target.value)}
                                        placeholder="Enter price"
                                    />
                                </Form.Group>

                                <div className="d-grid">
                                    <Button
                                        variant="primary"
                                        onClick={handleAddToCart}
                                        disabled={!selectedTest || !inputPrice}
                                        className="d-flex align-items-center justify-content-center"
                                    >
                                        <RiAddLine className="me-1" /> Add to List
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Right Column - Selected Tests - adjusted to 70% */}
                    <Col md={8} lg={9}>
                        <Card className="border-0 h-100">
                            <Card.Header className="bg-secondary bg-opacity-10 border-0">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <RiArrowLeftRightLine className="me-2" size={18} />
                                        <h6 className="mb-0">Outsourced Tests</h6>
                                    </div>
                                    <Badge bg="primary" pill>
                                        {cart.length} {cart.length === 1 ? 'test' : 'tests'}
                                    </Badge>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {cart.length === 0 ? (
                                    <div className="text-center p-4 text-muted">
                                        <RiFileListLine size={40} className="mb-2" />
                                        <p>No tests added yet. Select tests from the left panel.</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Test Name</th>
                                                    <th>Test Price</th>
                                                    <th>Outsource Price</th>
                                                    <th>Difference</th>
                                                    <th className="text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cart.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="align-middle">{item.name}</td>
                                                        <td className="align-middle">
                                                            {currencyFormatter.format(calculateTestPrice(item.price, item.priceDifference))}
                                                        </td>
                                                        <td className="align-middle">
                                                            {currencyFormatter.format(parseFloat(item.price))}
                                                        </td>
                                                        <td className="align-middle">
                                                            <Badge 
                                                                bg={parseFloat(item.priceDifference) <= 0 ? "danger" : "success"}
                                                                className="px-2 py-1"
                                                            >
                                                                {currencyFormatter.format(parseFloat(item.priceDifference))}
                                                            </Badge>
                                                        </td>
                                                        <td className="text-center">
                                                            <Button 
                                                                variant="outline-danger" 
                                                                size="sm"
                                                                onClick={() => handleRemoveFromCart(index)}
                                                            >
                                                                <RiDeleteBin6Line />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}
