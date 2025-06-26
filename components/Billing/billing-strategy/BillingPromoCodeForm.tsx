import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, Button, FormControl, FormGroup, FormLabel, FormSelect, FormCheck } from 'react-bootstrap';
import { BillingPromoCode } from './BillingStrategyTypes';

const schema = z.object({
    code: z.string().min(1, 'Code is required').max(100, 'Code too long'),
    description: z.string().optional(),
    campaign_id: z.number().int().positive().optional(),
    discount_type: z.enum(['percentage', 'flat'], { message: 'Invalid discount type' }),
    discount_value: z.number().min(0, 'Discount value must be non-negative'),
    max_uses: z.number().int().positive().optional(),
    is_active: z.boolean().default(true),
    valid_from: z.date({ required_error: 'Valid from date is required' }),
    valid_to: z.date().optional(),
}).refine(data => !data.valid_to || data.valid_to > data.valid_from, {
    message: 'Valid to date must be after valid from',
    path: ['valid_to'],
});

type FormData = z.infer<typeof schema>;

interface BillingPromoCodeFormProps {
    defaultValues?: BillingPromoCode;
    onSubmit: (data: FormData) => Promise<void>;
}

export default function BillingPromoCodeForm({ defaultValues, onSubmit }: BillingPromoCodeFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            ...defaultValues,
            valid_from: defaultValues?.valid_from ? new Date(defaultValues.valid_from) : undefined,
            valid_to: defaultValues?.valid_to ? new Date(defaultValues.valid_to) : undefined,
        },
    });

    return (
        <Form onSubmit={handleSubmit(onSubmit)} className="p-4 bg-white shadow rounded">
            <FormGroup className="mb-3">
                <FormLabel>Code</FormLabel>
                <FormControl
                    {...register('code')}
                    isInvalid={!!errors.code}
                />
                <FormControl.Feedback type="invalid">{errors.code?.message}</FormControl.Feedback>
            </FormGroup>
            <FormGroup className="mb-3">
                <FormLabel>Description</FormLabel>
                <FormControl
                    as="textarea"
                    {...register('description')}
                    isInvalid={!!errors.description}
                />
                <FormControl.Feedback type="invalid">{errors.description?.message}</FormControl.Feedback>
            </FormGroup>
            <FormGroup className="mb-3">
                <FormLabel>Campaign ID (Optional)</FormLabel>
                <FormControl
                    type="number"
                    {...register('campaign_id', { valueAsNumber: true })}
                    isInvalid={!!errors.campaign_id}
                />
                <FormControl.Feedback type="invalid">{errors.campaign_id?.message}</FormControl.Feedback>
            </FormGroup>
            <FormGroup className="mb-3">
                <FormLabel>Discount Type</FormLabel>
                <FormSelect
                    {...register('discount_type')}
                    isInvalid={!!errors.discount_type}
                >
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat</option>
                </FormSelect>
                <FormControl.Feedback type="invalid">{errors.discount_type?.message}</FormControl.Feedback>
            </FormGroup>
            <FormGroup className="mb-3">
                <FormLabel>Discount Value</FormLabel>
                <FormControl
                    type="number"
                    step="0.01"
                    {...register('discount_value', { valueAsNumber: true })}
                    isInvalid={!!errors.discount_value}
                />
                <FormControl.Feedback type="invalid">{errors.discount_value?.message}</FormControl.Feedback>
            </FormGroup>
            <FormGroup className="mb-3">
                <FormLabel>Max Uses (Optional)</FormLabel>
                <FormControl
                    type="number"
                    {...register('max_uses', { valueAsNumber: true })}
                    isInvalid={!!errors.max_uses}
                />
                <FormControl.Feedback type="invalid">{errors.max_uses?.message}</FormControl.Feedback>
            </FormGroup>
            <FormGroup className="mb-3">
                <FormCheck
                    type="checkbox"
                    label="Is Active"
                    {...register('is_active')}
                />
            </FormGroup>
            <FormGroup className="mb-3">
                <FormLabel>Valid From</FormLabel>
                <FormControl
                    type="datetime-local"
                    {...register('valid_from', { valueAsDate: true })}
                    isInvalid={!!errors.valid_from}
                />
                <FormControl.Feedback type="invalid">{errors.valid_from?.message}</FormControl.Feedback>
            </FormGroup>
            <FormGroup className="mb-3">
                <FormLabel>Valid To (Optional)</FormLabel>
                <FormControl
                    type="datetime-local"
                    {...register('valid_to', { valueAsDate: true })}
                    isInvalid={!!errors.valid_to}
                />
                <FormControl.Feedback type="invalid">{errors.valid_to?.message}</FormControl.Feedback>
            </FormGroup>
            <Button type="submit" variant="primary" className="w-100">
                Submit
            </Button>
        </Form>
    );
}