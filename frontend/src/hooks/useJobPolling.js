import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';

export default function useJobPolling(apiUrl) {
  const [status, setStatus] = useState(null);
  const [insights, setInsights] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback((jobId) => {
    // Reset state
    setStatus('pending');
    setInsights(null);
    setChartData(null);
    setJobDetails(null);
    setError(null);

    // Stop any existing polling
    stopPolling();

    const poll = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/jobs/${jobId}`);
        const data = response.data;

        setStatus(data.status);
        setJobDetails({
          filename: data.filename,
          rowCount: data.rowCount,
          columns: data.columns,
          preview: data.preview
        });

        if (data.status === 'done') {
          setInsights(data.insights);
          setChartData(data.chartData);
          stopPolling();
        } else if (data.status === 'failed') {
          setError(data.error || 'Analysis failed');
          stopPolling();
        }
      } catch (err) {
        console.error('Polling error:', err);
        // Don't stop polling on network errors — could be temporary
      }
    };

    // Poll immediately, then every 3 seconds
    poll();
    intervalRef.current = setInterval(poll, 3000);
  }, [apiUrl, stopPolling]);

  const reset = useCallback(() => {
    stopPolling();
    setStatus(null);
    setInsights(null);
    setChartData(null);
    setJobDetails(null);
    setError(null);
  }, [stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return { status, insights, chartData, jobDetails, error, startPolling, reset };
}
