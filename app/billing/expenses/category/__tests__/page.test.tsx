import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // For extended matchers like .toBeInTheDocument()
import ExpenseCategoryPage from '../page'; // Adjust path as necessary

// Mock window.confirm
global.window.confirm = jest.fn();

// Mock next/dynamic for potential dynamic imports if any (though not explicit in component)
// jest.mock('next/dynamic', () => () => {
//   const DynamicComponent = () => null;
//   DynamicComponent.displayName = 'LoadableComponent';
//   DynamicComponent.preload = jest.fn();
//   return DynamicComponent;
// });

// Mock customFetch or other API calls if they were real
// jest.mock('../../../../components/Auth/customFetch', () => ({
//   customFetch: jest.fn(),
// }));

describe('ExpenseCategoryPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    (global.window.confirm as jest.Mock).mockClear();
    // If customFetch was mocked:
    // (customFetch as jest.Mock).mockClear();
  });

  test('renders the page correctly, including title, button, and table headers', async () => {
    render(<ExpenseCategoryPage />);

    expect(screen.getByText('Manage Expense Categories')).toBeInTheDocument();
    expect(screen.getByText('Add New Category')).toBeInTheDocument();

    // Wait for initial mock data to load (due to setTimeout in component)
    await waitFor(() => {
      expect(screen.getByText('Travel')).toBeInTheDocument(); // Check for one of the mock categories
    });

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument(); // Table header
    expect(screen.getByText('Description')).toBeInTheDocument(); // Table header
    expect(screen.getByText('Actions')).toBeInTheDocument(); // Table header
  });

  test('displays initial mocked categories in the table', async () => {
    render(<ExpenseCategoryPage />);
    await waitFor(() => {
      expect(screen.getByText('Travel')).toBeInTheDocument();
      expect(screen.getByText('Expenses related to business travel')).toBeInTheDocument();
      expect(screen.getByText('Office Supplies')).toBeInTheDocument();
      expect(screen.getByText('Pens, paper, and other office needs')).toBeInTheDocument();
    });
  });

  test('allows adding a new category', async () => {
    render(<ExpenseCategoryPage />);
    
    await waitFor(() => {
        expect(screen.getByText('Travel')).toBeInTheDocument(); 
    });

    fireEvent.click(screen.getByText('Add New Category'));

    // Check if modal is open (look for modal title or a form field)
    expect(screen.getByText('Add Expense Category')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'New Test Category' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'A brand new category for testing' } });

    fireEvent.click(screen.getByRole('button', { name: 'Add Category' }));

    await waitFor(() => {
      expect(screen.getByText('New Test Category')).toBeInTheDocument();
      expect(screen.getByText('A brand new category for testing')).toBeInTheDocument();
    });
    // Check if modal is closed
    expect(screen.queryByText('Add Expense Category')).not.toBeInTheDocument();
  });

  test('allows editing an existing category', async () => {
    render(<ExpenseCategoryPage />);
    
    // Wait for initial categories to load
    await waitFor(() => {
      expect(screen.getByText('Travel')).toBeInTheDocument();
    });

    // Find the row for "Travel" and click its Edit button
    // This assumes "Edit" buttons have a title or accessible name
    const travelRow = screen.getByText('Travel').closest('tr');
    if (!travelRow) throw new Error('Travel row not found');
    const editButton = Array.from(travelRow.querySelectorAll('button')).find(btn => btn.title === 'Edit' || btn.textContent?.includes('Edit'));
    if (!editButton) throw new Error('Edit button for Travel not found');
    
    fireEvent.click(editButton);

    // Check if modal is open and pre-filled
    expect(screen.getByText('Edit Expense Category')).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toHaveValue('Travel');
    expect(screen.getByLabelText(/Description/i)).toHaveValue('Expenses related to business travel');

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Travel Updated' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Updated travel expenses' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(screen.getByText('Travel Updated')).toBeInTheDocument();
      expect(screen.getByText('Updated travel expenses')).toBeInTheDocument();
    });
    expect(screen.queryByText('Travel')).not.toBeInTheDocument(); // Old name should be gone
     // Check if modal is closed
    expect(screen.queryByText('Edit Expense Category')).not.toBeInTheDocument();
  });

  test('allows deleting a category', async () => {
    (global.window.confirm as jest.Mock).mockReturnValue(true); // Mock confirm to return true
    render(<ExpenseCategoryPage />);

    // Wait for initial categories to load
    await waitFor(() => {
      expect(screen.getByText('Office Supplies')).toBeInTheDocument();
    });
    
    const officeSuppliesRow = screen.getByText('Office Supplies').closest('tr');
    if (!officeSuppliesRow) throw new Error('Office Supplies row not found');

    const deleteButton = Array.from(officeSuppliesRow.querySelectorAll('button')).find(btn => btn.title === 'Delete' || btn.textContent?.includes('Delete'));
    if (!deleteButton) throw new Error('Delete button for Office Supplies not found');

    fireEvent.click(deleteButton);

    expect(global.window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this category?');

    await waitFor(() => {
      expect(screen.queryByText('Office Supplies')).not.toBeInTheDocument();
      expect(screen.queryByText('Pens, paper, and other office needs')).not.toBeInTheDocument();
    });
  });

  test('shows validation error if name is empty when adding', async () => {
    render(<ExpenseCategoryPage />);
    await waitFor(() => { expect(screen.getByText('Travel')).toBeInTheDocument(); });

    fireEvent.click(screen.getByText('Add New Category'));
    expect(screen.getByText('Add Expense Category')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Add Category' }));

    // Error message should appear, and category should not be added
    expect(await screen.findByText('Category name is required.')).toBeInTheDocument();
    expect(screen.queryByText('Add Expense Category')).toBeInTheDocument(); // Modal should stay open

    // Close modal manually to avoid state leakage if any
    fireEvent.click(screen.getByRole('button', { name: 'Close' })); 
  });


  test('modal closes when "Close" button is clicked', async () => {
    render(<ExpenseCategoryPage />);
    await waitFor(() => { expect(screen.getByText('Travel')).toBeInTheDocument(); });

    fireEvent.click(screen.getByText('Add New Category'));
    expect(screen.getByText('Add Expense Category')).toBeInTheDocument(); // Modal is open

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Add Expense Category')).not.toBeInTheDocument(); // Modal is closed
  });

});
