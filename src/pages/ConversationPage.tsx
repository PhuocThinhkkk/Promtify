
import { useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { ChatInterface } from '@/components/chat/ChatInterface';

export const ConversationPage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 overflow-hidden">
        <ChatInterface conversationId={id} />
      </div>
    </div>
  );
};
