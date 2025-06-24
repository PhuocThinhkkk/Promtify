
import { Header } from '@/components/layout/Header';
import { ConversationList } from '@/components/history/ConversationList';

export const HistoryPage = () => {
  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: 'linear-gradient(45deg, #008080, #20b2aa)',
        fontFamily: 'MS Sans Serif, sans-serif'
      }}
    >
      <Header />
      <ConversationList />
    </div>
  );
};
