
import { useState, useEffect, useRef } from 'react';
import { Window, WindowHeader, WindowContent, Button, TextInput, Panel, Separator } from 'react95';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatInterfaceProps {
  conversationId?: string;
}

export const ChatInterface = ({ conversationId }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);

  useEffect(() => {
    if (currentConversationId) {
      loadMessages();
    }
  }, [currentConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!currentConversationId) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', currentConversationId)
      .order('created_at', { ascending: true });

    if (error) {
      alert('Failed to load messages');
      return;
    }

    // Fix the type issue by casting the role
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
      alert('Failed to create conversation');
      return null;
    }

    return data;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    setLoading(true);
    const userMessage = input.trim();
    setInput('');

    try {
      let convId = currentConversationId;
      
      if (!convId) {
        const newConversation = await createConversation();
        if (!newConversation) {
          setLoading(false);
          return;
        }
        convId = newConversation.id;
        setCurrentConversationId(convId);
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

    } catch (error) {
      alert('Failed to send message');
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

  return (
    <Window className="w-full h-full">
      <WindowHeader className="flex items-center justify-between">
        <span>💬 Lovable AI Chat v1.0</span>
      </WindowHeader>
      <WindowContent className="flex flex-col h-full">
        {/* Messages */}
        <Panel 
          variant="well" 
          className="flex-1 overflow-y-auto p-2 mb-2 bg-white"
          style={{ minHeight: '400px' }}
        >
          {messages.length === 0 ? (
            <div className="text-center p-8">
              <div className="text-4xl mb-4">🖥️</div>
              <p className="text-gray-600">Welcome to Lovable AI Chat!</p>
              <p className="text-gray-500 text-sm">Start typing to begin your conversation...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id} className="mb-4">
                  <Panel 
                    variant={message.role === 'user' ? 'raised' : 'well'}
                    className={`p-3 ${message.role === 'user' ? 'ml-8 bg-blue-50' : 'mr-8 bg-gray-50'}`}
                  >
                    <div className="flex items-start space-x-2">
                      <span className="font-bold text-sm">
                        {message.role === 'user' ? '🧑‍💻 You:' : '🤖 AI:'}
                      </span>
                    </div>
                    <div className="mt-1 whitespace-pre-wrap font-mono text-sm">
                      {message.content}
                    </div>
                  </Panel>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </Panel>

        <Separator />

        {/* Input */}
        <div className="flex items-center space-x-2 mt-2">
          <TextInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            disabled={loading}
            className="flex-1"
            style={{ fontFamily: 'monospace' }}
          />
          <Button 
            onClick={sendMessage} 
            disabled={loading || !input.trim()}
            style={{ minWidth: '80px' }}
          >
            {loading ? '⏳ Wait...' : '📤 Send'}
          </Button>
        </div>
      </WindowContent>
    </Window>
  );
};
