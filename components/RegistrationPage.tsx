
import React, { useState, useEffect } from 'react';

interface Props {
  onComplete: (name: string) => void;
}

const RegistrationPage: React.FC<Props> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [hasEnvKey, setHasEnvKey] = useState(true);
  const [hasSelectedKey, setHasSelectedKey] = useState(false);

  useEffect(() => {
    const checkKeyStatus = async () => {
      // 检查环境变量是否有效
      const envKey = process.env.API_KEY;
      const isKeyInvalid = !envKey || envKey === 'undefined' || envKey === '';
      
      if (isKeyInvalid) {
        setHasEnvKey(false);
        const aistudio = (window as any).aistudio;
        if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
          try {
            const selected = await aistudio.hasSelectedApiKey();
            setHasSelectedKey(selected);
          } catch (e) {
            console.error("Error checking key status", e);
          }
        }
      } else {
        setHasEnvKey(true);
      }
    };
    checkKeyStatus();
  }, []);

  const handleSelectKey = async () => {
    setIsSelecting(true);
    try {
      const aistudio = (window as any).aistudio;
      if (aistudio && typeof aistudio.openSelectKey === 'function') {
        await aistudio.openSelectKey();
        // 准则：触发后即假设成功，允许用户继续
        setHasSelectedKey(true);
      } else {
        console.error("aistudio.openSelectKey is not available");
        alert("未检测到法器接口（aistudio bridge）。若在预览环境，请确保已启用 API Key 选择功能。");
      }
    } catch (err) {
      console.error("Failed to open key selector", err);
      alert("唤起法器失败，请稍后再试。");
    } finally {
      setIsSelecting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    // 如果没有环境变量也没有选择过 Key，提示用户
    if (!hasEnvKey && !hasSelectedKey) {
      alert("请先点击下方“启用法器”配置 API Key，否则无法开启推演。");
      return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
      onComplete(name);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#fcfaf7] dark:bg-[#0c0a09] transition-colors duration-1000">
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] border-[1px] border-stone-900 dark:border-gold rounded-full animate-[spin_60s_linear_infinite]" />
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

          {!hasEnvKey && (
            <div className="space-y-3 p-4 bg-stone-100 dark:bg-stone-800/50 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700">
              <p className="text-[10px] font-bold text-stone-500 mb-2">未检测到系统法力源</p>
              <button
                type="button"
                onClick={handleSelectKey}
                disabled={isSelecting}
                className={`w-full py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
                  hasSelectedKey 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-stone-900 text-white dark:bg-gold dark:text-stone-900 hover:scale-[1.02] active:scale-95'
                }`}
              >
                {isSelecting ? '正在启灵...' : (hasSelectedKey ? '✅ 法力源已配置' : '🔑 启用法器 (配置 API Key)')}
              </button>
              <p className="text-[8px] text-stone-400 mt-2">
                需使用已启用计费的 API Key。详见 <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline hover:text-gold">计费文档</a>
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={!name.trim() || isSubmitting || (!hasEnvKey && !hasSelectedKey)}
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
      
      <div className="absolute bottom-12 text-center w-full px-6">
        <p className="text-[11px] font-serif italic text-stone-300 dark:text-stone-800 tracking-widest animate-pulse">
          “ 夫宅者，乃是阴阳之枢纽，人伦之轨模。 ”
        </p>
      </div>
    </div>
  );
};

export default RegistrationPage;
