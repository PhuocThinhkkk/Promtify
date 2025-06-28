import { useState, useEffect, useRef } from 'react';
import { Frame, TitleBar, Button, Input, Fieldset } from '@react95/core';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { PromptEnhancer } from './PromptEnhancer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  summary: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface UnifiedChatInterfaceProps {
  conversationId?: string;
}

export const UnifiedChatInterface = ({ conversationId }: UnifiedChatInterfaceProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState(conversationId);
  const [showEnhancer, setShowEnhancer] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [selectedConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Failed to load conversations:', error);
      return;
    }

    setConversations(data || []);
  };

  const loadMessages = async () => {
    if (!selectedConversationId) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', selectedConversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to load messages:', error);
      return;
    }

    const typedMessages: Message[] = (data || []).map(msg => ({
      ...msg,
      role: msg.role as 'user' | 'assistant'
    }));

    setMessages(typedMessages);
  };

  const createConversation = async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: 'New Conversation',
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create conversation:', error);
      return null;
    }

    return data;
  };

  const selectConversation = (convId: string) => {
    setSelectedConversationId(convId);
    navigate(`/conversation/${convId}`);
  };

  const startNewChat = () => {
    setSelectedConversationId(undefined);
    setMessages([]);
    navigate('/chat');
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this conversation?')) return;

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete conversation:', error);
      return;
    }

    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (selectedConversationId === id) {
      setSelectedConversationId(undefined);
      setMessages([]);
      navigate('/chat');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    setLoading(true);
    const userMessage = input.trim();
    setInput('');

    try {
      let convId = selectedConversationId;
      
      if (!convId) {
        const newConversation = await createConversation();
        if (!newConversation) {
          setLoading(false);
          return;
        }
        convId = newConversation.id;
        setSelectedConversationId(convId);
        navigate(`/conversation/${convId}`);
      }

      const tempUserMessage: Message = {
        id: 'temp-user',
        role: 'user',
        content: userMessage,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, tempUserMessage]);

      const { error: userMessageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: convId,
          role: 'user',
          content: userMessage,
        });

      if (userMessageError) {
        throw userMessageError;
      }

      setIsStreaming(true);
      const tempAssistantMessage: Message = {
        id: 'temp-assistant',
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev.filter(m => m.id !== 'temp-user'), tempUserMessage, tempAssistantMessage]);

      const aiResponse = `[RETRO AI RESPONSE] Processing your request: "${userMessage}". This is a simulated Windows 95-style AI assistant. Your message has been logged to the mainframe. Please standby...`;
      
      let currentResponse = '';
      for (let i = 0; i < aiResponse.length; i++) {
        currentResponse += aiResponse[i];
        setMessages(prev => 
          prev.map(m => 
            m.id === 'temp-assistant' 
              ? { ...m, content: currentResponse }
              : m
          )
        );
        await new Promise(resolve => setTimeout(resolve, 30));
      }

      setIsStreaming(false);

      const { error: assistantMessageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: convId,
          role: 'assistant',
          content: aiResponse,
        });

      if (assistantMessageError) {
        throw assistantMessageError;
      }

      loadMessages();
      loadConversations();

    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')));
    } finally {
      setLoading(false);
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEnhancedPrompt = (enhancedPrompt: string) => {
    setInput(enhancedPrompt);
    setShowEnhancer(false);
  };

  return (
    <div className="h-full flex gap-4">
      {/* Left Sidebar - History */}
      <div className="w-80 flex flex-col">
        <Frame className="h-full">
          <TitleBar>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <span>📚</span>
                <span>Chat History</span>
              </div>
              <div className="flex space-x-1">
                <Button 
                  onClick={() => setShowEnhancer(!showEnhancer)} 
                  className="text-xs"
                  style={{ backgroundColor: showEnhancer ? '#ffeb3b' : undefined }}
                >
                  🧠 Fix
                </Button>
                <Button onClick={startNewChat} className="text-xs">
                  ➕ New
                </Button>
              </div>
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
            {conversations.length === 0 ? (
              <div className="text-center p-4">
                <div className="text-4xl mb-2">📁</div>
                <p className="text-sm text-gray-600">No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => selectConversation(conversation.id)}
                    className={`p-3 border-2 cursor-pointer transition-colors ${
                      selectedConversationId === conversation.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate mb-1">
                          💬 {conversation.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">
                          🕒 {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                        </p>
                        {conversation.summary && (
                          <p className="text-xs text-gray-700 truncate">
                            {conversation.summary.slice(0, 50)}...
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={(e) => deleteConversation(conversation.id, e)}
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

      {/* Right Side - Chat Area */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Prompt Enhancer (conditionally shown) */}
        {showEnhancer && (
          <div className="h-80">
            <PromptEnhancer onEnhancedPrompt={handleEnhancedPrompt} />
          </div>
        )}

        {/* Top Right - AI Response Area */}
        <Frame className="flex-1">
          <TitleBar>
            <div className="flex items-center space-x-2">
              <span>🤖</span>
              <span>AI Response</span>
              {selectedConversationId && (
                <span className="text-xs opacity-75">
                  - {conversations.find(c => c.id === selectedConversationId)?.title || 'Conversation'}
                </span>
              )}
            </div>
          </TitleBar>
          <div className="h-full overflow-y-auto p-4 bg-white">
            {messages.length === 0 ? (
              <div className="text-center p-8">
                <div className="text-6xl mb-4">🖥️</div>
                <h3 className="text-xl font-bold mb-2">Welcome to Promptify Chat!</h3>
                <p className="text-gray-600 mb-4">Start typing below to begin your conversation</p>
                <div className="text-sm text-gray-500 bg-yellow-50 p-3 border-2 border-yellow-300 rounded">
                  💡 <strong>Pro Tip:</strong> Click the "🧠 Fix" button to enhance your prompts before sending!
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id}>
                    {message.role === 'assistant' && (
                      <div className="p-4 border-2 border-gray-300 bg-green-50">
                        <div className="flex items-start space-x-2 mb-2">
                          <span className="font-bold text-sm">🤖 AI Assistant:</span>
                        </div>
                        <div className="whitespace-pre-wrap font-mono text-sm">
                          {message.content}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </Frame>

        {/* Bottom Right - User Input Area */}
        <Frame className="h-64">
          <TitleBar>
            <div className="flex items-center space-x-2">
              <span>👤</span>
              <span>Your Prompt</span>
            </div>
          </TitleBar>
          <div className="h-full flex flex-col p-4 bg-white">
            {/* Show user messages here */}
            <div className="flex-1 overflow-y-auto mb-4">
              {messages.filter(m => m.role === 'user').slice(-3).map((message) => (
                <div key={message.id} className="mb-3 p-3 border-2 border-gray-300 bg-blue-50">
                  <div className="flex items-start space-x-2 mb-1">
                    <span className="font-bold text-sm">👤 You:</span>
                  </div>
                  <div className="whitespace-pre-wrap font-mono text-sm">
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input area */}
            <div className="border-t-2 border-gray-300 pt-4">
              <div className="flex items-end space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here... (or use the enhancer above!)"
                  disabled={loading}
                  className="flex-1"
                  style={{ fontFamily: 'monospace' }}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={loading || !input.trim()}
                  style={{ minWidth: '80px' }}
                >
                  {loading ? '⏳' : '📤 Send'}
                </Button>
              </div>
            </div>
          </div>
        </Frame>
      </div>
    </div>
  );
};