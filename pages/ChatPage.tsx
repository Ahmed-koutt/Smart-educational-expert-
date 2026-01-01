
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppState, ChatMessage } from '../types';
import { getChatResponse } from '../services/aiService';

interface Props {
  state: AppState;
  onAddMessage: (msg: ChatMessage) => void;
}

const ChatPage: React.FC<Props> = ({ state, onAddMessage }) => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

    onAddMessage({ role: 'user', text: userText, timestamp: timeStr });
    setIsTyping(true);

    try {
      const appContext = `اسم الملف: ${state.settings.fileName || 'غير محدد'}. مستوى الصعوبة: ${state.settings.difficulty}. عدد الأسئلة المنشأة حالياً: ${state.questions.length}.`;
      const response = await getChatResponse(userText, appContext);
      
      onAddMessage({ 
        role: 'model', 
        text: response || "عذراً، Gemini يحتاج لمزيد من الوقت للتفكير.", 
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) 
      });
    } catch (error) {
      onAddMessage({ role: 'model', text: "حدث خطأ في الاتصال بمحرك Gemini.", timestamp: timeStr });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <header className="bg-white border-b border-slate-200 z-30 shrink-0 sticky top-0 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex flex-col text-right">
            <h1 className="text-sm font-black text-slate-800 tracking-tight">Gemini الخبير التعليمي</h1>
            <div className="flex items-center gap-1">
              <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Thinking Engine</span>
            </div>
          </div>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button className="flex items-center justify-center w-10 h-8 rounded-lg bg-white text-primary shadow-sm border border-slate-200">
              <span className="material-symbols-outlined text-[18px]">chat</span>
            </button>
            <button onClick={() => navigate('/questions')} className="flex items-center justify-center w-10 h-8 rounded-lg text-slate-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">quiz</span>
            </button>
          </div>
        </div>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar pb-24">
        {state.messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`size-8 shrink-0 rounded-full flex items-center justify-center shadow-sm ${msg.role === 'model' ? 'bg-gradient-to-br from-blue-600 to-blue-400 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
              <span className="material-symbols-outlined text-sm">{msg.role === 'model' ? 'auto_awesome' : 'person'}</span>
            </div>
            <div className={`flex flex-col gap-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-3 rounded-2xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none shadow-md' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm text-right'}`}>
                {msg.text}
              </div>
              <span className="text-[9px] text-slate-400 px-1 font-medium">{msg.timestamp}</span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 p-3 bg-white border border-slate-100 rounded-2xl rounded-tl-none w-fit shadow-sm">
            <span className="text-[10px] text-blue-500 font-bold ml-2">Gemini يفكر...</span>
            <div className="flex gap-1">
              <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></span>
              <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </main>

      <div className="absolute bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-100 px-4 py-3 flex items-center gap-2 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <button onClick={() => navigate('/')} className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-400 bg-white border border-slate-200 hover:text-primary transition-all active:scale-90">
          <span className="material-symbols-outlined text-xl">tune</span>
        </button>
        <div className="flex-1 relative">
          <input 
            className="w-full h-10 pr-3 pl-10 rounded-xl bg-slate-50 border-transparent focus:border-primary focus:ring-0 text-xs text-right placeholder-slate-400" 
            placeholder="اسأل Gemini عن أي شيء في الدرس..." 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} className="absolute left-1 top-1 bottom-1 w-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-sm hover:bg-primary-hover active:scale-90 transition-all">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
