import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, Button, FormControl, FormGroup, FormLabel, FormCheck, Row, Col, Spinner, Container } from 'react-bootstrap';
import { BillingStrategy } from './BillingStrategyTypes';
import { RiSave3Line } from '@remixicon/react';
import { useState } from 'react';
import styles from '../../../styles/SmsTemplateList.module.css';

const schema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    description: z.string().optional(),
    is_discount: z.boolean().default(true),
    applies_to_all_tests: z.boolean().default(true),
    apply_time_based: z.boolean().default(false),
    priority: z.number({
        required_error: 'Priority is required',
        invalid_type_error: 'Priority must be a number'
    }).int().min(0, 'Priority must be a non-negative number').default(0),
});

type FormData = z.infer<typeof schema>;

interface BillingStrategyFormProps {
    defaultValues?: BillingStrategy;
    onSubmit: (data: FormData) => Promise<void>;
    isEditing?: boolean;
}

export default function BillingStrategyForm({ defaultValues, onSubmit, isEditing = false }: BillingStrategyFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: defaultValues ? {
            ...defaultValues,
            priority: Number(defaultValues.priority),
            is_discount: Boolean(defaultValues.is_discount),
            applies_to_all_tests: Boolean(defaultValues.applies_to_all_tests),
            apply_time_based: Boolean(defaultValues.apply_time_based),
        } : {
            is_discount: true,
            applies_to_all_tests: true,
            apply_time_based: false,
            priority: 0,
        },
    });

    const handleFormSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            await onSubmit(data);
        } catch (error) {
            console.error("Submission failed", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container >
            <Form onSubmit={handleSubmit(handleFormSubmit)} className="form-container shadow-none">
                <div className="form-header">
                    <h2 className="fw-bold">{isEditing ? 'Edit Strategy' : 'Create New Strategy'}</h2>
                    <p className="text-muted">Fill out the details below to configure the billing strategy.</p>
                </div>
                <Row className="g-4">
                    <Col md={8}>
                        <FormGroup>
                            <FormLabel htmlFor="name">Strategy Name</FormLabel>
                            <FormControl
                                id="name"
                                placeholder="e.g., 'Summer Discount'"
                                {...register('name')}
                                isInvalid={!!errors.name}
                                size="lg"
                            />
                            <FormControl.Feedback type="invalid">{errors.name?.message}</FormControl.Feedback>
                        </FormGroup>
                    </Col>
                    <Col md={4}>
                        <FormGroup>
                            <FormLabel htmlFor="priority">Execution Priority</FormLabel>
                            <FormControl
                                id="priority"
                                type="number"
                                {...register('priority', { valueAsNumber: true })}
                                isInvalid={!!errors.priority}
                                size="lg"
                            />
                            <FormControl.Feedback type="invalid">{errors.priority?.message}</FormControl.Feedback>
                        </FormGroup>
                    </Col>
                    <Col xs={12}>
                        <FormGroup>
                            <FormLabel htmlFor="description">Description</FormLabel>
                            <FormControl
                                id="description"
                                as="textarea"
                                rows={3}
                                placeholder="A brief explanation of what this strategy does..."
                                {...register('description')}
                                isInvalid={!!errors.description}
                            />
                            <FormControl.Feedback type="invalid">{errors.description?.message}</FormControl.Feedback>
                        </FormGroup>
                    </Col>
                    <Col xs={12}>
                        <div className="toggles-container p-3 rounded">
                            <FormGroup className="d-flex justify-content-between align-items-center">
                                <div>
                                    <FormLabel className="mb-0 fw-medium" htmlFor="is_discount">Discount Strategy</FormLabel>
                                    <p className="text-muted small mb-0">Enable if this strategy applies a discount.</p>
                                </div>
                                <FormCheck
                                    type="switch"
                                    id="is_discount"
                                    {...register('is_discount')}
                                />
                            </FormGroup>
                            <hr className="my-3" />
                            <FormGroup className="d-flex justify-content-between align-items-center">
                                <div>
                                    <FormLabel className="mb-0 fw-medium" htmlFor="applies_to_all_tests">Apply to All Tests</FormLabel>
                                    <p className="text-muted small mb-0">If disabled, specify applicable tests separately.</p>
                                </div>
                                <FormCheck
                                    type="switch"
                                    id="applies_to_all_tests"
                                    {...register('applies_to_all_tests')}
                                />
                            </FormGroup>
                            <hr className="my-3" />
                            <FormGroup className="d-flex justify-content-between align-items-center">
                                <div>
                                    <FormLabel className="mb-0 fw-medium" htmlFor="apply_time_based">Enable Time-Based Pricing</FormLabel>
                                    <p className="text-muted small mb-0">Enable time-based pricing conditions for this strategy.</p>
                                </div>
                                <FormCheck
                                    type="switch"
                                    id="apply_time_based"
                                    {...register('apply_time_based')}
                                />
                            </FormGroup>
                        </div>
                    </Col>
                </Row>
                <div className="form-footer mt-5">
                    <Button type="submit" variant="primary"  className="w-100 d-flex align-items-center justify-content-center" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                <span className="ms-2">Saving...</span>
                            </>
                        ) : (
                            <>
                                <RiSave3Line size={20} className="me-2" />
                                {isEditing ? 'Save Changes' : 'Create Strategy'}
                            </>
                        )}
                    </Button>
                </div>
            </Form>

            <style jsx global>{`
                .form-container {
                    background-color: #fff;
                    padding: 2rem;
                    border-radius: 1rem;
                    box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05);
                    border: 1px solid #e9ecef;
                }
                .form-header {
                    margin-bottom: 2rem;
                    text-align: center;
                }
                .form-control, .form-select {
                    border-radius: 0.5rem;
                    border: 1px solid #dee2e6;
                    padding-top: 0.75rem;
                    padding-bottom: 0.75rem;
                    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
                }
                .form-control:focus, .form-select:focus {
                    border-color: #80bdff;
                    box-shadow: 0 0 0 0.25rem rgba(0, 123, 255, 0.25);
                }
                .form-control.is-invalid {
                    background-position: right calc(0.375em + 0.1875rem) center;
                }
                .form-label {
                    font-weight: 500;
                    color: #495057;
                }
                .toggles-container {
                    background-color: #f8f9fa;s
                    border: 1px solid #e9ecef;
                }
                .form-check-input {
                    width: 2.5em;
                    height: 1.25em;
                }
                .form-check.form-switch {
                  padding-left: 3.5em;
                }
                .form-check-input:checked {
                    background-color: #0d6efd;
                    border-color: #0d6efd;
                }
            `}</style>
        </Container>
    );
}