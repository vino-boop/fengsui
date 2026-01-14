
import React, { useState } from 'react';

interface Props {
  onComplete: (name: string) => void;
}

const RegistrationPage: React.FC<Props> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    // 模拟一个庄严的加载过程
    setTimeout(() => {
      onComplete(name);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#fcfaf7] dark:bg-[#0c0a09] transition-colors duration-1000">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] border-[1px] border-stone-900 dark:border-gold rounded-full animate-[spin_60s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] border-[1px] border-stone-900 dark:border-gold rounded-full animate-[spin_40s_linear_infinite_reverse] opacity-50" />
      </div>

      <div className={`max-w-md w-full glass p-10 md:p-16 rounded-[3rem] apple-shadow text-center space-y-10 transition-all duration-1000 ${isSubmitting ? 'scale-90 opacity-0 blur-lg' : 'scale-100 opacity-100 blur-0'}`}>
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-stone-900 dark:bg-gold flex items-center justify-center text-3xl shadow-2xl transition-transform hover:rotate-[360deg] duration-1000">
            <span className="text-white dark:text-stone-900">☯</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tighter text-stone-900 dark:text-gold-light">缘起 · 登科</h1>
            <p className="text-[10px] font-bold text-stone-400 dark:text-gold/40 uppercase tracking-[0.3em]">Identity Verification</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-stone-400 dark:text-gold/30 uppercase tracking-widest block">请输入您的名号 / DISCIPLES NAME</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：青灯居士"
              className="w-full bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-800 focus:border-stone-900 dark:focus:border-gold px-6 py-4 rounded-2xl text-center text-lg font-black outline-none transition-all placeholder:text-stone-300 dark:placeholder:text-stone-700"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="w-full py-5 bg-stone-900 dark:bg-gold text-white dark:text-stone-900 rounded-full font-black text-sm tracking-[0.4em] uppercase shadow-xl hover:scale-[1.03] active:scale-95 disabled:opacity-30 disabled:grayscale transition-all"
          >
            {isSubmitting ? '正在启灵...' : '进入局中'}
          </button>
        </form>

        <p className="text-[9px] font-medium text-stone-400 dark:text-stone-600 leading-relaxed">
          * 您的名号将用于生成专属堪舆推演报告<br />
          数据将通过灵枢加密引擎进行处理
        </p>
      </div>
      
      {/* 底部禅语 */}
      <div className="absolute bottom-12 text-center w-full px-6">
        <p className="text-[11px] font-serif italic text-stone-300 dark:text-stone-800 tracking-widest animate-pulse">
          “ 夫宅者，乃是阴阳之枢纽，人伦之轨模。 ”
        </p>
      </div>
    </div>
  );
};

export default RegistrationPage;
