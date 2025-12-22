'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, Button, FormControl, FormGroup, FormLabel, FormSelect, Row, Col, Spinner, Alert } from 'react-bootstrap';
import Select, { SingleValue } from 'react-select';
import { useState, useCallback, useMemo } from 'react';
import { currencyFormatter, reactSelectCustomStyles } from '../../Auth/customFetch';


// Schema for individual cart item
const cartItemSchema = z.object({
    test_panel_id: z.number().int().positive('Panel ID is required'),
    price_type: z.enum(['percentage', 'flat'], { message: 'Invalid price type' }),
    amount: z.number()
        .min(0, 'Amount must be non-negative')
        .max(1000000, 'Amount cannot exceed 1,000,000')
        .refine(val => !isNaN(val) && val >= 0, 'Invalid amount'),
});

// Schema for the entire form
const schema = z.object({
    billing_strategy_id: z.number().int().positive('Strategy ID is required'),
    price_type: z.enum(['percentage', 'flat'], { message: 'Invalid price type' }),
    amount: z.number()
        .min(0, 'Amount must be non-negative')
        .max(1000000, 'Amount cannot exceed 1,000,000')
        .refine(val => !isNaN(val) && val >= 0, 'Invalid amount'),
    cart_items: z.array(cartItemSchema).optional(),
});

type FormData = z.infer<typeof schema>;
type CartItem = z.infer<typeof cartItemSchema>;

interface TestPanel {
    id: number;
    testid: number;
    name: string;
    discountedValue: number;
    isoutsourced: number;
}

interface PanelOption {
    value: number;
    label: string;
    data: TestPanel;
}

interface BillingStrategyPriceFormProps {
    billing_strategy_id: number;
    test_panels?: TestPanel[];
    is_applicable_to_all_test: boolean;
    onSubmit?: (data: FormData) => Promise<void>;
}

export default function BillingStrategyPriceForm({
    billing_strategy_id,
    test_panels = [],
    is_applicable_to_all_test,
    onSubmit,
}: BillingStrategyPriceFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        reset,
        watch,
        trigger,
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            billing_strategy_id,
            price_type: 'percentage',
            amount: 0,
            cart_items: [],
        },
    });

    const [selectedPanel, setSelectedPanel] = useState<PanelOption | null>(null);
    const [selectedPanels, setSelectedPanels] = useState<(TestPanel & CartItem)[]>([]);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Memoize panel options
    const panelOptions = useMemo(
        () =>
            test_panels.map(panel => ({
                value: panel.id,
                label: `${panel.name} (${currencyFormatter.format(panel.discountedValue)})`,
                data: panel,
            })),
        [test_panels]
    );

    // Get default panel for Select component
    const defaultPanel = useMemo(() => {
        if (panelOptions.length > 0 && !selectedPanel) {
            return panelOptions[0];
        }
        return selectedPanel;
    }, [panelOptions, selectedPanel]);

    // Watch form fields
    const priceType = watch('price_type', 'percentage');
    const amount = watch('amount');

    // Handle panel selection
    const handlePanelSelect = useCallback(
        (selectedOption: SingleValue<PanelOption>) => {
            setSelectedPanel(selectedOption);
            setSubmitError(null); // Clear any previous error
        },
        []
    );

    // Handle adding to cart
    const handleAddToCart = useCallback(async () => {
        if (!selectedPanel) {
            setSubmitError('Please select a test panel');
            return;
        }

        // Validate amount
        const isAmountValid = await trigger('amount');
        if (!isAmountValid) {
            return;
        }

        const newItem: CartItem = {
            test_panel_id: selectedPanel.value,
            price_type: priceType as 'percentage' | 'flat',
            amount: Number(amount) || 0,
        };

        // Validate cart item
        try {
            cartItemSchema.parse(newItem);
        } catch (error) {
            setSubmitError('Invalid cart item data');
            return;
        }

        setSelectedPanels(prev => {
            // Check for duplicates
            if (prev.some(panel => panel.id === selectedPanel.value)) {
                setSubmitError('This panel is already in the cart');
                return prev;
            }
            const newPanels = [...prev, { ...selectedPanel.data, ...newItem }];
            setValue('cart_items', newPanels.map(({ id, price_type, amount }) => ({
                test_panel_id: id,
                price_type,
                amount,
            })), { shouldValidate: true, shouldDirty: true });
            return newPanels;
        });

        // Reset selection and form fields
        setSelectedPanel(null);
        setValue('amount', 0, { shouldValidate: true });
        setSubmitError(null);
    }, [selectedPanel, priceType, amount, setValue, trigger]);

    // Handle panel removal
    const removePanel = useCallback(
        (id: number) => {
            setSelectedPanels(prev => {
                const newPanels = prev.filter(panel => panel.id !== id);
                setValue('cart_items', newPanels.map(({ id, price_type, amount }) => ({
                    test_panel_id: id,
                    price_type,
                    amount,
                })), { shouldValidate: true, shouldDirty: true });
                // Reset selected panel to default
                setSelectedPanel(null);
                return newPanels;
            });
            setSubmitError(null); // Clear any duplicate error on removal
        },
        [setValue]
    );

    // Handle form submission
    const handleFormSubmit = useCallback(
        async (data: FormData) => {
            try {
                setSubmitError(null);

                if (!is_applicable_to_all_test && (!data.cart_items || data.cart_items.length === 0)) {
                    throw new Error('Please add at least one test panel to the cart');
                }

                if (onSubmit) {
                    await onSubmit(data);
                    reset();
                    setSelectedPanels([]);
                    setSelectedPanel(null);
                }
            } catch (error) {
                setSubmitError(error instanceof Error ? error.message : 'Failed to submit form');
            }
        },
        [onSubmit, reset, is_applicable_to_all_test]
    );

    return (
        <div className="py-4">
            <style>
                {`
          .form-container, .panels-container {
            border: 1px solid var(--bs-border-color);
            padding: 1.5rem;
            border-radius: 6px;
            background-color: var(--theme-card-bg);
          }
          .panels-header {
            border-bottom: 1px solid var(--bs-border-color);
            padding-bottom: 0.75rem;
            margin-bottom: 1rem;
          }
          .panel-item {
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--bs-border-color);
            transition: background-color 0.2s ease;
          }
          .panel-item:hover {
            background-color: var(--bs-secondary-bg);
          }
          .panel-item:last-child {
            border-bottom: none;
          }
          .submit-button, .add-to-cart-button {
            transition: all 0.3s ease;
          }
          .submit-button:hover, .add-to-cart-button:hover {
            transform: translateY(-1px);
          }
          .panels-footer {
            border-top: 1px solid var(--bs-border-color);
            padding-top: 0.75rem;
            margin-top: 1rem;
          }
        `}
            </style>

            {submitError && (
                <Alert variant="danger" dismissible onClose={() => setSubmitError(null)} className="mb-4">
                    {submitError}
                </Alert>
            )}

            <Row className="g-4">
                {/* Form Column */}
                <Col lg={selectedPanels.length > 0 ? 7 : 12}>
                    <div className="form-container">
                        <Form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
                            {!is_applicable_to_all_test && (
                                <FormGroup className="mb-4">
                                    <FormLabel className="fw-semibold">Test Panels</FormLabel>
                                    <Select
                                        options={panelOptions}
                                        onChange={handlePanelSelect}
                                        value={defaultPanel}
                                        placeholder="Search and select a test panel..."
                                        styles={reactSelectCustomStyles}
                                        isDisabled={isSubmitting}
                                        aria-label="Select a test panel"
                                    />
                                    {errors.cart_items && (
                                        <div className="text-danger mt-1" role="alert">
                                            {errors.cart_items.message}
                                        </div>
                                    )}
                                </FormGroup>
                            )}

                            <Row>
                                <Col md={6}>
                                    <FormGroup className="mb-4">
                                        <FormLabel className="fw-semibold">Price Type</FormLabel>
                                        <FormSelect
                                            {...register('price_type')}
                                            isInvalid={!!errors.price_type}
                                            disabled={isSubmitting}
                                            aria-label="Select price type"
                                        >
                                            <option value="percentage">Percentage {priceType === 'percentage' && '(%)'}</option>
                                            <option value="flat">Flat Amount {priceType === 'flat' && '(Ghanacedis)'}</option>
                                        </FormSelect>
                                        <FormControl.Feedback type="invalid">
                                            {errors.price_type?.message}
                                        </FormControl.Feedback>
                                    </FormGroup>
                                </Col>

                                <Col md={6}>
                                    <FormGroup className="mb-4">
                                        <FormLabel className="fw-semibold">
                                            Amount {priceType === 'percentage' ? '(%)' : 'GHC'}
                                        </FormLabel>
                                        <FormControl
                                            type="number"
                                            step={priceType === 'percentage' ? '0.01' : '1'}
                                            min="0"
                                            {...register('amount', { valueAsNumber: true })}
                                            isInvalid={!!errors.amount}
                                            disabled={isSubmitting}
                                            aria-label="Enter amount"
                                        />
                                        <FormControl.Feedback type="invalid">
                                            {errors.amount?.message}
                                        </FormControl.Feedback>
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row className="mt-3">
                                <Col md={6}>
                                    <Button
                                        variant="success"
                                        className="w-100 add-to-cart-button"
                                        onClick={handleAddToCart}
                                        disabled={isSubmitting}
                                        aria-label="Add to cart"
                                    >
                                        Add to Cart
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                </Col>

                {/* Selected Panels Column */}
                {selectedPanels.length > 0 && (
                    <Col lg={5}>
                        <div className="panels-container">
                            <div className="panels-header">
                                <h5 className="mb-0">Selected Test Panels ({selectedPanels.length})</h5>
                            </div>
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {selectedPanels.map(panel => (
                                    <div
                                        key={panel.id}
                                        className="panel-item d-flex align-items-center"
                                    >
                                        <div className="flex-grow-1">
                                            <h6 className="mb-1 fw-semibold">{panel.name}</h6>
                                            <div className="d-flex justify-content-between">
                                                <small className="text-muted">
                                                    Price: {currencyFormatter.format(panel.discountedValue).replace('₹', 'Ghanacedis')}
                                                </small>
                                            </div>
                                            <small className="text-muted">
                                                {panel.price_type === 'percentage' ? `${panel.amount}%` : `${panel.amount} GHC`}
                                            </small>
                                        </div>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => removePanel(panel.id)}
                                            disabled={isSubmitting}
                                            className="ms-3"
                                            aria-label={`Remove ${panel.name} panel`}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <div className="panels-footer d-flex flex-column align-items-start">
                                <small className="text-muted mb-2">
                                    {selectedPanels.length} panel{selectedPanels.length !== 1 ? 's' : ''} selected
                                </small>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    onClick={handleSubmit(handleFormSubmit)}
                                    disabled={isSubmitting}
                                    aria-label="Submit form"
                                    className="d-flex align-items-center"
                                >
                                    Submit
                                </Button>
                            </div>
                        </div>
                    </Col>
                )}
            </Row>
        </div>
    );
}