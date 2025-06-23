
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
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
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive',
      });
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
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete conversation',
        variant: 'destructive',
      });
      return;
    }

    setConversations(prev => prev.filter(conv => conv.id !== id));
    toast({
      title: 'Success',
      description: 'Conversation deleted',
    });
  };

  const openConversation = (id: string) => {
    navigate(`/conversation/${id}`);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
        <p className="text-gray-500 mb-4">Start your first conversation with the AI assistant</p>
        <Button onClick={() => navigate('/chat')}>
          Start Chatting
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {conversations.map((conversation) => (
        <Card key={conversation.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg line-clamp-1">
                {conversation.title}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conversation.id);
                }}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
            </div>
          </CardHeader>
          <CardContent>
            {conversation.summary && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {conversation.summary}
              </p>
            )}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {conversation.tags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {conversation.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{conversation.tags.length - 2}
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openConversation(conversation.id)}
              >
                Open
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
