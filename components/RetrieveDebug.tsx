import React, { useState } from 'react';
import { useRetrieve } from '../hooks/useIdaratiApi';

/**
 * Debug component to test the /retrieve endpoint
 * This shows the raw retrieval results without AI processing
 */
export const RetrieveDebug: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const retrieveMutation = useRetrieve();

  const handleRetrieve = async () => {
    if (!prompt.trim()) return;

    try {
      await retrieveMutation.mutateAsync({
        prompt,
        match_threshold: 0.5,
        match_count: 3,
      });
    } catch (error) {
      console.error('Retrieve error:', error);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-bold mb-4">🔍 Retrieve Debug Panel</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Test Prompt:
          </label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="كيفاش ندير بطاقة التعريف الوطنية؟"
            dir="rtl"
          />
        </div>

        <button
          onClick={handleRetrieve}
          disabled={retrieveMutation.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {retrieveMutation.isPending ? 'Retrieving...' : 'Test Retrieve'}
        </button>

        {retrieveMutation.isError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              Error: {retrieveMutation.error?.message || 'Unknown error'}
            </p>
          </div>
        )}

        {retrieveMutation.isSuccess && retrieveMutation.data && (
          <div className="space-y-2">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-medium">
                Found {retrieveMutation.data.count} results
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {retrieveMutation.data.results.map((result: any, idx: number) => (
                <div key={idx} className="p-3 bg-white border rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">
                    Similarity: {result.similarity?.toFixed(3) || 'N/A'}
                  </div>
                  <h4 className="font-medium mb-2" dir="rtl">
                    {result.title || result.name || 'Untitled'}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-3" dir="rtl">
                    {result.content || result.description || 'No content'}
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    ID: {result.id || result.procedure_id || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
