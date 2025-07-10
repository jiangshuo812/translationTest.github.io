import React from 'react';

const QuestionCard = ({ question, isActive }) => {
  if (!question) return null;

  return (
    <div className={`card ${isActive ? 'ring-2 ring-primary-500' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-lg">原句</span>
        <span className="text-xs text-gray-400">题号：{question.questionNumber}</span>
      </div>
      <div className="text-gray-900 mb-2">
        {question.question}
      </div>
      <details className="mb-1">
        <summary className="cursor-pointer text-primary-600 font-medium">参考翻译</summary>
        <div className="mt-1 text-gray-700">
          {question.answer || "暂无参考翻译"}
        </div>
      </details>
      <details className="mb-1">
        <summary className="cursor-pointer text-primary-600 font-medium">结构拆解</summary>
        <ul className="mt-1 text-gray-700 text-sm list-disc pl-5">
          <li>主语：{question.question.split(' ')[0]}</li>
          <li>谓语：{question.question.split(' ').slice(1, 3).join(' ')}</li>
          <li>宾语：{question.question.split(' ').slice(3).join(' ')}</li>
        </ul>
      </details>
      <details>
        <summary className="cursor-pointer text-primary-600 font-medium">关键词讲解</summary>
        <ul className="mt-1 text-gray-700 text-sm list-disc pl-5">
          <li>conservation: 保护</li>
          <li>economic: 经济的</li>
          <li>motive: 动机</li>
        </ul>
      </details>
    </div>
  );
};

export default QuestionCard; 