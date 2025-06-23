
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Paperclip, Bot, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

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
  const { toast } = useToast();
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
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
      return;
    }

    setMessages(data || []);
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
      toast({
        title: 'Error',
        description: 'Failed to create conversation',
        variant: 'destructive',
      });
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
      
      // Create new conversation if needed
      if (!convId) {
        const newConversation = await createConversation();
        if (!newConversation) {
          setLoading(false);
          return;
        }
        convId = newConversation.id;
        setCurrentConversationId(convId);
      }

      // Add user message to UI immediately
      const tempUserMessage: Message = {
        id: 'temp-user',
        role: 'user',
        content: userMessage,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, tempUserMessage]);

      // Save user message to database
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

      // Simulate AI response (replace with actual AI API call)
      setIsStreaming(true);
      const tempAssistantMessage: Message = {
        id: 'temp-assistant',
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev.filter(m => m.id !== 'temp-user'), tempUserMessage, tempAssistantMessage]);

      // Simulate streaming response
      const aiResponse = `I understand you're asking about: "${userMessage}". This is a simulated AI response. In a real implementation, you would connect this to your AI service endpoint to get actual intelligent responses.`;
      
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
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      setIsStreaming(false);

      // Save assistant message to database
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

      // Reload messages to get proper IDs
      loadMessages();

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
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
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Start a conversation with your AI assistant!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-[80%] p-4 ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                <div className="flex items-start space-x-2">
                  {message.role === 'assistant' && (
                    <Bot className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  )}
                  {message.role === 'user' && (
                    <User className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    {message.content || (isStreaming && message.id === 'temp-assistant') ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <Skeleton className="h-4 w-full" />
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Button variant="outline" size="icon">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
