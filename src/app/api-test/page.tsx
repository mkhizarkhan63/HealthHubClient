"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/config";
import { apiRequest } from "@/lib/queryClient";

export default function ApiTestPage() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    setIsLoading(true);
    setResults([]);
    
    addResult(`Testing connection to: ${API_BASE_URL}`);
    
    try {
      // Test basic connectivity
      const response = await fetch(API_BASE_URL, { 
        method: 'GET',
        mode: 'cors'
      });
      addResult(`Base URL response: ${response.status} ${response.statusText}`);
    } catch (error) {
      addResult(`❌ Base URL failed: ${error}`);
    }

    try {
      // Test /api/calls endpoint
      const response = await fetch(`${API_BASE_URL}/api/calls`, {
        method: 'GET',
        mode: 'cors'
      });
      addResult(`/api/calls response: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        addResult(`✅ /api/calls data: ${JSON.stringify(data).substring(0, 100)}...`);
      }
    } catch (error) {
      addResult(`❌ /api/calls failed: ${error}`);
    }

    try {
      // Test using apiRequest function
      const response = await apiRequest('GET', '/api/calls');
      const data = await response.json();
      addResult(`✅ apiRequest success: ${JSON.stringify(data).substring(0, 100)}...`);
    } catch (error) {
      addResult(`❌ apiRequest failed: ${error}`);
    }

    setIsLoading(false);
  };

  const testBackendEndpoints = async () => {
    setIsLoading(true);
    setResults([]);
    
    const endpoints = [
      '/api/calls',
      '/api/agent/config',
      '/health',
      '/status',
      '/'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'GET',
          mode: 'cors'
        });
        addResult(`${endpoint}: ${response.status} ${response.statusText}`);
      } catch (error) {
        addResult(`${endpoint}: ❌ ${error}`);
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-muted p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">API Connection Test</h1>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="space-y-2 text-sm">
            <p><strong>API Base URL:</strong> {API_BASE_URL}</p>
            <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
            <p><strong>Next.js App Port:</strong> 3001 (based on your package.json)</p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Tests</h2>
          <div className="space-x-4 mb-4">
            <Button 
              onClick={testConnection} 
              disabled={isLoading}
              variant="default"
            >
              {isLoading ? "Testing..." : "Test API Connection"}
            </Button>
            <Button 
              onClick={testBackendEndpoints} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? "Testing..." : "Test All Endpoints"}
            </Button>
          </div>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <p>Click a test button to start debugging...</p>
            ) : (
              results.map((result, index) => (
                <div key={index}>{result}</div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
          <div className="space-y-3 text-sm">
            <div>
              <h3 className="font-semibold">1. Check if your backend server is running:</h3>
              <p className="text-muted-foreground">Make sure your .NET API server is running on port 5000</p>
              <code className="bg-gray-100 px-2 py-1 rounded">dotnet run</code>
            </div>
            
            <div>
              <h3 className="font-semibold">2. Verify the API endpoints exist:</h3>
              <p className="text-muted-foreground">Check if these endpoints are available in your backend:</p>
              <ul className="list-disc list-inside ml-4 text-muted-foreground">
                <li>GET /api/calls</li>
                <li>GET /api/agent/config</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold">3. CORS Configuration:</h3>
              <p className="text-muted-foreground">Ensure your backend allows requests from http://localhost:3001</p>
            </div>
            
            <div>
              <h3 className="font-semibold">4. Check Network Tab:</h3>
              <p className="text-muted-foreground">Open browser DevTools → Network tab to see actual requests</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 