
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SettingsPage from './pages/SettingsPage';
import QuestionsDisplayPage from './pages/QuestionsDisplayPage';
import ChatPage from './pages/ChatPage';
import { AppState, Question, ChatMessage } from './types';
import { generateQuestions } from './services/aiService';

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
        text: 'أهلاً بك! أنا "Gemini"، خبيرك التعليمي الذكي. 🎓 لقد تم تزويدي بأحدث تقنيات الذكاء الاصطناعي لمساعدتك في تحليل ملفاتك وتوليد أسئلة احترافية. ابدأ برفع ملفك وتحديد الفصل من الإعدادات لنبدأ!',
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
    const context = state.settings.fileName 
      ? `تحليل ملف: ${state.settings.fileName}` 
      : "دراسة مادة علمية عامة";
    
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
      text: `لقد انتهيت من تحليل ${state.settings.chapterName ? `الفصل "${state.settings.chapterName}"` : 'المحتوى'} باستخدام Gemini. 🚀 قمت بتجهيز ${questions.length} أسئلة بمستوى ${state.settings.difficulty}. هل نراجعها سوياً؟`,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    });
  };

  return (
    <Router>
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
    </Router>
  );
};

export default App;
