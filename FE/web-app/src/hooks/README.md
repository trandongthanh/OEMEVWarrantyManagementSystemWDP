# Custom Hooks

## usePolling

A custom hook for polling data at regular intervals with real-time updates.

### Basic Usage

```tsx
import { usePolling } from "@/hooks/usePolling";
import { useState } from "react";

function TechnicianDashboard() {
  const [records, setRecords] = useState([]);

  // Poll for new records every 10 seconds
  const { isPolling, stopPolling, startPolling } = usePolling(
    async () => {
      const data = await fetchAssignedRecords();
      setRecords(data.records);
    },
    {
      interval: 10000, // 10 seconds
      enabled: true, // Start polling immediately
    }
  );

  return (
    <div>
      {isPolling && <span>🔄 Live updates enabled</span>}
      <button onClick={stopPolling}>Pause Updates</button>
      <button onClick={startPolling}>Resume Updates</button>
    </div>
  );
}
```

### Advanced Usage with Error Handling

```tsx
const { isPolling } = usePolling(
  async () => {
    const response = await technicianService.getAssignedRecords();
    setRecords(response.data.records.records);
    setTotalCount(response.data.records.recordsCount);
  },
  {
    interval: 5000,
    enabled: isTabActive, // Only poll when tab is active
    onError: (error) => {
      console.error("Polling error:", error);
      showNotification("Failed to fetch updates", "error");
    },
  }
);
```

### Use Cases

1. **Technician Dashboard**: Poll for new repair assignments
2. **Staff Dashboard**: Poll for pending approvals
3. **Manager Dashboard**: Poll for task assignments and completions
4. **Parts Coordinator**: Poll for stock transfer requests
5. **Notification Panel**: Poll for new notifications

### Parameters

- `fetchFn`: Async function to fetch data
- `options.interval`: Polling interval in milliseconds (default: 5000)
- `options.enabled`: Whether polling is active (default: true)
- `options.onError`: Error callback function

### Returns

- `isPolling`: Boolean indicating if polling is active
- `startPolling`: Function to start/resume polling
- `stopPolling`: Function to stop/pause polling
