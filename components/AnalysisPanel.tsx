
import React from 'react';
import { AnalysisResult } from '../types';

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

const AnalysisPanel: React.FC<Props> = ({ result, onReset }) => {
  return (
    <div className="space-y-10 font-sans max-w-5xl mx-auto pb-12 transition-all">
      {/* Dynamic Score Header */}
      <div className="relative overflow-hidden rounded-[3rem] bg-white dark:bg-stone-900 p-10 md:p-16 shadow-2xl border border-white dark:border-stone-800">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-[0.05] text-[15rem] font-black select-none pointer-events-none transform translate-x-20 -translate-y-20">☯</div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 text-gold text-[10px] font-black tracking-widest uppercase">
              Authenticated Digital Decree
            </div>
            <h2 className="text-5xl font-black tracking-tight text-stone-900 dark:text-white">宅邸堪舆气象报告</h2>
            <p className="text-stone-400 dark:text-stone-500 max-w-md font-medium leading-relaxed">
              基于千年堪舆智慧与深度学习算法，为您解析居住空间的能量场分布。
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" className="stroke-stone-100 dark:stroke-stone-800" strokeWidth="12" fill="none" />
                <circle 
                  cx="96" cy="96" r="88" 
                  className="stroke-gold" 
                  strokeWidth="12" 
                  fill="none" 
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - result.score / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="text-center">
                <span className="text-7xl font-black text-stone-900 dark:text-white tracking-tighter">{result.score}</span>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">堪舆总分</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visionary Summary */}
      <div className="rounded-4xl glass p-10 text-center shadow-lg border border-white dark:border-stone-800/50">
        <span className="text-4xl block mb-6">✨</span>
        <p className="text-2xl font-bold text-stone-800 dark:text-stone-200 leading-snug italic italic-serif">
          “{result.summary}”
        </p>
      </div>

      {/* Core Insights Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Wealth Position */}
        <div className="rounded-4xl bg-stone-900 text-stone-100 p-10 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl font-black group-hover:scale-110 transition-transform">财</div>
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-xl">💰</span>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gold">最佳财位 / Wealth</h4>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black tracking-tight">{result.wealthPosition.location}</p>
              <p className="text-stone-400 text-sm font-medium italic leading-relaxed">{result.wealthPosition.suggestion}</p>
            </div>
          </div>
        </div>

        {/* Master Position */}
        <div className="rounded-4xl bg-white dark:bg-stone-900 p-10 shadow-xl border border-white dark:border-stone-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-8xl font-black group-hover:scale-110 transition-transform">山</div>
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xl">🏔️</span>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">最佳主位 / Master</h4>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black tracking-tight dark:text-stone-100">{result.bestBedroom.roomName}</p>
              <p className="text-stone-500 text-sm font-medium italic leading-relaxed">{result.bestBedroom.reason}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analysis Tabs/Cards */}
      <div className="space-y-8">
        <h3 className="text-xl font-black tracking-tight px-2">逐室推演 · 环境解析</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {result.roomAnalysis.map((room, i) => (
            <div key={i} className="rounded-3xl glass p-8 shadow-sm hover:shadow-md transition-all border border-white/50 dark:border-stone-800 group">
              <span className="text-[10px] font-black px-3 py-1 bg-stone-900 dark:bg-gold text-white dark:text-stone-900 rounded-full mb-6 inline-block uppercase tracking-widest">
                {room.roomType}
              </span>
              <p className="text-sm font-bold text-stone-600 dark:text-stone-300 leading-relaxed mb-6">
                {room.evaluation}
              </p>
              <div className="flex items-center gap-3 text-[11px] font-black text-gold dark:text-gold-light opacity-0 group-hover:opacity-100 transition-opacity">
                <span>✦</span>
                <span className="tracking-tight">{room.suggestion}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Elements Table */}
      <div className="rounded-4xl bg-white dark:bg-stone-900 p-10 shadow-xl border border-white dark:border-stone-800 overflow-hidden">
        <h3 className="text-xl font-black mb-8">方位宜忌 · 布局优化</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100 dark:border-stone-800">
                <th className="py-4 px-2 text-[10px] font-black text-stone-400 uppercase tracking-widest">方位</th>
                <th className="py-4 px-2 text-[10px] font-black text-stone-400 uppercase tracking-widest">堪舆动作</th>
                <th className="py-4 px-2 text-[10px] font-black text-stone-400 uppercase tracking-widest">建议细节</th>
              </tr>
            </thead>
            <tbody>
              {result.directionalAdjustments.map((adj, i) => (
                <tr key={i} className="border-b border-stone-50 dark:border-stone-800/50 last:border-0 hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors">
                  <td className="py-6 px-2 text-sm font-black">{adj.direction}</td>
                  <td className="py-6 px-2">
                    <span className={`px-4 py-1 rounded-full text-[10px] font-black ${
                      adj.action === '增加' ? 'bg-green-100 text-green-700' : 
                      adj.action === '移除' ? 'bg-red-100 text-red-700' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {adj.action} {adj.item}
                    </span>
                  </td>
                  <td className="py-6 px-2 text-xs font-medium text-stone-400">{adj.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row gap-6 pt-12 no-print">
        <button 
          onClick={onReset}
          className="flex-1 py-5 rounded-full border-2 border-stone-200 dark:border-stone-800 text-sm font-black hover:bg-stone-50 dark:hover:bg-stone-800 transition-all active:scale-95"
        >
          重新编辑布局
        </button>
        <button 
          onClick={() => window.print()}
          className="flex-[2] py-5 rounded-full bg-stone-900 dark:bg-gold text-white dark:text-stone-900 text-sm font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all tracking-widest"
        >
          保存并下载堪舆报告
        </button>
      </div>
    </div>
  );
};

export default AnalysisPanel;
