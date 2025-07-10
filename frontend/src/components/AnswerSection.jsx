import React, { useState } from 'react';

const AnswerSection = ({ 
  currentQuestion, 
  onSave, 
  onSubmit, 
  onReset, 
  gradingResult,
  isGrading 
}) => {
  const [answer, setAnswer] = useState('');

  const handleSave = () => {
    if (answer.trim()) {
      onSave(answer);
    }
  };

  const handleSubmit = () => {
    if (answer.trim() && currentQuestion) {
      onSubmit(currentQuestion, answer);
    }
  };

  const handleReset = () => {
    setAnswer('');
    onReset();
  };

  return (
    <div className="card flex-1 flex flex-col">
      <h2 className="font-semibold text-lg mb-2">我的翻译答案</h2>
      <textarea 
        className="textarea mb-3" 
        placeholder="请输入你的翻译答案..." 
        rows={5}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={isGrading}
      ></textarea>
      <div className="flex gap-2 mb-3">
        <button 
          className="btn-primary" 
          onClick={handleSave}
          disabled={!answer.trim() || isGrading}
        >
          暂存答案
        </button>
        <button 
          className="btn-secondary" 
          onClick={handleReset}
          disabled={isGrading}
        >
          重置
        </button>
        <button 
          className="btn-success" 
          onClick={handleSubmit}
          disabled={!answer.trim() || !currentQuestion || isGrading}
        >
          {isGrading ? '批改中...' : '提交批改'}
        </button>
      </div>
      <div className="mt-2">
        <h3 className="font-medium text-primary-700 mb-1">批改结果</h3>
        {gradingResult ? (
          <div className="text-gray-700">
            <div className="text-error-600 font-bold mb-2">
              得分：{gradingResult.score || '--'}/2
            </div>
            <div className="text-sm whitespace-pre-wrap">
              {gradingResult.feedback}
            </div>
          </div>
        ) : (
          <div className="text-gray-700">（批改讲解将在此处显示）</div>
        )}
      </div>
    </div>
  );
};

export default AnswerSection; 