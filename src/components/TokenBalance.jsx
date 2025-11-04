import { useEffect, useState } from 'react';
import { getUserTokenBalance } from '../services/apiService';

export default function TokenBalance() {
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserTokenBalance();
      
      if (data) {
        setTokens(data);
      } else {
        setError('Failed to load token balance');
      }
    } catch (err) {
      console.error('Error fetching tokens:', err);
      setError('Unable to fetch tokens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  if (loading) {
    return (
      <div className="token-balance loading">
        <span className="token-icon">🎫</span>
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="token-balance error" onClick={fetchTokens} title="Click to retry">
        <span className="token-icon">⚠️</span>
        <span>Error</span>
      </div>
    );
  }

  return (
    <div className="token-balance" onClick={fetchTokens} title="Click to refresh">
      <span className="token-icon">🎫</span>
      <span className="token-count">
        {tokens?.tokens_remaining ?? 0}
      </span>
      <span className="token-label">tokens</span>
    </div>
  );
}
