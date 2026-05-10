import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, Button, FormControl, FormGroup, FormLabel, Container, Spinner, Alert } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import Select from 'react-select';
import { customFetch, customPost, reactSelectCustomStyles } from '../../Auth/customFetch';
import { toast } from 'react-toastify';

const schema = z.object({
    billing_strategy_id: z.number().int().positive({ message: 'Please select a billing strategy' }),
    entity_type: z.enum(['organization', 'insurance', 'clinician', 'general']),
    track_id: z.number().int().positive().optional().nullable(),
    applies_from: z.string().min(1, 'Effective date is required'),
    applies_to: z.string().optional().nullable(),
}).refine(data => {
    if (data.applies_to && data.applies_from) {
        return new Date(data.applies_to) > new Date(data.applies_from);
    }
    return true;
}, {
    message: '"Applies To" date must be after "Applies From" date',
    path: ['applies_to'],
});

type FormData = z.infer<typeof schema>;

interface BillingStrategy {
    id: number;
    name: string;
    description: string;
    is_discount: number;
    applies_to_all_tests: number;
    priority: number;
}

interface BillingStrategyAssignmentFormProps {
    trackId: number;
    billing_strategy_id: number | null | undefined;
    entity_type: 'insurance' | 'organization' | 'clinician' | 'general';
    onSuccess?: () => void;
}

interface StrategyOption {
    value: number;
    label: string;
    strategy: BillingStrategy;
}

export default function BillingStrategyAssignmentForm({ trackId, entity_type }: BillingStrategyAssignmentFormProps) {
    const [strategies, setStrategies] = useState<BillingStrategy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedStrategy, setSelectedStrategy] = useState<BillingStrategy | null>(null);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        setValue,
        watch
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            billing_strategy_id: 0,
            entity_type: entity_type,
            track_id: trackId,
            applies_from: '',
            applies_to: '',
        },
    });

    const selectedStrategyId = watch('billing_strategy_id');

    async function fetchStrategies() {
        setLoading(true);
        setError(null);
        try {
            const response = await customFetch('billing/strategy/advanced/strategies/all');
            if (response && Array.isArray(response)) {
                setStrategies(response);
            } else {
                toast.error('Failed to load strategies or none are available.')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            toast.error(err?.message || err?.error)
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchStrategies();
    }, []);

    useEffect(() => {
        const strategy = strategies.find(s => s.id === selectedStrategyId);
        setSelectedStrategy(strategy || null);
    }, [selectedStrategyId, strategies]);

    const strategyOptions: StrategyOption[] = strategies.map(strategy => ({
        value: strategy.id,
        label: strategy.name,
        strategy: strategy
    }));

    const formatOptionLabel = ({ label, strategy }: StrategyOption) => (
        <div className="d-flex justify-content-between align-items-center">
            <span>{label}</span>
            <div className="d-flex align-items-center">
                <span className={`badge me-2 ${strategy.is_discount ? 'bg-success-subtle text-success-emphasis' : 'bg-warning-subtle text-warning-emphasis'}`}>
                    {strategy.is_discount ? "Discount" : "Surcharge"}
                </span>
                <span className="badge bg-secondary-subtle text-secondary-emphasis">P: {strategy.priority}</span>
            </div>
        </div>
    );

    const handleFormSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await customPost(`billing/strategy/advanced/assignments`, 'POST', data);
            const { status, message, error } = response;
            if (status === 201) {
                setIsSubmitting(false);
                toast.success(message)
            } else {
                toast.error(message || error);
            }
        } catch (err) {
            console.log('RRR', err)
            toast.error(err?.error)
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (error && !strategies.length) {
        return (
            <Alert variant="danger">
                <Alert.Heading>Error Loading Data</Alert.Heading>
                <p>{error}</p>
                <Button variant="outline-danger" onClick={fetchStrategies}>Retry</Button>
            </Alert>
        );
    }

    return (
        <Container fluid="lg" className="p-0">
            <Form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="d-flex flex-column gap-4">
                <h4 className="mb-0">Assign New Billing Strategy</h4>

                {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

                <FormGroup>
                    <FormLabel htmlFor="billing_strategy_id">Billing Strategy</FormLabel>
                    <Controller
                        name="billing_strategy_id"
                        control={control}
                        render={({ field }) => (
                            <Select
                                inputId="billing_strategy_id"
                                {...field}
                                styles={reactSelectCustomStyles}
                                options={strategyOptions}
                                formatOptionLabel={formatOptionLabel}
                                onChange={(option) => field.onChange(option?.value || null)}
                                value={strategyOptions.find(o => o.value === field.value) || null}
                                placeholder="Select a billing module ."
                                noOptionsMessage={() => "No strategies found"}
                            />
                        )}
                    />
                    {errors.billing_strategy_id && <Form.Text className="text-danger">{errors.billing_strategy_id.message}</Form.Text>}
                </FormGroup>

                {selectedStrategy && (
                    <div className="border rounded p-3 text-sm alert alert-info br-5">
                        <h6 className="fw-bold">Strategy Details</h6>
                        <p className="mb-1"><strong>Description:</strong> {selectedStrategy.description || 'N/A'}</p>
                        <p className="mb-0"><strong>Applies to all tests:</strong> {selectedStrategy.applies_to_all_tests ? 'Yes' : 'No'}</p>
                    </div>
                )}

                <FormGroup>
                    <FormLabel htmlFor="applies_from">Effective From</FormLabel>
                    <FormControl id="applies_from" type="date" {...register('applies_from')} isInvalid={!!errors.applies_from} />
                    <FormControl.Feedback type="invalid">{errors.applies_from?.message}</FormControl.Feedback>
                </FormGroup>

                <FormGroup>
                    <FormLabel htmlFor="applies_to">Effective Until (Optional)</FormLabel>
                    <FormControl id="applies_to" type="date" {...register('applies_to')} isInvalid={!!errors.applies_to} />
                    <FormControl.Feedback type="invalid">{errors.applies_to?.message}</FormControl.Feedback>
                </FormGroup>

                <div className="text-end mt-2">
                    <Button type="submit" variant="primary" disabled={isSubmitting || !selectedStrategyId}>
                        {isSubmitting ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                <span className="ms-2">Saving...</span>
                            </>
                        ) : 'Save Assignment'}
                    </Button>
                </div>
            </Form>
        </Container>
    );
}