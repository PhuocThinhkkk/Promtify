import { useState, useEffect } from 'react';
import { Frame, TitleBar, Button, TextArea } from '@react95/core';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { usePromptEnhancer } from '@/hooks/usePromptEnhancer';
import { useAlert } from '@/hooks/useAlert';

interface Enhancement {
  id: string;
  original_prompt: string;
  enhanced_prompt: string;
  provider: string;
  created_at: string;
}

interface UnifiedChatInterfaceProps {
  conversationId?: string;
}

export const UnifiedChatInterface = ({ conversationId }: UnifiedChatInterfaceProps) => {
  const [enhancements, setEnhancements] = useState<Enhancement[]>([]);
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { enhancePrompt, loading: enhancerLoading, error } = usePromptEnhancer();
  const alertHook = useAlert();

  useEffect(() => {
    if (user) {
      loadEnhancements();
    }
  }, [user]);

  const loadEnhancements = async () => {
    if (!user) {
      setLoadingHistory(false);
      return;
    }

    setLoadingHistory(true);
    try {
      console.log('Loading enhancements for user:', user.id);
      
      const { data, error } = await supabase
        .from('prompt_enhancements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error loading enhancements:', error);
        alertHook.showAlert({
          type: 'error',
          title: 'Database Error',
          message: `Could not load enhancement history: ${error.message}`,
          hasSound: true
        });
        setEnhancements([]);
      } else {
        console.log('Successfully loaded enhancements:', data);
        setEnhancements(data || []);
      }
    } catch (err) {
      console.error('Unexpected error loading enhancements:', err);
      alertHook.showAlert({
        type: 'error',
        title: 'Error',
        message: 'Unexpected error loading history. Please try again.',
        hasSound: true
      });
      setEnhancements([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const saveEnhancement = async (original: string, enhanced: string, provider: string) => {
    if (!user) {
      console.error('No user found when trying to save enhancement');
      return;
    }

    try {
      console.log('Saving enhancement for user:', user.id);
      
      const enhancementData = {
        user_id: user.id,
        original_prompt: original,
        enhanced_prompt: enhanced,
        provider: provider
      };

      console.log('Enhancement data to save:', enhancementData);

      const { data, error } = await supabase
        .from('prompt_enhancements')
        .insert(enhancementData)
        .select()
        .single();

      console.log('Save response:', { data, error });

      if (error) {
        console.error('Supabase error saving enhancement:', error);
        alertHook.showAlert({
          type: 'error',
          title: 'Save Error',
          message: `Could not save enhancement: ${error.message}`,
          hasSound: true
        });
      } else {
        console.log('Successfully saved enhancement:', data);
        // Add to local state immediately
        setEnhancements(prev => [data, ...prev]);
        alertHook.showAlert({
          type: 'info',
          title: 'Saved!',
          message: 'Enhancement saved to history.',
          hasSound: true
        });
      }
    } catch (err) {
      console.error('Unexpected error saving enhancement:', err);
      alertHook.showAlert({
        type: 'error',
        title: 'Error',
        message: 'Unexpected error saving enhancement.',
        hasSound: true
      });
    }
  };

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

    setLoading(true);
    const result = await enhancePrompt(originalPrompt);
    
    if (result) {
      setEnhancedPrompt(result.enhanced_prompt);
      await saveEnhancement(originalPrompt, result.enhanced_prompt, result.provider || 'Google Gemini 1.5 Flash');
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
    setLoading(false);
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

  const clearAll = () => {
    setOriginalPrompt('');
    setEnhancedPrompt('');
  };

  const deleteEnhancement = async (id: string) => {
    if (!user) return;
    
    try {
      console.log('Deleting enhancement:', id);
      
      const { error } = await supabase
        .from('prompt_enhancements')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting enhancement:', error);
        alertHook.showAlert({
          type: 'error',
          title: 'Delete Error',
          message: `Could not delete enhancement: ${error.message}`,
          hasSound: true
        });
      } else {
        console.log('Successfully deleted enhancement');
        setEnhancements(prev => prev.filter(e => e.id !== id));
        alertHook.showAlert({
          type: 'info',
          title: 'Deleted!',
          message: 'Enhancement removed from history.',
          hasSound: true
        });
      }
    } catch (err) {
      console.error('Unexpected error deleting enhancement:', err);
    }
  };

  const loadEnhancementToEditor = (enhancement: Enhancement) => {
    setOriginalPrompt(enhancement.original_prompt);
    setEnhancedPrompt(enhancement.enhanced_prompt);
  };

  const refreshHistory = () => {
    loadEnhancements();
  };

  return (
    <div className="h-full flex gap-4">
      {/* Left Sidebar - Enhancement History */}
      <div className="w-80 flex flex-col">
        <Frame className="h-full">
          <TitleBar>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <span>📚</span>
                <span>Enhancement History</span>
              </div>
              <Button onClick={refreshHistory} className="text-xs" disabled={loadingHistory}>
                {loadingHistory ? '⏳' : '🔄'} Refresh
              </Button>
            </div>
          </TitleBar>
          
          {/* Cool History Text Effect */}
          <div className="relative p-4 bg-gray-200 border-b-2 border-gray-400">
            <div 
              className="text-center text-2xl font-bold relative"
              style={{
                color: '#000080',
                textShadow: '2px 2px 0px #c0c0c0',
                fontFamily: 'MS Sans Serif, monospace'
              }}
            >
              <span className="relative z-10">HISTORY</span>
              <div 
                className="absolute inset-0 bg-gray-200"
                style={{
                  clipPath: 'polygon(0 40%, 25% 40%, 25% 60%, 75% 60%, 75% 40%, 100% 40%, 100% 100%, 0 100%)'
                }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 bg-white">
            {loadingHistory ? (
              <div className="text-center p-4">
                <div className="text-4xl mb-2">⏳</div>
                <p className="text-sm text-gray-600">Loading history...</p>
              </div>
            ) : enhancements.length === 0 ? (
              <div className="text-center p-4">
                <div className="text-4xl mb-2">📁</div>
                <p className="text-sm text-gray-600">No enhancements yet</p>
                <p className="text-xs text-gray-500 mt-2">Start enhancing prompts to see history here!</p>
                {user && (
                  <div className="mt-3 text-xs text-blue-600">
                    User ID: {user.id.slice(0, 8)}...
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-gray-500 mb-2 text-center">
                  {enhancements.length} enhancement{enhancements.length !== 1 ? 's' : ''} found
                </div>
                {enhancements.map((enhancement) => (
                  <div
                    key={enhancement.id}
                    onClick={() => loadEnhancementToEditor(enhancement)}
                    className="p-3 border-2 cursor-pointer transition-colors border-gray-300 bg-gray-100 hover:bg-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate mb-1">
                          🧠 {enhancement.original_prompt.slice(0, 30)}...
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">
                          🕒 {formatDistanceToNow(new Date(enhancement.created_at), { addSuffix: true })}
                        </p>
                        <p className="text-xs text-green-700 truncate">
                          ✨ {enhancement.enhanced_prompt.slice(0, 50)}...
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          🤖 {enhancement.provider}
                        </p>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEnhancement(enhancement.id);
                        }}
                        className="ml-2 text-xs"
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Frame>
      </div>

      {/* Right Side - Prompt Enhancement Tool */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Top Right - Enhanced Prompt Display */}
        <Frame className="flex-1">
          <TitleBar>
            <div className="flex items-center space-x-2">
              <span>✨</span>
              <span>Enhanced Prompt (The Good Stuff)</span>
            </div>
          </TitleBar>
          <div className="h-full overflow-y-auto p-4 bg-white">
            {!enhancedPrompt ? (
              <div className="text-center p-8">
                <div className="text-6xl mb-4">🧠</div>
                <h3 className="text-xl font-bold mb-2">Ready to Fix Your Prompt!</h3>
                <p className="text-gray-600 mb-4">Enter your messy prompt below and watch the magic happen</p>
                <div className="text-sm text-gray-500 bg-yellow-50 p-3 border-2 border-yellow-300 rounded">
                  💡 <strong>Pro Tip:</strong> The more specific your original prompt, the better the enhancement!
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-2 border-green-300 bg-green-50 p-4 rounded">
                  <h4 className="font-bold text-green-800 mb-2">🎯 Your Enhanced (Actually Good) Prompt:</h4>
                  <div className="bg-white p-3 border border-green-200 rounded font-mono text-sm whitespace-pre-wrap">
                    {enhancedPrompt}
                  </div>
                  <div className="mt-3 flex gap-2 justify-end">
                    <Button onClick={handleCopyToClipboard}>
                      📋 Copy Enhanced
                    </Button>
                    <Button onClick={clearAll}>
                      🗑️ Clear All
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Frame>

        {/* Bottom Right - Original Prompt Input */}
        <Frame className="h-80">
          <TitleBar>
            <div className="flex items-center space-x-2">
              <span>📝</span>
              <span>Your Original (Probably Bad) Prompt</span>
            </div>
          </TitleBar>
          <div className="h-full flex flex-col p-4 bg-white">
            <div className="flex-1 mb-4">
              <TextArea
                value={originalPrompt}
                onChange={(e) => setOriginalPrompt(e.target.value)}
                placeholder="Paste your messy prompt here... we'll fix it for you"
                rows={8}
                className="w-full font-mono text-sm"
                disabled={loading || enhancerLoading}
              />
            </div>

            {/* Input controls */}
            <div className="border-t-2 border-gray-300 pt-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-600">
                  {originalPrompt.length} characters
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={clearAll}
                    disabled={loading || enhancerLoading}
                  >
                    🗑️ Clear
                  </Button>
                  <Button 
                    onClick={handleEnhance} 
                    disabled={loading || enhancerLoading || !originalPrompt.trim()}
                    style={{ minWidth: '120px' }}
                  >
                    {loading || enhancerLoading ? '🔄 Fixing...' : '✨ Enhance Prompt'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Frame>

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
    </div>
  );
};