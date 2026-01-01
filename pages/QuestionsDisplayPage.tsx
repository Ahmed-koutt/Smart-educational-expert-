
import React from 'react';
// Use namespace import to resolve named export issues
import * as ReactRouterDOM from 'react-router-dom';
import { AppState, Question } from '../types';

const { useNavigate } = ReactRouterDOM;

interface Props {
  state: AppState;
  onSetQuestions: (questions: Question[]) => void;
}

const QuestionsDisplayPage: React.FC<Props> = ({ state, onSetQuestions }) => {
  const navigate = useNavigate();

  const handleDeleteAll = () => {
    if (confirm('هل ترغب في مسح كافة الأسئلة والبدء من جديد؟')) {
      onSetQuestions([]);
      navigate('/');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSavePDF = () => {
    const element = document.getElementById('print-area');
    if (!element) return;
    
    const options = {
      margin: [10, 10, 10, 10],
      filename: `اختبار_${state.settings.chapterName || 'Gemini'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    html2pdf().set(options).from(element).save();
  };

  const handleShare = () => {
    const text = `أسئلة اختبار ذكي تم إنشاؤه بواسطة Gemini:\n${state.questions.map(q => `${q.id}. ${q.text}`).join('\n')}`;
    if (navigator.share) {
      navigator.share({ title: 'اختبار Gemini', text: text }).catch(() => {
        navigator.clipboard.writeText(text);
        alert("تم نسخ الأسئلة للحافظة!");
      });
    } else {
      navigator.clipboard.writeText(text);
      alert("تم نسخ الأسئلة للحافظة!");
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white px-4 h-14 border-b border-slate-200 shadow-sm shrink-0 no-print">
        <div className="flex items-center gap-2">
           <button onClick={() => navigate('/')} className="size-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors" title="العودة للإعدادات">
              <span className="material-symbols-outlined text-slate-600 text-[20px]">tune</span>
           </button>
           <h1 className="text-[13px] font-bold text-slate-800">بنك الأسئلة</h1>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button onClick={() => navigate('/chat')} className="flex h-7 px-3 items-center justify-center rounded-lg text-slate-500 hover:text-primary transition-colors gap-1">
            <span className="material-symbols-outlined text-[16px]">chat</span>
            <span className="text-[10px] font-bold">دردشة</span>
          </button>
          <button className="flex h-7 px-3 items-center justify-center rounded-lg bg-white text-primary shadow-sm gap-1">
            <span className="material-symbols-outlined text-[16px]">quiz</span>
            <span className="text-[10px] font-bold">الأسئلة</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar pb-20" id="print-area">
        
        {/* ترويسة الاختبار (تظهر في الطباعة فقط) */}
        <div className="exam-header hidden print:block">
          <div className="flex justify-between items-start mb-6 border-b-2 border-black pb-4">
            <div className="text-right space-y-1">
              <p className="font-bold text-[14px]">المادة: {state.settings.fileName || 'محتوى تعليمي'}</p>
              <p className="font-bold text-[14px]">الموضوع: {state.settings.chapterName || 'عام'}</p>
            </div>
            <div className="text-center">
              <h2 className="font-black text-[20px] mb-1">اختبار تقييمي ذكي</h2>
              <p className="text-[10px] italic">بواسطة Gemini 3 Pro Education</p>
            </div>
            <div className="text-left space-y-1">
              <p className="font-bold text-[12px]">التاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
              <p className="font-bold text-[12px]">المستوى: {state.settings.difficulty === 'easy' ? 'سهل' : state.settings.difficulty === 'medium' ? 'متوسط' : 'صعب'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-8 border border-black p-4">
            <p className="text-[12px] font-bold">اسم الطالب: ............................................................</p>
            <p className="text-[12px] font-bold">رقم الجلوس: ....................................</p>
          </div>
        </div>

        {/* أدوات التحكم (مخفية في الطباعة) */}
        <div className="grid grid-cols-4 gap-2 no-print">
          <button onClick={handlePrint} className="flex flex-col items-center gap-1 bg-white py-3 rounded-2xl border border-slate-200 hover:border-primary transition-all shadow-sm active:scale-95">
            <span className="material-symbols-outlined text-primary text-[20px]">print</span>
            <span className="text-[10px] font-bold text-slate-600">طباعة</span>
          </button>
          <button onClick={handleSavePDF} className="flex flex-col items-center gap-1 bg-white py-3 rounded-2xl border border-slate-200 hover:border-primary transition-all shadow-sm active:scale-95">
            <span className="material-symbols-outlined text-blue-500 text-[20px]">picture_as_pdf</span>
            <span className="text-[10px] font-bold text-slate-600">تصدير PDF</span>
          </button>
          <button onClick={handleShare} className="flex flex-col items-center gap-1 bg-white py-3 rounded-2xl border border-slate-200 hover:border-primary transition-all shadow-sm active:scale-95">
            <span className="material-symbols-outlined text-green-500 text-[20px]">share</span>
            <span className="text-[10px] font-bold text-slate-600">مشاركة</span>
          </button>
          <button onClick={handleDeleteAll} className="flex flex-col items-center gap-1 bg-white py-3 rounded-2xl border border-slate-200 hover:border-red-400 transition-all shadow-sm active:scale-95">
            <span className="material-symbols-outlined text-red-500 text-[20px]">delete_sweep</span>
            <span className="text-[10px] font-bold text-slate-600">مسح الكل</span>
          </button>
        </div>

        <div className="space-y-4">
          {state.questions.length > 0 ? (
            state.questions.map((q) => (
              <div key={q.id} className="question-card rounded-2xl bg-white p-5 border border-slate-200 shadow-sm transition-all">
                <div className="flex items-center justify-between mb-4 no-print">
                  <span className="flex items-center justify-center size-7 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600">س {q.id}</span>
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold ${q.type === 'mcq' ? 'bg-blue-50 text-primary' : 'bg-purple-50 text-purple-600'}`}>
                    {q.type === 'mcq' ? 'اختياري' : 'صواب / خطأ'}
                  </span>
                </div>
                
                <p className="question-text text-[13px] font-bold text-slate-800 leading-relaxed text-right mb-5">
                  <span className="hidden print:inline-block ml-2">{q.id}) </span>
                  {q.text}
                </p>

                {q.type === 'mcq' ? (
                  <div className="grid gap-2.5">
                    {q.options?.map((opt, idx) => (
                      <div key={idx} className={`option-item p-3.5 rounded-xl border text-[11px] text-right flex items-center justify-between transition-all ${state.settings.showAnswers && opt === q.answer ? 'border-green-400 bg-green-50 text-green-700 font-bold' : 'border-slate-100 bg-slate-50 text-slate-600'}`}>
                        <div className="flex items-center gap-3">
                          <span className="print:inline-block hidden border border-black size-4 rounded-sm"></span>
                          <span>{opt}</span>
                        </div>
                        {state.settings.showAnswers && opt === q.answer && <span className="material-symbols-outlined text-[16px] no-print text-green-600">check_circle</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-3">
                    {['صواب', 'خطأ'].map((opt) => (
                      <div key={opt} className={`flex-1 p-3.5 rounded-xl border text-[11px] text-center transition-all ${state.settings.showAnswers && opt === q.answer ? 'border-green-400 bg-green-50 text-green-700 font-bold' : 'border-slate-100 bg-slate-50 text-slate-600'}`}>
                         <span className="print:inline-block hidden ml-2">( )</span>
                         {opt}
                      </div>
                    ))}
                  </div>
                )}
                
                {state.settings.showAnswers && (
                  <div className="answer-key hidden print:block text-[10px] mt-4 pt-3 border-t border-dotted border-slate-300 italic font-bold">
                    الإجابة الصحيحة: {q.answer}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 opacity-60 no-print">
               <span className="material-symbols-outlined text-5xl mb-4">quiz</span>
               <p className="text-[13px] font-bold">لا توجد أسئلة حالياً</p>
               <button onClick={() => navigate('/')} className="mt-4 bg-primary text-white px-6 py-2 rounded-xl text-[11px] font-bold">ابدأ توليد الأسئلة</button>
            </div>
          )}
        </div>
      </main>
      
      <footer className="p-4 text-center border-t border-slate-100 bg-white shrink-0 no-print">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">Generated by Intelligent Education Expert</p>
      </footer>
    </div>
  );
};

export default QuestionsDisplayPage;
