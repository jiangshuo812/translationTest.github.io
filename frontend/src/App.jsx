import React, { useState, useEffect } from 'react';
import QuestionCard from './components/QuestionCard';
import AnswerSection from './components/AnswerSection';
import RecommendSection from './components/RecommendSection';
import QuestionSelector from './components/QuestionSelector';

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gradingResult, setGradingResult] = useState(null);
  const [isGrading, setIsGrading] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // 加载题目数据
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch('http://localhost:3002/api/questions');
        const data = await response.json();
        if (data.success) {
          setQuestions(data.questions);
        }
      } catch (error) {
        console.error('加载题目失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, []);

  // 暂存答案
  const handleSaveAnswer = (answer) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion) {
      setSavedAnswers(prev => ({
        ...prev,
        [currentQuestion.questionNumber]: answer
      }));
      alert('答案已暂存！');
    }
  };

  // 提交批改
  const handleSubmitAnswer = async (question, answer) => {
    setIsGrading(true);
    setGradingResult(null);
    
    try {
      const response = await fetch('http://localhost:3002/api/grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.question,
          userAnswer: answer
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // 解析批改结果
        const result = data.result;
        const scoreMatch = result.match(/得分:\s*([\d.]+)分/);
        const score = scoreMatch ? scoreMatch[1] : '--';
        
        setGradingResult({
          score,
          feedback: result
        });
      } else {
        setGradingResult({
          score: '--',
          feedback: '批改失败，请重试'
        });
      }
    } catch (error) {
      console.error('批改失败:', error);
      setGradingResult({
        score: '--',
        feedback: '网络错误，请检查连接'
      });
    } finally {
      setIsGrading(false);
    }
  };

  // 重置
  const handleReset = () => {
    setGradingResult(null);
  };

  // 选择题目
  const handleQuestionSelect = (question) => {
    const index = questions.findIndex(q => q.questionNumber === question.questionNumber);
    if (index !== -1) {
      setCurrentQuestionIndex(index);
      setGradingResult(null);
    }
  };

  // 通过索引选择题目
  const handleQuestionSelectByIndex = (index) => {
    setCurrentQuestionIndex(index);
    setGradingResult(null);
  };

  // 切换题目
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setGradingResult(null);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setGradingResult(null);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载题目数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 顶部标题栏 */}
      <header className="w-full shadow bg-white py-4 px-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-700">英语翻译题解析系统</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-sm">
            题目 {currentQuestionIndex + 1} / {questions.length}
          </span>
          <span className="text-gray-500 text-sm">Powered by DeepSeek & OpenRouter</span>
        </div>
      </header>

      {/* 主体分屏 */}
      <main className="flex-1 flex overflow-hidden">
        {/* 左侧：原句与解析卡片区 */}
        <section className="w-1/2 h-full overflow-y-auto p-6 space-y-6 bg-gray-100 border-r">
          {/* 题目导航 */}
          <div className="flex justify-between items-center mb-4">
            <button 
              className="btn-secondary px-3 py-1 text-sm"
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              上一题
            </button>
            <div className="flex-1 mx-4">
              <QuestionSelector 
                questions={questions}
                currentQuestionIndex={currentQuestionIndex}
                onQuestionSelect={handleQuestionSelectByIndex}
              />
            </div>
            <button 
              className="btn-secondary px-3 py-1 text-sm"
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
            >
              下一题
            </button>
          </div>

          {/* 题目卡片 */}
          <QuestionCard 
            question={currentQuestion} 
            isActive={true}
          />
        </section>

        {/* 右侧：答题与批改区 */}
        <section className="w-1/2 h-full overflow-y-auto p-6 flex flex-col bg-white">
          <AnswerSection 
            currentQuestion={currentQuestion}
            onSave={handleSaveAnswer}
            onSubmit={handleSubmitAnswer}
            onReset={handleReset}
            gradingResult={gradingResult}
            isGrading={isGrading}
          />
          
          {/* 推荐题区 */}
          <RecommendSection 
            currentQuestion={currentQuestion}
            onQuestionSelect={handleQuestionSelect}
          />
        </section>
      </main>
    </div>
  );
} 