
import { useEffect, useState } from 'react';
import { Frame, TitleBar, Button, Fieldset } from '@react95/core';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  title: string;
  summary: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  message_count?: number;
}

export const ConversationList = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        messages(count)
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      alert('Failed to load conversations');
      return;
    }

    const conversationsWithCount = data.map(conv => ({
      ...conv,
      message_count: conv.messages?.[0]?.count || 0
    }));

    setConversations(conversationsWithCount);
    setLoading(false);
  };

  const deleteConversation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Failed to delete conversation');
      return;
    }

    setConversations(prev => prev.filter(conv => conv.id !== id));
    alert('Conversation deleted successfully!');
  };

  const openConversation = (id: string) => {
    navigate(`/conversation/${id}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Frame className="w-full">
          <TitleBar>🔄 Loading Conversations...</TitleBar>
          <div className="p-4">
            <div className="text-center">
              <div className="text-4xl mb-4">⏳</div>
              <p>Please wait while we load your conversation history...</p>
            </div>
          </div>
        </Frame>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <Frame className="w-full">
          <TitleBar>📂 Conversation History - Empty</TitleBar>
          <div className="p-4">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-lg font-bold mb-2">No conversations yet</h3>
              <p className="text-gray-600 mb-4">Start your first conversation with the AI assistant</p>
              <Button onClick={() => navigate('/chat')}>
                💬 Start Chatting
              </Button>
            </div>
          </div>
        </Frame>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Frame className="w-full">
        <TitleBar>📋 Conversation History ({conversations.length} conversations)</TitleBar>
        <div className="p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {conversations.map((conversation) => (
              <div key={conversation.id} className="p-3 border-2 border-gray-300 bg-gray-100">
                <Fieldset legend={`💬 ${conversation.title}`}>
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-gray-600">
                      <span>🕒</span>
                      <span className="ml-1">
                        {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                      </span>
                    </div>
                    
                    {conversation.summary && (
                      <p className="text-sm text-gray-700 bg-gray-100 p-2 rounded">
                        {conversation.summary.slice(0, 100)}...
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex space-x-1">
                        {conversation.tags.slice(0, 2).map((tag, index) => (
                          <div key={index} className="px-2 py-1 bg-white border border-gray-300">
                            <span className="text-xs">#{tag}</span>
                          </div>
                        ))}
                        {conversation.tags.length > 2 && (
                          <div className="px-2 py-1 bg-white border border-gray-300">
                            <span className="text-xs">+{conversation.tags.length - 2}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button
                          onClick={() => openConversation(conversation.id)}
                        >
                          📖 Open
                        </Button>
                        <Button
                          onClick={() => deleteConversation(conversation.id)}
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  </div>
                </Fieldset>
              </div>
            ))}
          </div>
        </div>
      </Frame>
    </div>
  );
};
