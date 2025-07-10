import React, { useState, useRef, useEffect } from 'react';

const QuestionSelector = ({ questions, currentQuestionIndex, onQuestionSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentQuestion = questions[currentQuestionIndex];
  const currentQuestionNumber = currentQuestion?.questionNumber || '';

  const handleSelect = (index) => {
    onQuestionSelect(index);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        <span className="text-gray-700">{currentQuestionNumber}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {questions.map((question, index) => (
            <button
              key={question.questionNumber}
              onClick={() => handleSelect(index)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                index === currentQuestionIndex ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
              }`}
            >
              {question.questionNumber}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionSelector; 