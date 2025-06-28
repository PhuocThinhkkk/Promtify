import { useState } from 'react';

interface EnhancementResult {
  original_prompt: string;
  enhanced_prompt: string;
  enhancement_timestamp: string;
}

export const usePromptEnhancer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enhancePrompt = async (prompt: string): Promise<EnhancementResult | null> => {
    if (!prompt.trim()) {
      setError('Please provide a prompt to enhance');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enhance-prompt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enhance prompt');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    enhancePrompt,
    loading,
    error,
  };
};