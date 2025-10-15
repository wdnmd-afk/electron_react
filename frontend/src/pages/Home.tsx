import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
          🚀 Electron TS 学习平台
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          React 18 + TypeScript + Tailwind CSS + Vite
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold mb-2">课程中心</h2>
            <p className="text-gray-600">50+ 前端开发课程</p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📝</div>
            <h2 className="text-2xl font-semibold mb-2">智能笔记</h2>
            <p className="text-gray-600">Markdown 实时同步</p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">⚡</div>
            <h2 className="text-2xl font-semibold mb-2">编程练习</h2>
            <p className="text-gray-600">1000+ 交互题目</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;