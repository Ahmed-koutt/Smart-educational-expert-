
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppState, Difficulty, QuestionType } from '../types';

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
    // التأكد من وجود عدد أسئلة منطقي قبل البدء
    if (state.settings.questionCount <= 0) {
      onUpdateSettings({ questionCount: 5 });
    }
    setLoading(true);
    await onStart();
    setLoading(false);
    navigate('/chat');
  };

  return (
    <div className="flex flex-col h-full bg-background-light">
      <header className="sticky top-0 z-50 bg-white border-b border-[#e5e7eb] flex items-center p-4 h-16 shrink-0 shadow-sm">
        <div className="size-10"></div>
        <h2 className="text-[#111418] text-lg font-bold flex-1 text-center font-display">إعدادات Gemini</h2>
        <div className="size-10 flex items-center justify-center text-primary">
           <span className="material-symbols-outlined">settings</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 pb-28 no-scrollbar">
        {/* ملف PDF */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[#111418] text-sm font-bold px-1 text-right">المصدر التعليمي</h3>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed ${state.settings.fileName ? 'border-primary bg-blue-50' : 'border-[#dbe0e6] bg-white'} px-6 py-8 transition-all hover:border-primary group cursor-pointer`}
          >
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileUpload} />
            <div className={`size-12 rounded-full flex items-center justify-center transition-colors ${state.settings.fileName ? 'bg-primary text-white' : 'bg-primary/10 text-primary group-hover:bg-primary/20'}`}>
              <span className="material-symbols-outlined text-[28px]">{state.settings.fileName ? 'task_alt' : 'upload_file'}</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="text-[#111418] text-sm font-bold">{state.settings.fileName || 'اختر ملف PDF للتحليل'}</p>
              <p className="text-[#637588] text-[11px]">سيقوم Gemini بقراءة المحتوى وتوليد الأسئلة</p>
            </div>
          </div>
        </div>

        {/* اسم الفصل */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[#111418] text-sm font-bold px-1 text-right">الفصل الدراسي / الموضوع</h3>
          <div className="relative">
            <input 
              type="text" 
              className="w-full h-12 pr-11 rounded-xl bg-white border-[#dbe0e6] focus:border-primary focus:ring-1 focus:ring-primary text-xs text-right"
              placeholder="مثال: الفصل الأول، قوانين الحركة..."
              value={state.settings.chapterName}
              onChange={(e) => onUpdateSettings({ chapterName: e.target.value })}
            />
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#637588] text-xl">auto_stories</span>
          </div>
        </div>

        {/* عدد الأسئلة ومستوى التحدي */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-3">
            <h3 className="text-[#111418] text-sm font-bold px-1 text-right">عدد الأسئلة</h3>
            <div className="relative">
              <input 
                type="number" 
                min="1" 
                max="100"
                className="w-full h-12 pr-11 rounded-xl bg-white border-[#dbe0e6] focus:border-primary focus:ring-1 focus:ring-primary text-xs text-right"
                // الحل: إذا كان الرقم 0 نعرضه كخانة فارغة للسماح بالمسح والكتابة
                value={state.settings.questionCount === 0 ? '' : state.settings.questionCount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    onUpdateSettings({ questionCount: 0 });
                  } else {
                    const parsed = parseInt(val);
                    if (!isNaN(parsed)) {
                      onUpdateSettings({ questionCount: parsed });
                    }
                  }
                }}
              />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#637588] text-xl">format_list_numbered</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-[#111418] text-sm font-bold px-1 text-right">مستوى التحدي</h3>
            <div className="flex w-full h-12 rounded-xl bg-slate-200 p-1">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                <label key={level} className="cursor-pointer flex-1 relative">
                  <input className="peer sr-only" name="difficulty" type="radio" checked={state.settings.difficulty === level} onChange={() => onUpdateSettings({ difficulty: level })} />
                  <div className="flex items-center justify-center h-full rounded-lg text-[10px] font-bold text-[#637588] transition-all peer-checked:bg-white peer-checked:text-primary peer-checked:shadow-sm">
                    {level === 'easy' ? 'سهل' : level === 'medium' ? 'متوسط' : 'صعب'}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* نوع الاختبار */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[#111418] text-sm font-bold px-1 text-right">نوع الاختبار</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'mcq', label: 'اختياري', icon: 'list_alt' },
              { id: 'tf', label: 'صواب/خطأ', icon: 'rule' },
              { id: 'mix', label: 'مختلط', icon: 'dashboard_customize' }
            ].map((type) => (
              <label key={type.id} className="cursor-pointer group">
                <input className="peer sr-only" name="type" type="radio" checked={state.settings.type === type.id} onChange={() => onUpdateSettings({ type: type.id as QuestionType })} />
                <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-[#dbe0e6] bg-white transition-all peer-checked:border-primary peer-checked:bg-blue-50/50 h-24">
                  <span className="material-symbols-outlined text-[#637588] peer-checked:text-primary">{type.icon}</span>
                  <span className="text-[10px] font-bold text-[#111418] peer-checked:text-primary">{type.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* خيارات إضافية */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[#111418] text-sm font-bold px-1 text-right">إعدادات إضافية</h3>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-[#dbe0e6]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">visibility</span>
              <span className="text-xs font-bold text-[#111418]">إظهار مفتاح الحل</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={state.settings.showAnswers} onChange={(e) => onUpdateSettings({ showAnswers: e.target.checked })} />
              <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-[-100%] after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 z-40 max-w-md mx-auto">
        <button 
          onClick={handleStartClick}
          disabled={loading}
          className={`flex w-full items-center justify-center rounded-xl h-12 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover shadow-lg'} text-white text-base font-bold transition-all active:scale-95`}
        >
          {loading ? (
             <span className="animate-spin material-symbols-outlined">sync</span>
          ) : (
            <>
              <span className="ml-2 font-display">تفعيل الخبير الذكي</span>
              <span className="material-symbols-outlined text-xl">auto_awesome</span>
            </>
          )}
        </button>
      </footer>
    </div>
  );
};

export default SettingsPage;
