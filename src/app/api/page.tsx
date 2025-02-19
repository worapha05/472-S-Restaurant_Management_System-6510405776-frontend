'use client';

import { useState, useEffect } from 'react';

const ApiTest = () => {
  const [apiData, setApiData] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost/api/orders/2');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setApiData(data);
        setLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        };
    }

    fetchData();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      {loading && (
        <div className="text-gray-600">Loading...</div>
      )}

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          Error: {error}
        </div>
      )}

      {apiData && (
        <div className="p-4 bg-green-600 rounded-md">
          <h2 className="font-semibold mb-2">API Response:</h2>
          <pre className="bg-black p-4 rounded-md shadow text-white">
            {JSON.stringify(apiData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiTest;