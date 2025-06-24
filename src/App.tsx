
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ChatPage } from "@/pages/ChatPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { ConversationPage } from "@/pages/ConversationPage";

import { Button, Cursor, List, TaskBar } from '@react95/core';
import { ReaderClosed, WindowsExplorer } from '@react95/icons';

import './App.css';

import '@react95/core/GlobalStyle';
import '@react95/core/themes/win95.css';

import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();



const App = () => (

  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        } />
        <Route path="/conversation/:id" element={
          <ProtectedRoute>
            <ConversationPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
