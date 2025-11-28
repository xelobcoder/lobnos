# Code Examples & Implementation Reference

## Complete Feature Implementation

### File: `/app/doctor/ascension/ascension-status/page.tsx`

---

## 1. Imports (Line 3)

```typescript
import { Modal, Button, Form } from 'react-bootstrap'
```

**Added:** `Form` component for the notes textarea

---

## 2. Critical Value Detection Function (Lines 108-116)

```typescript
// Function to detect critical values (exceeds 1.5x limit or below 0.5x limit)
const isCriticalValue = (item: TestResultItem): boolean => {
     if (item.plan !== 'limits') return false;
     const val = parseFloat(item.value);
     const min = parseFloat(item.lowerlimit);
     const max = parseFloat(item.upperlimit);
     if (isNaN(val) || isNaN(min) || isNaN(max)) return false;
     // Critical if value exceeds 1.5x upper limit or below 0.5x lower limit
     return val > (max * 1.5) || val < (min * 0.5);
};
```

**Purpose:** Determines if a test result value is critically abnormal
**Returns:** Boolean - true if critical, false otherwise
**Logic:**
- Only works for "limits" plan tests
- Parses numeric values
- Checks if value exceeds 150% of upper limit OR falls below 50% of lower limit

---

## 3. State Variables (Lines 89-92)

```typescript
const [notes, setNotes] = useState<{ [key: string]: string }>({});
const [showNotesModal, setShowNotesModal] = useState<boolean>(false);
const [selectedNoteItem, setSelectedNoteItem] = useState<TestResultItem | null>(null);
```

**Purpose:**
- `notes`: Object storing notes keyed by test parameter ID
- `showNotesModal`: Controls visibility of notes modal dialog
- `selectedNoteItem`: Tracks which parameter's notes are being edited

---

## 4. Flag Column Rendering (Lines 468-475)

```typescript
<td className="py-2 text-center">
     {isCriticalValue(item) ? (
          <span title="Critical Value" style={{ fontSize: '1.2rem', cursor: 'help' }}>⚠️</span>
     ) : shouldHighlight ? (
          <span>🚩</span>
     ) : (
          <span>✓</span>
     )}
</td>
```

**Rendering Logic:**
1. If critical → Show ⚠️ with tooltip
2. Else if abnormal → Show 🚩
3. Else → Show ✓

**CSS Classes:** `py-2 text-center` for padding and centering

---

## 5. Value/Units Cell - Prominent Display (Lines 483-500)

```typescript
<td className="py-2">
     <div>
          <span className={`fw-bold ${shouldHighlight ? 'text-danger' : 'text-dark'}`}>
               {item.value}
          </span>
          {' '}
          <span className="fw-bold text-muted" style={{ fontSize: '0.9em', letterSpacing: '0.5px' }}>
               {item.units}
          </span>
     </div>
     {item.plan === "limits" && (
          <small className="text-muted d-block" style={{ marginTop: '0.25rem' }}>
               Ref: {item.lowerlimit}-{item.upperlimit}
          </small>
     )}
     {comparisonStatus && (
          <span className="badge ms-0 mt-1" style={{ backgroundColor: comparisonStatus.color, fontSize: '0.7rem' }}>
               {comparisonStatus.label}
          </span>
     )}
</td>
```

**Features:**
1. **Prominent Units:**
   - Bold font weight: `fw-bold`
   - Muted gray color: `text-muted`
   - Extra letter spacing: `letterSpacing: '0.5px'`
   - Slightly smaller font: `fontSize: '0.9em'`

2. **Inline Reference Range:**
   - Shows only for `limits` plan
   - Format: "Ref: [min]-[max]"
   - Muted gray color: `text-muted`
   - Small font with margin top for separation

3. **Status Badge:**
   - Shows HIGHER/LOWER/NORMAL/EQUAL
   - Color from `comparisonStatus.color`
   - Margin top for spacing

---

## 6. Action Column - Notes Button (Lines 503-527)

```typescript
<td className="py-2 text-center">
     <div className="d-flex gap-2 justify-content-center flex-wrap">
          <Button
               size="sm"
               variant="outline-primary"
               disabled={!trendData}
               onClick={() => {
                    setSelectedTrendField(item.name);
                    setShowTrendChart(true);
               }}
          >
               Show Trend
          </Button>
          {shouldHighlight && (
               <Button
                    size="sm"
                    variant="outline-warning"
                    onClick={() => {
                         setSelectedNoteItem(item);
                         setShowNotesModal(true);
                    }}
                    title="Add interpretation/notes"
               >
                    📝 Notes
               </Button>
          )}
     </div>
</td>
```

**Key Points:**
1. **Flexbox Layout:**
   - `d-flex gap-2` for horizontal alignment with spacing
   - `justify-content-center` to center buttons
   - `flex-wrap` to wrap on small screens

2. **Show Trend Button:**
   - Disabled when trend data not loaded
   - Primary outline variant
   - Always visible

3. **Notes Button:**
   - **Only shows if result is abnormal** (`{shouldHighlight &&...}`)
   - Warning variant (orange styling)
   - Sets state to open notes modal
   - Includes helpful tooltip

---

## 7. Interpretation/Notes Modal (Lines 669-720)

```typescript
{/* Interpretation/Notes Modal */}
<Modal show={showNotesModal} onHide={() => {
     setShowNotesModal(false);
     setSelectedNoteItem(null);
}} centered>
     <Modal.Header closeButton className="border-bottom">
          <Modal.Title className="fw-bold">
               📝 Interpretation/Notes
          </Modal.Title>
     </Modal.Header>
     <Modal.Body>
          {selectedNoteItem && (
               <div>
                    <div className="mb-3">
                         <small className="text-muted">Test Parameter</small>
                         <div className="fw-bold text-dark">{selectedNoteItem.name}</div>
                         <div className="small text-muted mt-1">
                              Value: <span className="text-danger fw-bold">{selectedNoteItem.value} {selectedNoteItem.units}</span>
                         </div>
                    </div>
                    <div>
                         <label className="form-label fw-semibold">Clinical Interpretation:</label>
                         <Form.Control
                              as="textarea"
                              rows={4}
                              placeholder="Enter clinical interpretation, notes, or abnormal findings for this result..."
                              value={notes[selectedNoteItem.id] || ''}
                              onChange={(e) => {
                                   setNotes({
                                        ...notes,
                                        [selectedNoteItem.id]: e.target.value
                                   });
                              }}
                              className="border-1"
                         />
                         <small className="text-muted d-block mt-2">
                              {notes[selectedNoteItem.id] ? `${notes[selectedNoteItem.id].length} characters` : 'No notes yet'}
                         </small>
                    </div>
               </div>
          )}
     </Modal.Body>
     <Modal.Footer className="border-top">
          <Button
               size="sm"
               variant="outline-secondary"
               onClick={() => {
                    setShowNotesModal(false);
                    setSelectedNoteItem(null);
               }}
          >
               Close
          </Button>
          <Button
               size="sm"
               variant="primary"
               onClick={() => {
                    setShowNotesModal(false);
                    setSelectedNoteItem(null);
               }}
          >
               Save
          </Button>
     </Modal.Footer>
</Modal>
```

**Modal Structure:**

1. **Props:**
   - `show={showNotesModal}` - Controls visibility
   - `centered` - Centers on screen
   - `onHide` - Closes modal when X clicked

2. **Header:**
   - Title: "📝 Interpretation/Notes"
   - Border bottom for visual separation

3. **Body:**
   - **Parameter Info Section:**
     - Shows test name
     - Shows current abnormal value in red
     - Labels for context
   
   - **Notes Input Section:**
     - Large textarea (4 rows)
     - Bootstrap styling
     - Responsive sizing
     - Placeholder text for guidance
   
   - **Character Counter:**
     - Shows count when notes exist
     - Helps user track length
     - "No notes yet" when empty

4. **Footer:**
   - Close button (outline variant)
   - Save button (primary variant)
   - Both reset state when clicked

---

## Usage Example - Adding a Note

### Step 1: User Clicks "📝 Notes" Button
```typescript
onClick={() => {
     setSelectedNoteItem(item);           // Set which parameter
     setShowNotesModal(true);              // Open modal
}}
```

### Step 2: Modal Displays
```typescript
<Modal show={showNotesModal} ...>
     {/* Shows selectedNoteItem details and note textarea */}
</Modal>
```

### Step 3: User Types in Textarea
```typescript
onChange={(e) => {
     setNotes({
          ...notes,
          [selectedNoteItem.id]: e.target.value  // Store by parameter ID
     });
}}
```

### Step 4: User Clicks Save
```typescript
onClick={() => {
     setShowNotesModal(false);
     setSelectedNoteItem(null);
     // Notes are saved in component state
     // (Can be extended to API call here)
}}
```

### Step 5: Notes Persist During Session
```typescript
// Next time modal opens for same parameter:
value={notes[selectedNoteItem.id] || ''}  // Note is restored
```

---

## Integration Points

### Adding to Existing Code

If this is a new page, all code is already integrated. If updating existing modal:

1. **Add imports:**
   ```typescript
   import { Form } from 'react-bootstrap'
   ```

2. **Add state:**
   ```typescript
   const [notes, setNotes] = useState<{ [key: string]: string }>({});
   const [showNotesModal, setShowNotesModal] = useState<boolean>(false);
   const [selectedNoteItem, setSelectedNoteItem] = useState<TestResultItem | null>(null);
   ```

3. **Add function:**
   ```typescript
   const isCriticalValue = (item: TestResultItem): boolean => {
        // ... function body
   };
   ```

4. **Update table cells:**
   - Flag column: Use conditional rendering with `isCriticalValue()`
   - Value column: Add inline reference ranges and prominent units
   - Action column: Add notes button for abnormal results

5. **Add modal:**
   - Add notes modal component at end of main return

---

## Styling Details

### Colors Used

| Element | Class/Style | Color |
|---------|------------|-------|
| Unit Text | `text-muted` | #6c757d (gray) |
| Abnormal Value | `text-danger` | #dc3545 (red) |
| Critical Icon | `fontSize: '1.2rem'` | Default |
| Badge Background | `backgroundColor: comparisonStatus.color` | Red (#dc3545) for abnormal |
| Reference Text | `text-muted` | #6c757d (gray) |

### Spacing Classes

| Element | Class | Purpose |
|---------|-------|---------|
| Cell Padding | `py-2` | Vertical padding |
| Cell Centering | `text-center` | Horizontal centering |
| Gap Between Buttons | `gap-2` | Margin between buttons |
| Margin Top | `mt-1`, `mt-2` | Space above elements |
| Margin Bottom | `mb-3` | Space below elements |

### Font Classes

| Element | Class | Style |
|---------|-------|-------|
| Value | `fw-bold` | Font weight 700 |
| Units | `fw-bold` | Font weight 700 |
| Parameter Name | `fw-bold` | Font weight 700 |
| Label | `fw-semibold` | Font weight 600 |
| Helper Text | `text-muted` | Smaller size, gray color |

---

## Performance Notes

1. **isCriticalValue() Function:**
   - Called once per row per render
   - Lightweight: 3-4 parseFloat operations
   - No API calls
   - Negligible performance impact

2. **Notes State:**
   - Object keyed by parameter ID
   - Only stores as many keys as parameters with notes
   - Quick lookup: O(1) access time
   - No effect on table rendering performance

3. **Modal Rendering:**
   - Only renders when `showNotesModal` is true
   - Centered modal: No layout shifting
   - Form control: Standard React Bootstrap component

---

## Extension Points for Future Development

### 1. Save Notes to API
```typescript
const handleSaveNote = async () => {
     if (selectedNoteItem && notes[selectedNoteItem.id]) {
          await customFetch('/api/test-notes', {
               method: 'POST',
               body: JSON.stringify({
                    parameterId: selectedNoteItem.id,
                    note: notes[selectedNoteItem.id],
                    timestamp: new Date()
               })
          });
     }
     setShowNotesModal(false);
};
```

### 2. Load Notes from API
```typescript
useEffect(() => {
     const loadNotes = async () => {
          const response = await customFetch(`/api/test-notes/${currentViewItem?.ascensionid}`);
          setNotes(response.data);
     };
     if (currentViewItem) loadNotes();
}, [currentViewItem]);
```

### 3. Dynamic Critical Value Thresholds
```typescript
const getCriticalThresholds = (item: TestResultItem) => {
     // Load from database or API instead of hardcoding
     return {
          upperMultiplier: 1.5,
          lowerMultiplier: 0.5
     };
};
```

### 4. Note History/Audit Trail
```typescript
const noteHistory = [
     { timestamp: '2024-01-15 10:30', user: 'Dr. Smith', note: '...' },
     { timestamp: '2024-01-14 15:45', user: 'Dr. Johnson', note: '...' }
];
```

---

## Testing Examples

### Test Critical Value Detection
```typescript
// Test Case 1: Critical HIGH
const item1 = { value: '200', lowerlimit: '70', upperlimit: '110' };
isCriticalValue(item1); // true (200 > 110 * 1.5 = 165)

// Test Case 2: Critical LOW
const item2 = { value: '30', lowerlimit: '70', upperlimit: '110' };
isCriticalValue(item2); // true (30 < 70 * 0.5 = 35)

// Test Case 3: Abnormal but not Critical
const item3 = { value: '120', lowerlimit: '70', upperlimit: '110' };
isCriticalValue(item3); // false (120 is between 165 and 110)

// Test Case 4: Normal
const item4 = { value: '95', lowerlimit: '70', upperlimit: '110' };
isCriticalValue(item4); // false (95 is within range)
```

### Test Notes State Management
```typescript
// User enters note for parameter with ID '5'
setNotes({ ...notes, ['5']: 'Patient fasting was 2 hours only' });

// Access note later
const noteContent = notes['5']; // 'Patient fasting was 2 hours only'

// Multiple parameters with notes
const multiNotes = {
     '5': 'Elevated due to inadequate fasting',
     '12': 'Abnormal result - recommend follow-up',
     '18': 'Critical value - notify physician'
};
```

---

**Last Updated:** Feature Implementation Complete
**Version:** 1.0
**Status:** Ready for Testing & Deployment
