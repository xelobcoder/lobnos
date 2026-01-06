# Sales Session Configuration API - Frontend Integration Guide

## Overview

The Sales Session Configuration API allows frontend applications to manage sales session settings for different branches. This includes enabling/disabling multiple sessions per day and configuring time ranges for automated session creation.

## API Endpoints

### 1. Get Sales Session Configuration

**Endpoint:** `GET /api/v1/billing/sales/session/config`

**Purpose:** Retrieve the current sales session configuration for a specific branch.

**Query Parameters:**
- `tenantId` (required): The tenant ID
- `branchId` (required): The branch ID to get configuration for

**Request Example:**
```javascript
const response = await fetch('/api/v1/billing/sales/session/config?tenantId=3&branchId=1', {
  method: 'GET',
  headers: {
    'Cookie': 'pls-prime-tenant-session=your-session-token'
  }
});
```

**Response:**
```json
{
  "config": {
    "id": 1,
    "branchid": 1,
    "allow_multiple_sessions": 1,
    "session_count": null,
    "start_time": null,
    "end_time": null,
    "time_ranges": [
      {"start": "09:00", "end": "17:00"},
      {"start": "18:00", "end": "22:00"}
    ],
    "created_at": "2026-01-03T07:30:52.000Z",
    "updated_at": "2026-01-03T07:31:10.000Z"
  }
}
```

**Response when no config exists:**
```json
{
  "config": null
}
```

### 2. Set/Update Sales Session Configuration

**Endpoint:** `POST /api/v1/billing/sales/session/config`

**Purpose:** Create or update the sales session configuration for a specific branch.

**Query Parameters:**
- `tenantId` (required): The tenant ID

**Request Body:**
```json
{
  "branchid": 1,
  "allow_multiple_sessions": true,
  "time_ranges": [
    {"start": "09:00", "end": "17:00"},
    {"start": "18:00", "end": "22:00"}
  ]
}
```

**Request Example:**
```javascript
const response = await fetch('/api/v1/billing/sales/session/config?tenantId=3', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': 'pls-prime-tenant-session=your-session-token'
  },
  body: JSON.stringify({
    branchid: 1,
    allow_multiple_sessions: true,
    time_ranges: [
      { start: "09:00", end: "17:00" },
      { start: "18:00", end: "22:00" }
    ]
  })
});
```

**Success Response:**
```json
{
  "status": true
}
```

## Data Structures

### SalesSessionConfig

```typescript
interface SalesSessionConfig {
  id: number;                    // Auto-generated ID
  branchid: number;              // Branch identifier
  allow_multiple_sessions: boolean; // Whether to allow multiple sessions per day
  session_count?: number;        // Optional: Maximum number of sessions (future use)
  start_time?: string;          // Optional: Single session start time (HH:MM format)
  end_time?: string;            // Optional: Single session end time (HH:MM format)
  time_ranges?: TimeRange[];    // Optional: Array of time ranges for multiple sessions
  created_at: string;           // ISO timestamp
  updated_at: string;           // ISO timestamp
}

interface TimeRange {
  start: string;  // Start time in HH:MM format (24-hour)
  end: string;    // End time in HH:MM format (24-hour)
}
```

## Frontend Implementation

### 1. Configuration Component

```typescript
// React component example
import React, { useState, useEffect } from 'react';

interface SalesSessionConfig {
  id?: number;
  branchid: number;
  allow_multiple_sessions: boolean;
  time_ranges?: { start: string; end: string }[];
}

const SalesSessionConfigComponent: React.FC<{ branchId: number }> = ({ branchId }) => {
  const [config, setConfig] = useState<SalesSessionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load current configuration
  useEffect(() => {
    loadConfig();
  }, [branchId]);

  const loadConfig = async () => {
    try {
      const response = await fetch(`/api/v1/billing/sales/session/config?tenantId=3&branchId=${branchId}`);
      const data = await response.json();
      setConfig(data.config);
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (newConfig: SalesSessionConfig) => {
    setSaving(true);
    try {
      const response = await fetch('/api/v1/billing/sales/session/config?tenantId=3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });

      if (response.ok) {
        await loadConfig(); // Reload to get updated data
        alert('Configuration saved successfully!');
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading configuration...</div>;

  return (
    <div className="sales-session-config">
      <h3>Sales Session Configuration</h3>

      {/* Multiple Sessions Toggle */}
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={config?.allow_multiple_sessions || false}
            onChange={(e) => setConfig(prev => prev ? {
              ...prev,
              allow_multiple_sessions: e.target.checked
            } : null)}
          />
          Allow Multiple Sessions Per Day
        </label>
      </div>

      {/* Time Ranges (only show if multiple sessions enabled) */}
      {config?.allow_multiple_sessions && (
        <div className="time-ranges">
          <h4>Session Time Ranges</h4>
          <button onClick={() => {
            const newRanges = [...(config.time_ranges || []), { start: '09:00', end: '17:00' }];
            setConfig(prev => prev ? { ...prev, time_ranges: newRanges } : null);
          }}>
            Add Time Range
          </button>

          {(config.time_ranges || []).map((range, index) => (
            <div key={index} className="time-range">
              <input
                type="time"
                value={range.start}
                onChange={(e) => {
                  const newRanges = [...(config.time_ranges || [])];
                  newRanges[index].start = e.target.value;
                  setConfig(prev => prev ? { ...prev, time_ranges: newRanges } : null);
                }}
              />
              <span>to</span>
              <input
                type="time"
                value={range.end}
                onChange={(e) => {
                  const newRanges = [...(config.time_ranges || [])];
                  newRanges[index].end = e.target.value;
                  setConfig(prev => prev ? { ...prev, time_ranges: newRanges } : null);
                }}
              />
              <button onClick={() => {
                const newRanges = (config.time_ranges || []).filter((_, i) => i !== index);
                setConfig(prev => prev ? { ...prev, time_ranges: newRanges } : null);
              }}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={() => config && saveConfig(config)}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Configuration'}
      </button>
    </div>
  );
};

export default SalesSessionConfigComponent;
```

### 2. Integration with Existing Sales Session Components

When creating new sales sessions, the frontend should check the configuration:

```typescript
const canCreateSession = async (date: string, branchId: number) => {
  // First check if multiple sessions are allowed
  const configResponse = await fetch(`/api/v1/billing/sales/session/config?tenantId=3&branchId=${branchId}`);
  const { config } = await configResponse.json();

  if (!config || !config.allow_multiple_sessions) {
    // Single session mode - check existing sessions for the date
    const sessionResponse = await fetch(`/api/v1/billing/sales/session/verify/session?tenantId=3&branchid=${branchId}&sessiondate=${date}`);
    const { status } = await sessionResponse.json();
    return !status; // Can create if no active session exists
  } else {
    // Multiple sessions mode - can always create (time validation happens on backend)
    return true;
  }
};
```

## Error Handling

### Common Error Responses

**Invalid branchId:**
```json
{
  "message": "branchId not provided",
  "statusCode": 400,
  "status": "error"
}
```

**Database errors:**
```json
{
  "message": "insert into `sales_session_config` ...",
  "statusCode": 500,
  "status": "error"
}
```

### Frontend Error Handling Example

```typescript
const handleApiError = (error: any) => {
  if (error.statusCode === 400) {
    // Validation error
    alert('Invalid input: ' + error.message);
  } else if (error.statusCode === 500) {
    // Server error
    alert('Server error occurred. Please try again.');
  } else {
    // Other errors
    alert('An unexpected error occurred.');
  }
};
```

## Best Practices

### 1. Form Validation

```typescript
const validateTimeRanges = (ranges: { start: string; end: string }[]) => {
  for (const range of ranges) {
    if (range.start >= range.end) {
      return 'Start time must be before end time';
    }
  }

  // Check for overlapping ranges
  for (let i = 0; i < ranges.length; i++) {
    for (let j = i + 1; j < ranges.length; j++) {
      if (ranges[i].start < ranges[j].end && ranges[j].start < ranges[i].end) {
        return 'Time ranges cannot overlap';
      }
    }
  }

  return null; // Valid
};
```

### 2. Loading States

Always show loading indicators during API calls to provide better user experience:

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Use in your components
{loading && <div className="spinner">Loading...</div>}
{error && <div className="error">{error}</div>}
```

### 3. Optimistic Updates

For better UX, you can implement optimistic updates:

```typescript
const [optimisticConfig, setOptimisticConfig] = useState<SalesSessionConfig | null>(null);

const saveWithOptimism = async (newConfig: SalesSessionConfig) => {
  const previousConfig = config;
  setOptimisticConfig(newConfig);
  setConfig(newConfig);

  try {
    await saveConfig(newConfig);
    setOptimisticConfig(null);
  } catch (error) {
    // Revert on error
    setConfig(previousConfig);
    setOptimisticConfig(null);
    throw error;
  }
};
```

## Testing

### Unit Tests Example

```typescript
describe('SalesSessionConfig API', () => {
  test('should load configuration', async () => {
    const mockConfig = {
      id: 1,
      branchid: 1,
      allow_multiple_sessions: true,
      time_ranges: [{ start: '09:00', end: '17:00' }]
    };

    // Mock fetch response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ config: mockConfig })
      })
    );

    const { result } = renderHook(() => useSalesSessionConfig(1));
    await waitFor(() => expect(result.current.config).toEqual(mockConfig));
  });
});
```

## Migration Notes

- **Database**: Ensure the `sales_session_config` table exists (created by migration 50)
- **Backend**: The API endpoints are available at the paths specified above
- **Authentication**: All requests require valid session cookies

## Future Enhancements

- **Session Count Limits**: The `session_count` field is reserved for future use to limit maximum sessions per day
- **Single Session Times**: `start_time` and `end_time` fields for traditional single-session mode
- **Validation**: Frontend should validate time ranges don't overlap and are in correct format</content>
<parameter name="filePath">SalesSessionConfig_Frontend_Integration.md