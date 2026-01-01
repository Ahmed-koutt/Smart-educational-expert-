
import React, { useState } from 'react';
// Use namespace import to resolve potential issues with named exports in some environments
import * as ReactRouterDOM from 'react-router-dom';
import SettingsPage from './pages/SettingsPage';
import QuestionsDisplayPage from './pages/QuestionsDisplayPage';
import ChatPage from './pages/ChatPage';
import { AppState, Question, ChatMessage } from './types';
import { generateQuestions } from './services/aiService';

// Destructure components from the namespace to ensure availability
const { HashRouter, Routes, Route, Navigate } = ReactRouterDOM;

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    settings: {
      difficulty: 'medium',
      type: 'mcq',
      showAnswers: true,
      fileName: '',
      questionCount: 5,
      chapterName: ''
    },
    questions: [],
    messages: [
      {
        role: 'model',
        text: 'أهلاً بك! أنا "Gemini"، خبيرك التعليمي الذكي. 🎓 ابدأ برفع ملفك وتحديد الإعدادات لنقوم معاً بإنشاء أفضل الأسئلة التدريبية.',
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
      }
    ]
  });

  const updateSettings = (newSettings: Partial<AppState['settings']>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  };

  const setQuestions = (questions: Question[]) => {
    setState(prev => ({ ...prev, questions }));
  };

  const addMessage = (msg: ChatMessage) => {
    setState(prev => ({ ...prev, messages: [...prev.messages, msg] }));
  };

  const handleStartProcess = async () => {
    const context = `المحتوى: ${state.settings.fileName || 'دراسة عامة'}. الفصل: ${state.settings.chapterName}.`;
    try {
      const questions = await generateQuestions(
        context, 
        state.settings.type, 
        state.settings.difficulty, 
        state.settings.questionCount,
        state.settings.chapterName
      );
      setQuestions(questions);
      addMessage({
        role: 'model',
        text: `تم توليد ${questions.length} سؤالاً بنجاح! يمكنك الآن مراجعة الأسئلة في بنك الأسئلة أو الاستمرار في الدردشة معي حول الدرس.`,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
      });
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء توليد الأسئلة. يرجى المحاولة مرة أخرى.");
      throw error;
    }
  };

  return (
    <HashRouter>
      <div className="max-w-md mx-auto h-screen bg-white relative shadow-2xl overflow-hidden flex flex-col border-x border-slate-200">
        <Routes>
          <Route 
            path="/" 
            element={<SettingsPage state={state} onUpdateSettings={updateSettings} onStart={handleStartProcess} />} 
          />
          <Route 
            path="/questions" 
            element={<QuestionsDisplayPage state={state} onSetQuestions={setQuestions} />} 
          />
          <Route 
            path="/chat" 
            element={<ChatPage state={state} onAddMessage={addMessage} />} 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
