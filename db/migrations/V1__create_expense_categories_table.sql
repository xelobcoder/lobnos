-- This script creates the expense_categories table.
-- This table stores information about different categories of expenses.

CREATE TABLE expense_categories (
    -- id: Primary Key, Auto-incrementing Integer.
    id SERIAL PRIMARY KEY,

    -- name: Varchar (255), Not Null, Unique.
    -- Represents the name of the expense category.
    name VARCHAR(255) NOT NULL UNIQUE,

    -- description: Text, Nullable.
    -- Provides a more detailed description of the expense category.
    description TEXT,

    -- created_at: Timestamp, Default to current timestamp.
    -- Timestamp indicating when the expense category was created.
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- updated_at: Timestamp, Default to current timestamp, Updates on row modification.
    -- Timestamp indicating when the expense category was last updated.
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to automatically update updated_at on row modification.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_expense_categories_updated_at
BEFORE UPDATE ON expense_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comment on the table
COMMENT ON TABLE expense_categories IS 'Stores different categories of expenses, like "Office Supplies", "Travel", "Software Subscriptions", etc.';

-- Comments on columns
COMMENT ON COLUMN expense_categories.id IS 'Unique identifier for the expense category.';
COMMENT ON COLUMN expense_categories.name IS 'Name of the expense category (e.g., "Office Supplies").';
COMMENT ON COLUMN expense_categories.description IS 'Optional detailed description of the expense category.';
COMMENT ON COLUMN expense_categories.created_at IS 'Timestamp of when the category was created.';
COMMENT ON COLUMN expense_categories.updated_at IS 'Timestamp of when the category was last updated.';
