import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddNewExpense from '../page'; // Adjust path as necessary
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import { customPost, customFetch } from '../../../../components/Auth/customFetch';

// Mock external dependencies
jest.mock('../../../../components/Auth/useApplicationContext', () => ({
  useApplicationSettings: jest.fn(),
}));

jest.mock('../../../../components/Auth/customFetch', () => ({
  customFetch: jest.fn(),
  customPost: jest.fn(),
  reactSelectCustomStyles: {} // Mock if it's just styles
}));

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => ({ get: jest.fn() })),
  useRouter: jest.fn(() => ({ push: jest.fn() })), // Mock useRouter if used for navigation
}));

jest.mock('react-toastify', () => ({
  ToastContainer: () => null, // Mock ToastContainer component
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Default mock implementations
const mockUseApplicationSettings = useApplicationSettings as jest.Mock;
const mockCustomFetch = customFetch as jest.Mock;
const mockCustomPost = customPost as jest.Mock;

describe('AddNewExpense Page - Category Field', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockUseApplicationSettings.mockReturnValue({
      applicationsettings: {
        user: { employeeid: 'emp123', username: 'testuser' },
        branchid: 'branch01',
      },
    });

    mockCustomFetch.mockImplementation((url) => {
      if (url === 'expense/get/category') { // For the legacy category name dropdown
        return Promise.resolve([
          { categoryid: 101, category: 'Legacy Category A' },
          { categoryid: 102, category: 'Legacy Category B' },
        ]);
      }
      if (url === 'paymentmodes') {
        return Promise.resolve({
          data: [
            { KeyID: 'mode1', PaymentMode: 'Cash' },
            { KeyID: 'mode2', PaymentMode: 'Credit Card' },
          ],
        });
      }
      return Promise.resolve([]);
    });

    mockCustomPost.mockResolvedValue({ status: true, data: { id: 'exp789' } });
  });

  test('renders the "Expense Category" dropdown with mocked options', async () => {
    render(<AddNewExpense />);

    // Wait for async operations like fetching payment modes and legacy categories
    await waitFor(() => {
      // Check for one of the mocked expense categories (from the component's internal mock data)
      // The Select component uses react-select, so options are not directly in the DOM until opened.
      // We'll check for the label first.
      expect(screen.getByText('Expense Category')).toBeInTheDocument();
    });
    
    // To check options, we need to "open" the react-select dropdown
    // This can be tricky as react-select renders options in a portal by default.
    // A simpler check might be to ensure the component doesn't crash and the label is there.
    // For deeper testing of react-select, specific helpers might be needed.
    // For now, we assume the mocked `expenseCategories` in the component populates it.
    // The mocked categories are: Travel (1), Meals & Entertainment (2), Software & Subscriptions (3), Office Supplies (4)
    
    // Let's try to open it and check for an option
    const categorySelectControl = screen.getByText('Expense Category').parentElement?.querySelector('.react-select__control');
    if (categorySelectControl) {
      fireEvent.mouseDown(categorySelectControl);
      await waitFor(() => {
        expect(screen.getByText('Travel')).toBeInTheDocument();
        expect(screen.getByText('Office Supplies')).toBeInTheDocument();
      });
    } else {
      throw new Error('Category select control not found');
    }
  });

  test('includes category_id in form submission data when a category is selected', async () => {
    render(<AddNewExpense />);

    // Wait for dependent data like payment modes
    await waitFor(() => {
        expect(screen.getByText('Payment Method')).toBeInTheDocument();
    });

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/Expense Name/i), { target: { value: 'Test Expense Item' } });
    fireEvent.change(screen.getByLabelText(/Expense Date/i), { target: { value: '2023-10-01T10:00' } });
    fireEvent.change(screen.getByLabelText(/Merchant/i), { target: { value: 'Test Merchant' } });
    // Amount field might be complex due to input group, target the input directly
    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '150.00' } });
    
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Detailed description of the expense.' } });

    // Select Payment Method (react-select)
    const paymentMethodSelectControl = screen.getByText('Payment Method').parentElement?.querySelector('.react-select__control');
    if (!paymentMethodSelectControl) throw new Error('Payment method select control not found');
    fireEvent.mouseDown(paymentMethodSelectControl);
    await waitFor(() => screen.getByText('Cash'));
    fireEvent.click(screen.getByText('Cash'));
    
    // Select Expense Category (react-select) - "Software & Subscriptions" (ID 3)
    const categorySelectControl = screen.getByText('Expense Category').parentElement?.querySelector('.react-select__control');
    if (!categorySelectControl) throw new Error('Category select control not found');
    fireEvent.mouseDown(categorySelectControl);
    await waitFor(() => screen.getByText('Software & Subscriptions'));
    fireEvent.click(screen.getByText('Software & Subscriptions'));

    // Select Legacy Category Name (react-select)
    const legacyCategorySelectControl = screen.getByText('Category Name (Legacy)').parentElement?.querySelector('.react-select__control');
    if (!legacyCategorySelectControl) throw new Error('Legacy category select control not found');
    fireEvent.mouseDown(legacyCategorySelectControl);
    await waitFor(() => screen.getByText('Legacy Category A'));
    fireEvent.click(screen.getByText('Legacy Category A'));


    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Submit Expense Request/i }));
    });
    
    await waitFor(() => {
      expect(mockCustomPost).toHaveBeenCalled();
    });

    expect(mockCustomPost).toHaveBeenCalledWith(
      'expenses', // endpoint
      'POST',     // method
      expect.objectContaining({
        name: 'Test Expense Item',
        date: '2023-10-01T10:00',
        merchant: 'Test Merchant',
        amount: '150.00',
        description: 'Detailed description of the expense.',
        mode: 'mode1', // Value for 'Cash'
        category_id: 3, // ID for "Software & Subscriptions"
        category_name: 'Legacy Category A', // Label for legacy category
        branchid: 'branch01',
        employeeid: 'emp123',
      })
    );
  });

  test('shows validation error if "Expense Category" is not selected', async () => {
    render(<AddNewExpense />);

    await waitFor(() => {
      expect(screen.getByText('Payment Method')).toBeInTheDocument();
    });

    // Fill in other required fields
    fireEvent.change(screen.getByLabelText(/Expense Name/i), { target: { value: 'Test Expense Item' } });
    fireEvent.change(screen.getByLabelText(/Expense Date/i), { target: { value: '2023-10-01T10:00' } });
    fireEvent.change(screen.getByLabelText(/Merchant/i), { target: { value: 'Test Merchant' } });
    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '150.00' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Detailed description.' } });

    // Select Payment Method
    const paymentMethodSelectControl = screen.getByText('Payment Method').parentElement?.querySelector('.react-select__control');
    if (!paymentMethodSelectControl) throw new Error('Payment method select control not found');
    fireEvent.mouseDown(paymentMethodSelectControl);
    await waitFor(() => screen.getByText('Cash'));
    fireEvent.click(screen.getByText('Cash'));

    // Select Legacy Category Name
    const legacyCategorySelectControl = screen.getByText('Category Name (Legacy)').parentElement?.querySelector('.react-select__control');
    if (!legacyCategorySelectControl) throw new Error('Legacy category select control not found');
    fireEvent.mouseDown(legacyCategorySelectControl);
    await waitFor(() => screen.getByText('Legacy Category A'));
    fireEvent.click(screen.getByText('Legacy Category A'));

    // Do NOT select "Expense Category"

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Submit Expense Request/i }));
    });
    
    // Check for validation error message for category_id
    // The Zod schema message is "Expense Category is required"
    // This message appears next to the react-select component.
    // The specific way it's rendered might make it hard to get by text directly if not linked via aria-describedby
    // We'll look for the text.
    await waitFor(() => {
      expect(screen.getByText('Expense Category is required')).toBeInTheDocument();
    });
    
    expect(mockCustomPost).not.toHaveBeenCalled();
  });
});
