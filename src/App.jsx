import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import TimelineItem from './components/TimelineItem';
import { sparks } from './data/sparksData';

// --- 页面 1：主页（系列列表） ---
function SeriesList() {
  const validSparks = sparks.filter(s => s && s.frontmatter && s.frontmatter.series);
  const seriesNames = [...new Set(validSparks.map(s => s.frontmatter.series))];

  if (seriesNames.length === 0) {
    return <div className="mt-8 text-center text-gray-400 py-10 border border-dashed border-gray-200 rounded-xl">暂无系列数据</div>;
  }

  return (
    <div className="mt-8 grid gap-4">
      {seriesNames.map(seriesName => (
        <Link key={seriesName} to={`/series/${encodeURIComponent(seriesName)}`} className="block border border-gray-200 rounded-xl p-6 bg-white hover:shadow-md hover:border-indigo-200 transition-all duration-300 group no-underline">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-serif text-gray-900 group-hover:text-indigo-600 transition-colors m-0">{seriesName}</h2>
            <span className="text-gray-300 group-hover:text-indigo-400">→</span>
          </div>
          <p className="text-sm text-gray-500 mt-2 m-0">共 {validSparks.filter(s => s.frontmatter.series === seriesName).length} 篇随笔</p>
        </Link>
      ))}
    </div>
  );
}

// --- 页面 2：系列详情页（时间线） ---
function SeriesTimeline() {
  const { seriesName } = useParams();
  const decodedSeriesName = decodeURIComponent(seriesName);
  const seriesSparks = sparks.filter(s => s.frontmatter?.series === decodedSeriesName);

  return (
    <div className="animate-fade-in">
      <Link to="/" className="inline-block mb-8 text-sm text-gray-400 hover:text-gray-800 transition-colors no-underline">← 返回系列列表</Link>
      <h2 className="text-2xl font-serif text-gray-900 mb-8 border-b pb-4">{decodedSeriesName}</h2>
      <div className="mt-8">
        {seriesSparks.map((spark, index) => (
          <TimelineItem key={spark.id} frontmatter={spark.frontmatter} isLast={index === seriesSparks.length - 1} />
        ))}
      </div>
    </div>
  );
}

// --- 页面 3：文章正文页 ---
function ArticleDetail() {
  const { filename } = useParams();
  const navigate = useNavigate();
  const article = sparks.find(s => s.frontmatter?.filename === filename);

  if (!article) return <div className="text-center mt-20 text-gray-500">文章未找到。</div>;

  return (
    <div className="animate-fade-in pb-20">
      <button onClick={() => navigate(-1)} className="bg-transparent border-none cursor-pointer text-sm text-gray-400 hover:text-gray-800 mb-8 p-0">
        ← 返回时间线
      </button>
      
      <h1 className="text-3xl font-serif text-gray-900 mb-4 tracking-wide">
        {article.frontmatter.linked_title}
      </h1>
      
      <div className="text-sm text-gray-500 font-mono tracking-wider mb-12 border-b border-gray-100 pb-6">
        · {article.frontmatter.date} | {article.frontmatter.series}
      </div>
      
      <div 
        className="prose-sparks text-[#4a4a4a] leading-[40px] text-[17px] font-wenkai mt-[12px]" 
        dangerouslySetInnerHTML={{ __html: article.content }} 
      />
    </div>
  );
}

// --- 根组件（单按钮循环主题） ---
export default function App() {
  const [bgStyle, setBgStyle] = useState(() => {
    return localStorage.getItem('cyx-sparks-bg') || 'blank';
  });

  useEffect(() => {
    localStorage.setItem('cyx-sparks-bg', bgStyle);
  }, [bgStyle]);

  const bgClasses = {
    blank: '',
    dots: 'bg-journal-dots',
    lines: 'bg-paper-lines',
    margin: 'bg-margin-line'
  };

  // 定义切换顺序和按钮上显示的文字
  const themes = [
    { id: 'blank', label: '纸张：空白' },
    { id: 'dots', label: '纸张：波点' },
    { id: 'lines', label: '纸张：信笺' },
    { id: 'margin', label: '纸张：红线' }
  ];

  // 点击按钮时的循环切换逻辑
  const handleThemeCycle = () => {
    const currentIndex = themes.findIndex(t => t.id === bgStyle);
    const nextIndex = (currentIndex + 1) % themes.length;
    setBgStyle(themes[nextIndex].id);
  };

  // 找到当前选中主题的文字
  const currentThemeLabel = themes.find(t => t.id === bgStyle)?.label;

  return (
    <BrowserRouter basename="/CYX-sparks">
      <div className={`min-h-screen bg-[#FAFAFA] transition-colors duration-500 py-20 px-6 ${bgClasses[bgStyle]}`}>
        
        {/* 🌟 右上角的单按钮切换器 */}
        <div className="fixed top-6 right-6 md:top-10 md:right-10 z-50">
          <button
            onClick={handleThemeCycle}
            className="text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-white/80 text-gray-500 hover:text-gray-800 hover:border-gray-400 backdrop-blur-sm transition-all cursor-pointer flex items-center gap-2 shadow-sm select-none"
            title="点击切换背景纸张"
          >
            <span className="text-[14px]">✨</span>
            <span className="w-16 text-left">{currentThemeLabel}</span>
          </button>
        </div>

        <div className="max-w-2xl mx-auto relative z-10">
          <header className="mb-12">
            <h1 className="text-3xl font-serif text-gray-900 tracking-widest mb-2">CYX-随笔集</h1>
            <p className="text-sm text-gray-500 tracking-wider">灵感、碎碎念与思想的寄存处。</p>
          </header>

          <Routes>
            <Route path="/" element={<SeriesList />} />
            <Route path="/series/:seriesName" element={<SeriesTimeline />} />
            <Route path="/articles/:filename" element={<ArticleDetail />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}