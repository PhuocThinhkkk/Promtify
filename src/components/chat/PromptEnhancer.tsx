import { useState } from 'react';
import { Frame, TitleBar, Button, TextArea, Fieldset } from '@react95/core';
import { usePromptEnhancer } from '@/hooks/usePromptEnhancer';
import { useAlert } from '@/hooks/useAlert';

interface PromptEnhancerProps {
  onEnhancedPrompt?: (enhancedPrompt: string) => void;
}

export const PromptEnhancer = ({ onEnhancedPrompt }: PromptEnhancerProps) => {
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const { enhancePrompt, loading, error } = usePromptEnhancer();
  const alertHook = useAlert();

  const handleEnhance = async () => {
    if (!originalPrompt.trim()) {
      alertHook.showAlert({
        type: 'warning',
        title: 'Hold up!',
        message: 'Please enter a prompt to enhance first.',
        hasSound: true
      });
      return;
    }

    const result = await enhancePrompt(originalPrompt);
    
    if (result) {
      setEnhancedPrompt(result.enhanced_prompt);
      alertHook.showAlert({
        type: 'info',
        title: 'Success!',
        message: 'Your prompt has been enhanced! Check the result below.',
        hasSound: true
      });
    } else if (error) {
      alertHook.showAlert({
        type: 'error',
        title: 'Oops!',
        message: error,
        hasSound: true
      });
    }
  };

  const handleUseEnhanced = () => {
    if (enhancedPrompt && onEnhancedPrompt) {
      onEnhancedPrompt(enhancedPrompt);
      alertHook.showAlert({
        type: 'info',
        title: 'Applied!',
        message: 'Enhanced prompt has been applied to your chat.',
        hasSound: true
      });
    }
  };

  const handleCopyToClipboard = async () => {
    if (enhancedPrompt) {
      try {
        await navigator.clipboard.writeText(enhancedPrompt);
        alertHook.showAlert({
          type: 'info',
          title: 'Copied!',
          message: 'Enhanced prompt copied to clipboard.',
          hasSound: true
        });
      } catch (err) {
        alertHook.showAlert({
          type: 'error',
          title: 'Failed!',
          message: 'Could not copy to clipboard.',
          hasSound: true
        });
      }
    }
  };

  return (
    <Frame className="w-full">
      <TitleBar>🧠 Prompt Enhancer - Make Your Prompts Less Cringe</TitleBar>
      <div className="p-4 space-y-4">
        {/* Input Section */}
        <Fieldset legend="📝 Your Original (Probably Bad) Prompt">
          <TextArea
            value={originalPrompt}
            onChange={(e) => setOriginalPrompt(e.target.value)}
            placeholder="Paste your messy prompt here... we'll fix it for you"
            rows={4}
            className="w-full font-mono text-sm"
            disabled={loading}
          />
          <div className="mt-2 flex justify-end">
            <Button 
              onClick={handleEnhance} 
              disabled={loading || !originalPrompt.trim()}
            >
              {loading ? '🔄 Fixing Your Mess...' : '✨ Enhance Prompt'}
            </Button>
          </div>
        </Fieldset>

        {/* Output Section */}
        {enhancedPrompt && (
          <Fieldset legend="🎯 Enhanced (Actually Good) Prompt">
            <TextArea
              value={enhancedPrompt}
              readOnly
              rows={6}
              className="w-full font-mono text-sm bg-green-50"
            />
            <div className="mt-2 flex gap-2 justify-end">
              <Button onClick={handleCopyToClipboard}>
                📋 Copy
              </Button>
              {onEnhancedPrompt && (
                <Button onClick={handleUseEnhanced}>
                  🚀 Use This
                </Button>
              )}
            </div>
          </Fieldset>
        )}

        {/* Info Section */}
        <div className="text-xs text-gray-600 bg-gray-100 p-3 border-2 border-gray-300">
          <div className="font-bold mb-1">💡 What this does:</div>
          <ul className="list-disc list-inside space-y-1">
            <li>Makes your vague prompts specific and actionable</li>
            <li>Adds proper structure and formatting</li>
            <li>Includes relevant context and constraints</li>
            <li>Transforms "make website" into actual requirements</li>
            <li>Uses AI to understand your intent and improve clarity</li>
          </ul>
        </div>
      </div>
    </Frame>
  );
};