
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppState, Question } from '../types';

interface Props {
  state: AppState;
  onSetQuestions: (questions: Question[]) => void;
}

const QuestionsDisplayPage: React.FC<Props> = ({ state, onSetQuestions }) => {
  const navigate = useNavigate();

  const handleDeleteAll = () => {
    if (confirm('هل ترغب حقاً في مسح كافة الأسئلة؟')) {
      onSetQuestions([]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSavePDF = () => {
    // نستخدم window.print() لأنه أفضل في التعامل مع CSS المخصص للطباعة @media print
    // لكن يمكننا أيضاً استخدام html2pdf إذا رغب المستخدم في تجربة تحميل مباشرة
    if (window.confirm('سيتم فتح نافذة الطباعة، يرجى اختيار "حفظ كملف PDF" من قائمة الطابعات للحصول على أفضل جودة.')) {
      handlePrint();
    }
  };

  const handleShare = () => {
    const text = `أسئلة اختبار من الخبير التعليمي Gemini:\n${state.questions.map(q => `${q.id}. ${q.text}`).join('\n')}`;
    if (navigator.share) {
      navigator.share({
        title: 'أسئلة اختبار Gemini التعليمي',
        text: text,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      alert("تم نسخ الأسئلة إلى الحافظة بنجاح!");
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white px-4 py-3 border-b border-slate-200 shadow-sm shrink-0 no-print">
        <div className="flex items-center gap-2">
           <button onClick={() => navigate('/')} className="size-8 flex items-center justify-center rounded-full hover:bg-slate-100">
              <span className="material-symbols-outlined text-slate-600">arrow_forward</span>
           </button>
           <h1 className="text-sm font-bold text-slate-800">بنك الأسئلة</h1>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button onClick={() => navigate('/chat')} className="flex h-8 w-10 items-center justify-center rounded-lg text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">chat</span>
          </button>
          <button className="flex h-8 w-10 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
            <span className="material-symbols-outlined text-[18px]">quiz</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar pb-10" id="print-area">
        
        {/* ترويسة الاختبار الرسمية (تظهر فقط في الطباعة/PDF) */}
        <div className="exam-header">
          <div className="flex justify-between items-center mb-6">
            <div className="text-right space-y-1">
              <p className="font-bold text-lg">الموضوع: {state.settings.chapterName || 'عام'}</p>
              <p className="text-sm font-bold">المستوى: {state.settings.difficulty === 'easy' ? 'سهل' : state.settings.difficulty === 'medium' ? 'متوسط' : 'صعب'}</p>
            </div>
            <div className="text-center">
              <p className="font-black text-2xl border-b-4 border-black pb-1 mb-1">اختبار تعليمي ذكي</p>
              <p className="text-xs italic">تم إنشاؤه بواسطة الخبير التعليمي Gemini 3 Pro</p>
            </div>
            <div className="text-left space-y-1">
              <p className="text-sm font-bold">التاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
              <p className="text-sm font-bold">الزمن: ساعة واحدة</p>
            </div>
          </div>
          
          <div className="border-2 border-black p-4 grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-2">
              <span className="font-bold">اسم الطالب:</span>
              <span className="border-b border-dotted border-black flex-1 min-w-[200px]">......................................................</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">رقم الجلوس:</span>
              <span className="border-b border-dotted border-black flex-1">...................</span>
            </div>
          </div>
          <div className="flex items-center justify-center mb-6">
              <div className="score-box">
                <span className="font-bold">الدرجة النهائية:</span>
                <span className="text-2xl font-black ml-4"> / {state.questions.length * 2}</span>
              </div>
          </div>
          <div className="text-right font-bold underline mb-6 text-xl">أجب عن جميع الأسئلة الآتية:</div>
        </div>

        {/* أزرار التحكم (مخفية في الطباعة) */}
        <div className="grid grid-cols-4 gap-2 no-print">
          <button onClick={handlePrint} className="flex flex-col items-center gap-1.5 bg-white p-2.5 rounded-xl border border-slate-200 hover:border-primary transition-all shadow-sm group">
            <span className="material-symbols-outlined text-primary text-lg group-hover:scale-110 transition-transform">print</span>
            <span className="text-[10px] font-bold text-slate-600">طباعة</span>
          </button>
          <button onClick={handleSavePDF} className="flex flex-col items-center gap-1.5 bg-white p-2.5 rounded-xl border border-slate-200 hover:border-primary transition-all shadow-sm group">
            <span className="material-symbols-outlined text-blue-500 text-lg group-hover:scale-110 transition-transform">picture_as_pdf</span>
            <span className="text-[10px] font-bold text-slate-600">حفظ PDF</span>
          </button>
          <button onClick={handleShare} className="flex flex-col items-center gap-1.5 bg-white p-2.5 rounded-xl border border-slate-200 hover:border-primary transition-all shadow-sm group">
            <span className="material-symbols-outlined text-green-500 text-lg group-hover:scale-110 transition-transform">share</span>
            <span className="text-[10px] font-bold text-slate-600">مشاركة</span>
          </button>
          <button onClick={handleDeleteAll} className="flex flex-col items-center gap-1.5 bg-white p-2.5 rounded-xl border border-slate-200 hover:border-red-400 transition-all shadow-sm group">
            <span className="material-symbols-outlined text-red-500 text-lg group-hover:scale-110 transition-transform">delete_sweep</span>
            <span className="text-[10px] font-bold text-slate-600">مسح الكل</span>
          </button>
        </div>

        <div className="space-y-4">
          {state.questions.length > 0 ? (
            state.questions.map((q) => (
              <div key={q.id} className="question-card rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3 no-print">
                  <span className="flex items-center justify-center size-7 rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">السؤال #{q.id}</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${q.type === 'mcq' ? 'bg-blue-50 text-primary' : 'bg-purple-50 text-purple-600'}`}>
                    {q.type === 'mcq' ? 'اختياري' : 'صواب / خطأ'}
                  </span>
                </div>
                
                <p className="question-text text-sm font-bold text-slate-800 leading-7 text-right mb-5">
                  <span className="hidden print:inline-block ml-2">{q.id}) </span>
                  {q.text}
                </p>

                {q.type === 'mcq' ? (
                  <div className="grid gap-3">
                    {q.options?.map((opt, idx) => (
                      <div key={idx} className={`option-item p-4 rounded-xl border text-[12px] text-right flex items-center justify-between transition-all ${state.settings.showAnswers && opt === q.answer ? 'border-green-400 bg-green-50 text-green-700 font-bold' : 'border-slate-100 bg-slate-50 text-slate-600'}`}>
                        <div className="flex items-center gap-4">
                          <span className="print:inline-block hidden border border-black size-5 rounded-sm ml-2"></span>
                          <span>{opt}</span>
                        </div>
                        {state.settings.showAnswers && opt === q.answer && <span className="material-symbols-outlined text-sm no-print">check_circle</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-4">
                    {['صواب', 'خطأ'].map((opt) => (
                      <div key={opt} className={`flex-1 p-4 rounded-xl border text-[12px] text-center transition-all ${state.settings.showAnswers && opt === q.answer ? 'border-green-400 bg-green-50 text-green-700 font-bold' : 'border-slate-100 bg-slate-50 text-slate-600'}`}>
                         <span className="print:inline-block hidden ml-3">( )</span>
                         {opt}
                      </div>
                    ))}
                  </div>
                )}

                {/* مفتاح الحل للطباعة */}
                {state.settings.showAnswers && (
                  <div className="answer-key hidden print:block text-[11pt] mt-4 italic font-bold">
                    * الإجابة الصحيحة: {q.answer}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 opacity-50 no-print">
               <span className="material-symbols-outlined text-6xl mb-4">quiz</span>
               <p className="text-sm font-bold">لا يوجد أسئلة حالياً، ابدأ بإنشاء بعضها من الإعدادات</p>
               <button onClick={() => navigate('/')} className="mt-4 text-primary font-bold hover:underline">الذهاب للإعدادات</button>
            </div>
          )}
        </div>
        
        {/* عبارة ختامية للطباعة */}
        <div className="hidden print:block text-center mt-16 font-bold border-t-2 border-black pt-6 text-lg italic">
           --- انتهت الأسئلة، تمنياتنا لكم بالتوفيق والنجاح ---
        </div>
      </main>
      
      <footer className="p-4 text-center border-t border-slate-100 bg-white shrink-0 no-print">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Powered by AI - Gemini 3 Pro Education Edition</p>
      </footer>
    </div>
  );
};

export default QuestionsDisplayPage;
