# API Service - Request Management System

## 🎯 Purpose

This service provides centralized API request management with the following features:

- **Request Deduplication**: Prevents duplicate concurrent requests
- **Request Cancellation**: Cancel pending requests manually or automatically
- **Rate Limiting**: Protects the backend from request flooding
- **Automatic Retries**: Retries failed requests with exponential backoff
- **Error Handling**: Consistent error handling across all requests

## 🚀 Features

### 1. Request Deduplication
Automatically cancels and replaces duplicate concurrent requests:

```javascript
// Multiple rapid clicks only send ONE request
button.addEventListener('click', () => {
  apiService.post('/api/cv/optimize', data);
  apiService.post('/api/cv/optimize', data); // This cancels the first one
});
```

### 2. Request Cancellation
Cancel pending requests when navigating away or starting new operations:

```javascript
// Cancel all requests on component unmount
useEffect(() => {
  return () => {
    apiService.cancelAllRequests();
  };
}, []);

// Cancel specific request
apiService.cancelRequest(requestKey);
```

### 3. Rate Limiting
Prevents more than 5 requests per second:

```javascript
// Configuration in apiService.js
const RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 1000 // 1 second
};
```

### 4. Automatic Retries
Retries failed requests (5xx errors) with exponential backoff:

```javascript
// Retry configuration
const retryFetch = async (endpoint, options, maxRetries = 2) => {
  // Retries with delays: 1s, 2s, 3s...
};
```

## 📖 Usage

### Basic GET Request
```javascript
import apiService from '../services/apiService';

const fetchData = async () => {
  try {
    const data = await apiService.get('/api/data');
    console.log(data);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### POST Request
```javascript
const createCV = async () => {
  try {
    const data = await apiService.post('/api/cv/optimize', {
      job_description: 'Software Engineer',
      personal_info: { name: 'John Doe' }
    });
    console.log('Optimized:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Download File (PDF)
```javascript
const downloadPDF = async () => {
  try {
    await apiService.download(
      '/api/cv/generate',
      { /* CV data */ },
      'John_Doe_CV.pdf'
    );
  } catch (error) {
    console.error('Download failed:', error.message);
  }
};
```

### Cancel Requests
```javascript
// Cancel all pending requests
apiService.cancelAllRequests();

// Check active requests
const activeRequests = apiService.getActiveRequests();
console.log('Active:', activeRequests);
```

## 🔧 CVBuilder Integration

The CV Builder component has been updated to use this service:

### Request Tracking
```javascript
const [activeRequests, setActiveRequests] = useState(0);

// Track active requests
const fetchSuggestions = async () => {
  setActiveRequests(prev => prev + 1);
  try {
    const data = await apiService.post('/api/cv/suggestions', payload);
    // Process data...
  } finally {
    setActiveRequests(prev => Math.max(0, prev - 1));
  }
};
```

### Visual Indicator
A visual indicator shows when requests are in progress:

```jsx
{activeRequests > 0 && (
  <div className="active-requests-indicator">
    <div className="spinner"></div>
    <span>{activeRequests} requests in progress...</span>
    <button onClick={() => apiService.cancelAllRequests()}>
      Cancel All
    </button>
  </div>
)}
```

### Automatic Cleanup
Requests are automatically cancelled when the component unmounts:

```javascript
useEffect(() => {
  return () => {
    apiService.cancelAllRequests();
  };
}, []);
```

## 🎨 UI Features

### Loading Spinner
Animated spinner appears when requests are active:
- Gradient background (purple to pink)
- Rotating spinner icon
- Request counter
- Cancel button

### Request States
- **Idle**: No visual indicator
- **Loading**: Spinner + request count + cancel button
- **Error**: Error message displayed
- **Success**: Data processed, indicator disappears

## ⚡ Performance Benefits

### Before (without apiService):
```
User clicks button 5 times rapidly
→ 5 identical requests sent to backend
→ Backend processes all 5 (wasted resources)
→ 5 responses returned (possibly conflicting)
→ UI updates 5 times
```

### After (with apiService):
```
User clicks button 5 times rapidly
→ Request 1 sent, then cancelled
→ Request 2 sent, then cancelled
→ Request 3 sent, then cancelled
→ Request 4 sent, then cancelled
→ Request 5 sent (final one)
→ 1 response returned
→ UI updates once
```

**Result**: 80% reduction in backend load!

## 🛡️ Error Handling

### Network Errors
```javascript
try {
  const data = await apiService.post('/api/endpoint', payload);
} catch (error) {
  if (error.message === 'Rate limit exceeded') {
    // Show rate limit message
  } else if (error.message === 'The user aborted a request.') {
    // Request was cancelled (ignore)
  } else {
    // Show generic error
  }
}
```

### HTTP Errors
- **4xx errors**: No retry (client error)
- **5xx errors**: Automatic retry with backoff
- **Network errors**: Automatic retry

## 🔍 Debugging

### Check Active Requests
```javascript
console.log('Active requests:', apiService.getActiveRequests());
// Output: ['POST-/api/cv/optimize-{...}', 'GET-/api/data-']
```

### Monitor Request Queue
Open browser console to see:
- Request cancellations
- Retry attempts
- Rate limit warnings

## 📝 Backend Compatibility

The service works with the existing FastAPI backend. No backend changes required!

**Compatible endpoints:**
- `/api/cv/suggestions` (POST)
- `/api/cv/optimize` (POST)
- `/api/cv/generate` (POST)
- `/api/cv/generate-without-optimization` (POST)

## 🚨 Rate Limit Configuration

Adjust rate limits based on backend capacity:

```javascript
// In apiService.js
const RATE_LIMIT = {
  maxRequests: 10,      // Increase for powerful servers
  windowMs: 2000,       // 2 seconds window
};
```

## 🎯 Best Practices

1. **Always cancel on unmount**: Prevent memory leaks
2. **Track active requests**: Show loading indicators
3. **Handle cancellation errors**: Don't show errors for cancelled requests
4. **Use consistent error messages**: Better user experience
5. **Test with slow network**: Throttle network in DevTools

## 🐛 Common Issues

### Issue: Requests not cancelling
**Solution**: Make sure you're calling `cancelAllRequests()` in useEffect cleanup

### Issue: Rate limit errors
**Solution**: Increase `RATE_LIMIT.maxRequests` or add debouncing to UI buttons

### Issue: Requests timing out
**Solution**: Check backend response times, add timeout configuration

## 📊 Metrics

Track these metrics in production:
- Average requests per user session
- Request cancellation rate
- Rate limit hit rate
- Retry success rate

## 🔮 Future Enhancements

- [ ] Request queue priority system
- [ ] Persistent request caching
- [ ] Request batching for multiple operations
- [ ] WebSocket support for real-time updates
- [ ] Request analytics dashboard
- [ ] Configurable timeout per endpoint

## 📚 References

- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [Request Cancellation Patterns](https://kentcdodds.com/blog/using-fetch-with-type-script)
