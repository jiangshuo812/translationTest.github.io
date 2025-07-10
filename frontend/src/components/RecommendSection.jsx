import React, { useState } from 'react';

const RecommendSection = ({ currentQuestion, onQuestionSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleExpand = async () => {
    if (!isExpanded && currentQuestion) {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:3002/api/recommend?questionId=${currentQuestion.questionNumber}`);
        const data = await response.json();
        if (data.success) {
          setRecommendations(data.data);
        }
      } catch (error) {
        console.error('获取推荐题失败:', error);
      } finally {
        setIsLoading(false);
      }
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="mt-6">
      <button 
        className="btn btn-primary" 
        onClick={handleExpand}
        disabled={isLoading}
      >
        {isLoading ? '加载中...' : isExpanded ? '收起推荐' : '展开相似题推荐'}
      </button>
      
      {isExpanded && (
        <div className="mt-4 space-y-3">
          {recommendations.length > 0 ? (
            recommendations.map((rec, index) => (
              <div key={rec.id || index} className="card p-3 cursor-pointer hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">
                      相似句 #{rec.id}
                    </div>
                    <div className="text-sm text-gray-700 mb-2">
                      {rec.text}
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="mr-2">总相似度: {(rec.similarity_scores?.total_similarity * 100).toFixed(1)}%</span>
                      <span className="mr-2">语法: {(rec.similarity_scores?.grammar_similarity * 100).toFixed(1)}%</span>
                      <span>语义: {(rec.similarity_scores?.semantic_similarity * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <button 
                    className="text-primary-600 text-sm ml-2"
                    onClick={() => {
                      // 将相似句转换为题目格式供练习
                      const practiceQuestion = {
                        questionNumber: `similar_${rec.id}`,
                        questionSource: `相似句练习 #${rec.id}`,
                        question: rec.text,
                        answer: "",
                        questionType: "翻译题"
                      };
                      onQuestionSelect(practiceQuestion);
                    }}
                  >
                    练习此题
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center py-4">
              暂无相似题目推荐
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecommendSection; 