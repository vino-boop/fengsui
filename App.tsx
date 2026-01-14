
import React, { useState, useEffect } from 'react';
import { FurnitureItem, AnalysisResult, Room, CompassConfig } from './types';
import LayoutEditor from './components/LayoutEditor';
import AnalysisPanel from './components/AnalysisPanel';
import CompassConfiguration from './components/CompassConfiguration';
import RegistrationPage from './components/RegistrationPage';
import { analyzeLayout } from './services/geminiService';
import { ANALYSIS_STEPS } from './constants';

const App: React.FC = () => {
  const [userName, setUserName] = useState<string>('');
  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomWidth, setRoomWidth] = useState(12);
  const [roomHeight, setRoomHeight] = useState(9);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  
  const [appState, setAppState] = useState<'onboarding' | 'editor' | 'compass' | 'analyzing' | 'result'>('onboarding');
  const [analysisStep, setAnalysisStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
    
    // 检查本地存储中是否有用户信息
    const savedName = localStorage.getItem('zen_user_name');
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  const toggleDarkMode = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    let interval: any;
    if (appState === 'analyzing') {
      interval = setInterval(() => {
        setAnalysisStep(prev => (prev + 1) % ANALYSIS_STEPS.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [appState]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleStartConfig = () => {
    if (rooms.length === 0 && items.length === 0) {
      setError("请先绘制房间布局或添加堪舆标识");
      return;
    }
    setError(null);
    setAppState('compass');
  };

  const handleOnboardingComplete = (name: string) => {
    setUserName(name);
    localStorage.setItem('zen_user_name', name);
    setAppState('editor');
  };

  return (
    <div className="min-h-screen pb-24 transition-colors duration-500 overflow-x-hidden text-stone-900 dark:text-stone-100">
      {appState === 'onboarding' && <RegistrationPage onComplete={handleOnboardingComplete} />}

      {/* Apple Style Glass Header */}
      <header className={`fixed top-0 left-0 right-0 z-[100] px-6 py-4 transition-all duration-1000 ${appState === 'onboarding' ? 'translate-y-[-100%]' : 'translate-y-0'}`}>
        <div className="max-w-7xl mx-auto glass rounded-full px-8 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-stone-900 dark:bg-gold flex items-center justify-center text-xl shadow-lg transition-transform hover:rotate-12">
               <span className="text-white dark:text-stone-900">☯</span>
             </div>
             <div>
               <h1 className="text-lg font-black tracking-tight dark:text-gold-light">灵枢 · 风水局</h1>
               <p className="text-[8px] font-bold text-stone-500 dark:text-gold/40 uppercase tracking-[0.2em]">Zen Intelligence Engine</p>
             </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end mr-2">
               <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">当前缘主</span>
               <span className="text-[10px] font-black text-stone-900 dark:text-gold">{userName || '未登科'}</span>
            </div>
            <button 
              onClick={toggleDarkMode}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
            >
              {darkMode ? "🌙" : "☀️"}
            </button>
            <div className="h-6 w-[1px] bg-stone-200 dark:bg-stone-800 mx-1" />
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="blueprint-upload" />
            <label htmlFor="blueprint-upload" className="text-xs font-bold px-4 py-2 rounded-full hover:bg-stone-200/50 dark:hover:bg-stone-800 cursor-pointer transition-colors">
              {uploadedImage ? '更换图纸' : '导入图纸'}
            </label>
          </div>
        </div>
      </header>

      <main className={`max-w-7xl mx-auto px-6 pt-32 pb-12 transition-all duration-1000 ${appState === 'onboarding' ? 'opacity-0 blur-xl scale-110' : 'opacity-100 blur-0 scale-100'}`}>
        {/* Step Indicator */}
        {appState !== 'result' && appState !== 'analyzing' && appState !== 'onboarding' && (
          <div className="flex justify-center mb-12">
            <div className="inline-flex glass rounded-full p-1.5 gap-2 shadow-inner border-stone-200 dark:border-stone-800">
              {[
                { s: 'editor', n: '测绘标识' },
                { s: 'compass', n: '罗盘立极' }
              ].map((step, i) => (
                <button 
                  key={step.s}
                  disabled={step.s === 'compass' && appState === 'editor'}
                  className={`px-6 py-2 rounded-full text-xs font-black transition-all ${
                    appState === step.s 
                    ? 'bg-stone-900 dark:bg-gold text-white dark:text-stone-900 shadow-md scale-[1.02]' 
                    : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 opacity-60'
                  }`}
                >
                  {i+1}. {step.n}
                </button>
              ))}
            </div>
          </div>
        )}

        {appState === 'editor' && (
          <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
            <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] p-4 apple-shadow border border-stone-100 dark:border-stone-800">
              <LayoutEditor 
                items={items} setItems={setItems} 
                rooms={rooms} setRooms={setRooms}
                roomWidth={roomWidth} setRoomWidth={setRoomWidth}
                roomHeight={roomHeight} setRoomHeight={setRoomHeight}
                backgroundImage={uploadedImage} 
                darkMode={darkMode}
              />
            </div>

            <div className="flex flex-col items-center gap-6">
              <button 
                onClick={handleStartConfig}
                className="group relative px-12 py-5 bg-stone-900 dark:bg-gold rounded-full text-white dark:text-stone-900 font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-stone-200 dark:shadow-gold/10"
              >
                下一步：立极定方
                <span className="ml-3 transition-transform group-hover:translate-x-1 inline-block">→</span>
              </button>
              {error && <p className="text-red-500 text-xs font-bold animate-bounce">{error}</p>}
            </div>
          </div>
        )}

        {appState === 'compass' && (
          <CompassConfiguration 
            rooms={rooms} items={items} 
            roomWidth={roomWidth} roomHeight={roomHeight}
            backgroundImage={uploadedImage}
            onBack={() => setAppState('editor')}
            onConfirm={async (config) => {
              setError(null);
              setAppState('analyzing');
              try {
                // 将用户名合并到配置中
                const fullConfig = { ...config, userName };
                const report = await analyzeLayout(items, rooms, roomWidth, roomHeight, fullConfig, uploadedImage || undefined);
                setResult(report);
                setAppState('result');
              } catch (err) {
                const errMsg = err instanceof Error ? err.message : "测算引擎未知故障";
                setError(errMsg);
                setAppState('compass');
              }
            }}
          />
        )}

        {appState === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-48 space-y-12">
            <div className="relative w-40 h-40">
              <div className="absolute inset-0 border-8 border-stone-200 dark:border-stone-800 rounded-full opacity-30"></div>
              <div className="absolute inset-0 border-8 border-stone-800 dark:border-gold border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-5xl float-animation">☯</div>
            </div>
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-black text-stone-800 dark:text-gold tracking-tight">正在为 {userName} 观象理气</h2>
              <p className="text-sm font-bold text-stone-400 dark:text-gold/40 tracking-widest uppercase animate-pulse">{ANALYSIS_STEPS[analysisStep]}</p>
            </div>
          </div>
        )}

        {appState === 'result' && result && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <AnalysisPanel result={result} onReset={() => setAppState('editor')} />
          </div>
        )}
      </main>

      {/* 底部错误提示条 */}
      {error && appState === 'compass' && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl shadow-xl flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-widest mb-1">推演失败</p>
              <p className="text-[11px] leading-relaxed opacity-80">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 font-bold">✕</button>
          </div>
        </div>
      )}

      <footer className={`fixed bottom-6 left-1/2 -translate-x-1/2 glass px-6 py-2 rounded-full text-[10px] font-bold text-stone-400 dark:text-gold/30 tracking-widest uppercase z-50 transition-opacity duration-1000 ${appState === 'onboarding' ? 'opacity-0' : 'opacity-100'}`}>
        AI Feng Shui Master · Professional Edition V3.0
      </footer>
    </div>
  );
};

export default App;
