# Payment Modal Workflow

## Purpose
The Payment Modal is designed to handle all medical billing payment flows in a robust, user-friendly, and correction-aware manner. It supports:
- **Pay All**: Pay the full (or correctional) amount in one go.
- **Pay Per Test/Service**: Pay for each test/service individually, with per-item payment modes and amounts.
- **Select Tests to Pay**: Allocate a specific amount across selected tests/services, with auto-allocation and manual overrides.
- **Correction/Adjustment Mode**: When a correction or adjustment is required, the modal targets the difference between the new payable and previously paid amounts, ensuring all calculations, limits, and summaries reflect this correctional difference.

## Key Features
- **Dynamic Modes**: Users can switch between Pay All, Pay Per Test, and Select Tests to Pay, with the UI and logic adapting accordingly.
- **Correctional Logic**: In adjustment/correction mode, all payment calculations, input limits, and summaries use the correctional difference as the target.
- **Per-Item State**: Each test/service tracks its own payment status, amount, and mode, and the global billing state is updated accordingly.
- **Persistent and Accurate Summaries**: The payment summary always reflects the current state, including total paid, outstanding, and excess, in both normal and correctional modes.
- **Input Validation**: All input fields enforce max values and correct formats, preventing overpayment or invalid entries.
- **Reset and Flexibility**: Users can reset the modal to its initial state at any time, clearing all payment entries and selections.
- **Auto-Open Trigger**: The modal can be programmatically triggered to open (e.g., via `openPaymentModal` in billing data) for workflow integration.

## Workflow Goals
- Ensure all payment flows are robust, accurate, and user-friendly.
- Guarantee that all calculations and UI elements reflect the correct payment target, especially in correction/adjustment scenarios.
- Provide a seamless experience for both full and partial payments, with clear feedback and error prevention.
- Support integration with the broader billing workflow, including programmatic modal opening and state synchronization.

---
For further details, see the implementation in `PaymentModal.tsx` and related billing components.
