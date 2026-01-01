
import React, { useRef, useState } from 'react';
// Use namespace import to resolve named export issues
import * as ReactRouterDOM from 'react-router-dom';
import { AppState, Difficulty, QuestionType } from '../types';

const { useNavigate } = ReactRouterDOM;

interface Props {
  state: AppState;
  onUpdateSettings: (settings: Partial<AppState['settings']>) => void;
  onStart: () => Promise<void>;
}

const SettingsPage: React.FC<Props> = ({ state, onUpdateSettings, onStart }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdateSettings({ fileName: file.name });
    }
  };

  const handleStartClick = async () => {
    if (state.settings.questionCount <= 0) {
      onUpdateSettings({ questionCount: 5 });
    }
    setLoading(true);
    try {
      await onStart();
      navigate('/questions'); // الانتقال لصفحة الأسئلة بدلاً من الدردشة
    } catch (error) {
      // الخطأ يتم التعامل معه في App.tsx
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light">
      <header className="sticky top-0 z-50 bg-white border-b border-[#e5e7eb] flex items-center p-4 h-14 shrink-0 shadow-sm">
        <div className="size-8"></div>
        <h2 className="text-[#111418] text-[15px] font-bold flex-1 text-center font-display">إعدادات الخبير التعليمي</h2>
        <div className="size-8 flex items-center justify-center text-primary">
           <span className="material-symbols-outlined text-[20px]">settings</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 pb-28 no-scrollbar">
        <div className="flex flex-col gap-2">
          <h3 className="text-[#111418] text-[12px] font-bold px-1 text-right">المصدر التعليمي (PDF)</h3>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed ${state.settings.fileName ? 'border-primary bg-blue-50' : 'border-[#dbe0e6] bg-white'} px-4 py-5 transition-all hover:border-primary group cursor-pointer`}
          >
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileUpload} />
            <div className={`size-10 rounded-full flex items-center justify-center transition-colors ${state.settings.fileName ? 'bg-primary text-white' : 'bg-primary/10 text-primary group-hover:bg-primary/20'}`}>
              <span className="material-symbols-outlined text-[22px]">{state.settings.fileName ? 'task_alt' : 'upload_file'}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 text-center px-2">
              <p className="text-[#111418] text-[11px] font-bold line-clamp-1">{state.settings.fileName || 'ارفع ملف الدرس هنا'}</p>
              <p className="text-[#637588] text-[10px]">سيقوم Gemini بتحليل المحتوى آلياً</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-[#111418] text-[12px] font-bold px-1 text-right">اسم الفصل أو الوحدة</h3>
          <div className="relative">
            <input 
              type="text" 
              className="w-full h-11 pr-10 rounded-xl bg-white border-[#dbe0e6] focus:border-primary focus:ring-1 focus:ring-primary text-[11px] text-right"
              placeholder="مثال: الخلية، الميكانيكا، التاريخ الحديث..."
              value={state.settings.chapterName}
              onChange={(e) => onUpdateSettings({ chapterName: e.target.value })}
            />
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#637588] text-[18px]">auto_stories</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <h3 className="text-[#111418] text-[12px] font-bold px-1 text-right">عدد الأسئلة</h3>
            <div className="relative">
              <input 
                type="number" 
                className="w-full h-11 pr-10 rounded-xl bg-white border-[#dbe0e6] focus:border-primary focus:ring-1 focus:ring-primary text-[11px] text-right"
                value={state.settings.questionCount || ''}
                onChange={(e) => onUpdateSettings({ questionCount: parseInt(e.target.value) || 0 })}
              />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#637588] text-[18px]">format_list_numbered</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-[#111418] text-[12px] font-bold px-1 text-right">المستوى</h3>
            <div className="flex w-full h-11 rounded-xl bg-slate-200 p-1">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                <label key={level} className="cursor-pointer flex-1">
                  <input className="peer sr-only" name="difficulty" type="radio" checked={state.settings.difficulty === level} onChange={() => onUpdateSettings({ difficulty: level })} />
                  <div className="flex items-center justify-center h-full rounded-lg text-[9px] font-bold text-[#637588] transition-all peer-checked:bg-white peer-checked:text-primary peer-checked:shadow-sm">
                    {level === 'easy' ? 'سهل' : level === 'medium' ? 'متوسط' : 'صعب'}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-[#111418] text-[12px] font-bold px-1 text-right">نوع الاختبار</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'mcq', label: 'اختياري', icon: 'list_alt' },
              { id: 'tf', label: 'صواب/خطأ', icon: 'rule' },
              { id: 'mix', label: 'مزيج', icon: 'dashboard_customize' }
            ].map((type) => (
              <label key={type.id} className="cursor-pointer">
                <input className="peer sr-only" name="type" type="radio" checked={state.settings.type === type.id} onChange={() => onUpdateSettings({ type: type.id as QuestionType })} />
                <div className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border border-[#dbe0e6] bg-white transition-all peer-checked:border-primary peer-checked:bg-blue-50/50 h-20">
                  <span className="material-symbols-outlined text-[#637588] text-[18px] peer-checked:text-primary">{type.icon}</span>
                  <span className="text-[9px] font-bold text-[#111418] peer-checked:text-primary">{type.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#dbe0e6]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">visibility</span>
              <span className="text-[11px] font-bold text-[#111418]">إظهار مفتاح الحل</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={state.settings.showAnswers} onChange={(e) => onUpdateSettings({ showAnswers: e.target.checked })} />
              <div className="w-8 h-4 bg-gray-200 rounded-full peer peer-checked:after:translate-x-[-100%] after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 z-40 max-w-md mx-auto">
        <button 
          onClick={handleStartClick}
          disabled={loading}
          className={`flex w-full items-center justify-center rounded-xl h-12 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover shadow-lg shadow-primary/30'} text-white text-[14px] font-bold transition-all active:scale-95`}
        >
          {loading ? (
             <div className="flex items-center gap-3">
                <span className="animate-spin material-symbols-outlined text-[20px]">sync</span>
                <span>جاري معالجة المحتوى...</span>
             </div>
          ) : (
            <>
              <span className="ml-2">توليد الأسئلة الآن</span>
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
            </>
          )}
        </button>
      </footer>
    </div>
  );
};

export default SettingsPage;
