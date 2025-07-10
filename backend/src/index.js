import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// 环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// 中间件
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(rateLimit({ windowMs: 60 * 1000, max: 60 }));

// 路径工具
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../database/translation_questions_with_similar_sentences.json');

// 1. 获取题目数据API
app.get('/api/questions', (req, res) => {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8');
    const questions = JSON.parse(data);
    res.json({ success: true, questions });
  } catch (err) {
    res.status(500).json({ success: false, message: '读取题库失败', error: err.message });
  }
});

// 2. 批改API（openrouter调用，POST）
app.post('/api/grade', async (req, res) => {
  const { question, userAnswer } = req.body;
  if (!question || !userAnswer) {
    return res.status(400).json({ success: false, message: '缺少参数' });
  }
  try {
    const prompt = `
你是一个专业的考研英语翻译题评分专家。你需要评估用户提供的英译中翻译答案，根据官方评分标准给出分数并提供详细反馈。

【评分规则】

每句满分2分，整套试卷5道题共10分
明显扭曲原文意思的答案最多得0.5分
中文错别字满3个扣0.5分，不满3个扣0.25分
每句包含3-4个关键词/词组或特殊句型(各0.5分)，需准确翻译；如果都翻译基本正确则满分。
5.完全直译也可以算大意正确，语句通顺不歪曲原文意思即可。
【评分流程】
1.语句有没有扭曲原意或明显理解错误，如有则不超过0.5分，流程终止。
2.如大意正确，则继续下一步检查。
3.检查词义和句子是否通顺、是否大致符合原文意思；如果词句不通顺，则给0.75-1分，流程终止。
4.如果词句基本通顺，则进行下一步检查。
5.检查是否翻译出所有语法点和关键词；如有翻译错漏，则不超过1.5分。
6.如果翻译出所有语法点和关键词，则根据最终翻译的准确度给出1.75-2分。不考虑语言是否优美，意思正确即可。

【评分讲解】
1.标记学生的得分点和丢分点。
2.即使某得分点学生得分，如果翻译不够准确，仍然给出更好的翻译建议（无需考虑语言是否优美，意思正确即可。）。
3.在得分点和丢分点讲解中解释存在的词汇/词组/重点语法，例如从句类型、介词短语、固定搭配、熟词僻义等，并明确标注。

【评分示例】
示例一：
得分: 2分
得分点分析:
✓ "Those societies came out of the war" - "战争结束时，那些社会" (0.5分)
✓ "with levels of enrollment" - "高校入学率" (0.5分)
✓ "that had been roughly constant at 3-5% of the relevant age groups" - "约为适龄人群的3%-5%" (0.5分)
✓ "during the decades before the war" - "这一水平在二战前数十年基本一致" (0.5分)
评价:
翻译准确。虽然原文没有明确说明是"高校"入学率，但从上下文可以推断，这个补充是合理的，有助于中文读者理解。

示例二：
得分: 1.75分
得分点分析:
✓/✗ "Attempts have been made" - "措施已经被采取" (0.25分)
✓ "to curb this tendency" - "来抑制这种趋势" (0.5分)
✓ "for example" - "例如" (0.5分)
✓ "by trying to incorporate some measure of quality as well as quantity into the assessment of an applicant's papers" - "在评估一位应聘者的文章时，需要同时看重数量与质量" (0.5分)
丢分点解析:
"Attempts have been made"应译为"已经做出了尝试"或"已经有人尝试"，而不是"措施已经被采取"。"Attempts"强调的是尝试性质，而不一定是已经实施的具体措施。

改进建议:
更准确的翻译应该是："已经有人尝试抑制这种趋势，例如，在评估申请者的论文时，试图将质量和数量的一些衡量标准都纳入考虑。"

示例三：
得分: 1.75分
得分点分析:
✓ "There is a great deal of this kind of nonsense" - "存在大量无稽之谈" (0.5分)
✓ "in the medical journals" - "医学期刊中" (0.5分)
✓/✗ "when taken up by broadcasters and the lay press" - "当这些内容被广播公司采用时" (0.25分)
✓ "generates both health scares and short-lived dietary enthusiasms" - "既会引发健康恐慌，也会出现短暂的的饮食习惯热潮" (0.5分)
丢分点解析:
"broadcasters and the lay press"应译为"广播公司和大众媒体/非专业媒体"，而翻译只提到了"广播公司"，遗漏了"the lay press"(大众媒体/非专业媒体)这一重要部分。

翻译中出现重复词"的的"，这是一个小错误。

改进建议:
更准确的翻译应该是："医学期刊中存在大量无稽之谈，当这些内容被广播公司和大众媒体采用时，既会引发健康恐慌，也会出现短暂的饮食习惯热潮。"

原文：${question}
用户答案：${userAnswer}
    `.trim();

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324',
        messages: [
          { role: 'system', content: '你是专业的英语翻译题批改老师。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1024
      })
    });
    const result = await response.json();
    if (result.choices && result.choices[0]) {
      res.json({ success: true, result: result.choices[0].message.content });
    } else {
      res.status(500).json({ success: false, message: 'API返回异常', raw: result });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: '批改失败', error: err.message });
  }
});

// 3. 推荐题API
app.get('/api/recommend', (req, res) => {
  try {
    const { questionId } = req.query;
    const data = fs.readFileSync(dbPath, 'utf-8');
    const questions = JSON.parse(data);
    
    // 查找当前题目
    const currentQuestion = questions.find(q => q.questionNumber === questionId);
    if (!currentQuestion || !currentQuestion.similar_sentences) {
      return res.json({ success: true, data: [] });
    }
    
    // 直接返回相似句数组
    res.json({ success: true, data: currentQuestion.similar_sentences });
  } catch (err) {
    res.status(500).json({ success: false, message: '获取推荐题失败', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`后端服务已启动：http://localhost:${PORT}`);
}); 