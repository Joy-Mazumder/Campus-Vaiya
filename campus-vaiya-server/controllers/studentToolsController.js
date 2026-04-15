const https = require('https');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ================================================================
// SHARED AI FALLBACK CHAIN
// Order: Gemini (multiple models) -> Groq -> OpenAI -> Mistral -> Cohere
// Vision fallback: Gemini Vision -> OpenAI Vision (GPT-4o)
// ================================================================

function _httpsPost(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(
      {
        hostname,
        path,
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          if (res.statusCode >= 400) {
            const e = new Error(`HTTP ${res.statusCode}: ${raw.slice(0, 200)}`);
            e.status = res.statusCode;
            return reject(e);
          }
          try {
            resolve(JSON.parse(raw));
          } catch (parseErr) {
            reject(new Error('Invalid JSON response from AI provider'));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function _tryGemini(model, prompt) {
  if (!process.env.GEMINI_API_KEY) { const e = new Error('no key'); e.status = 0; throw e; }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const m = genAI.getGenerativeModel({ model });
  const result = await m.generateContent(prompt);
  return result.response.text();
}

async function _tryGeminiVision(base64Image, mimeType, prompt) {
  if (!process.env.GEMINI_API_KEY) { const e = new Error('no key'); e.status = 0; throw e; }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const m = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await m.generateContent([
    prompt,
    { inlineData: { data: base64Image, mimeType } },
  ]);
  return result.response.text();
}

async function _tryGroq(prompt) {
  if (!process.env.GROQ_API_KEY) { const e = new Error('no key'); e.status = 0; throw e; }
  const json = await _httpsPost(
    'api.groq.com',
    '/openai/v1/chat/completions',
    { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    {
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }
  );
  return json.choices[0].message.content;
}

async function _tryGroqFallback(prompt) {
  if (!process.env.GROQ_API_KEY) { const e = new Error('no key'); e.status = 0; throw e; }
  const json = await _httpsPost(
    'api.groq.com',
    '/openai/v1/chat/completions',
    { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    {
      model: 'mixtral-8x7b-32768',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }
  );
  return json.choices[0].message.content;
}

async function _tryOpenAI(prompt) {
  if (!process.env.OPENAI_API_KEY) { const e = new Error('no key'); e.status = 0; throw e; }
  const json = await _httpsPost(
    'api.openai.com',
    '/v1/chat/completions',
    { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }
  );
  return json.choices[0].message.content;
}

async function _tryOpenAIVision(base64Image, mimeType, prompt) {
  if (!process.env.OPENAI_API_KEY) { const e = new Error('no key'); e.status = 0; throw e; }
  const json = await _httpsPost(
    'api.openai.com',
    '/v1/chat/completions',
    { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    {
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64Image}` },
            },
          ],
        },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }
  );
  return json.choices[0].message.content;
}

async function _tryMistral(prompt) {
  if (!process.env.MISTRAL_API_KEY) { const e = new Error('no key'); e.status = 0; throw e; }
  const json = await _httpsPost(
    'api.mistral.ai',
    '/v1/chat/completions',
    { Authorization: `Bearer ${process.env.MISTRAL_API_KEY}` },
    {
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }
  );
  return json.choices[0].message.content;
}

async function _tryCohere(prompt) {
  if (!process.env.COHERE_API_KEY) { const e = new Error('no key'); e.status = 0; throw e; }
  const json = await _httpsPost(
    'api.cohere.com',
    '/v2/chat',
    { Authorization: `Bearer ${process.env.COHERE_API_KEY}` },
    {
      model: 'command-r-plus',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }
  );
  return json.message.content[0].text;
}

async function callAI(prompt) {
  if (process.env.GEMINI_MODEL) return _tryGemini(process.env.GEMINI_MODEL, prompt);

  const providers = [
    { label: 'gemini-2.0-flash',      fn: () => _tryGemini('gemini-2.0-flash', prompt) },
    { label: 'gemini-2.0-flash-lite', fn: () => _tryGemini('gemini-2.0-flash-lite', prompt) },
    { label: 'gemini-1.5-flash',      fn: () => _tryGemini('gemini-1.5-flash', prompt) },
    { label: 'gemini-1.5-pro',        fn: () => _tryGemini('gemini-1.5-pro', prompt) },
    { label: 'groq-llama-3.3-70b',    fn: () => _tryGroq(prompt) },
    { label: 'groq-mixtral-8x7b',     fn: () => _tryGroqFallback(prompt) },
    { label: 'openai-gpt-4o-mini',    fn: () => _tryOpenAI(prompt) },
    { label: 'mistral-small',         fn: () => _tryMistral(prompt) },
    { label: 'cohere-command-r-plus', fn: () => _tryCohere(prompt) },
  ];

  let lastErr;
  for (const { label, fn } of providers) {
    try {
      const text = await fn();
      console.log(`[AI] success -- ${label}`);
      return text;
    } catch (err) {
      lastErr = err;
      if (!err.status) console.log(`[AI] skipped -- ${label} (no key)`);
      else console.warn(`[AI] failed  -- ${label} (${err.status})`);
    }
  }
  throw lastErr;
}

async function callVisionAI(base64Image, mimeType, prompt) {
  const visionProviders = [
    {
      label: 'gemini-2.0-flash-vision',
      fn: () => _tryGeminiVision(base64Image, mimeType, prompt),
    },
    {
      label: 'openai-gpt-4o-vision',
      fn: () => _tryOpenAIVision(base64Image, mimeType, prompt),
    },
  ];

  let lastErr;
  for (const { label, fn } of visionProviders) {
    try {
      const text = await fn();
      console.log(`[AI Vision] success -- ${label}`);
      return text;
    } catch (err) {
      lastErr = err;
      if (!err.status) console.log(`[AI Vision] skipped -- ${label} (no key)`);
      else console.warn(`[AI Vision] failed  -- ${label} (${err.status})`);
    }
  }
  throw lastErr;
}

function aiError(err, res) {
  const msg = err?.message || '';
  const status = err?.status || 0;
  let userMsg;
  if (msg.includes('API_KEY') || msg.includes('API key') || msg.includes('Unauthorized') || status === 401)
    userMsg = 'AI API key is not configured or invalid.';
  else if (status === 429 || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('rate_limit'))
    userMsg = 'AI is rate-limited right now. Please wait a moment and try again.';
  else if (status === 503 || msg.includes('overloaded') || msg.includes('unavailable'))
    userMsg = 'AI service is temporarily overloaded. Please try again.';
  else
    userMsg = 'AI generation failed. Please try again.';
  res.status(500).json({ message: userMsg });
}

// ================================================================
// 1. MATH WORD PROBLEM SOLVER
// Supports Bangla & English input -- Class 8-12 curriculum
// ================================================================
exports.mathSolver = async (req, res) => {
  try {
    const { problem, level = 'Class 9-10' } = req.body;
    if (!problem?.trim()) return res.status(400).json({ message: 'Problem is required.' });

    const prompt = `
You are an expert math teacher for ${level} students following the Bangladesh NCTB curriculum.
A student has given you this math problem (it may be in Bangla or English):

"${problem}"

Solve it step by step. Format your response in markdown like this:

## Problem Understanding
Briefly restate what the problem is asking (1-2 sentences).

## Solution Steps

**Step 1:** [clearly explain what you are doing]
\`\`\`
[calculation or formula]
\`\`\`

**Step 2:** [next step]
\`\`\`
[calculation]
\`\`\`

(continue as many steps as needed)

## Final Answer
State the final answer clearly. Include units if applicable.

## Key Concept Used
Name the math concept or formula used (e.g., Pythagorean theorem, quadratic formula, simple interest formula). In 1 sentence, explain when this concept is typically applied.

Rules:
- Use simple, clear language suitable for ${level} students
- If the problem is in Bangla, respond in Bangla (but keep math notation in English)
- If the problem is in English, respond in English
- Never skip steps -- show all working
- If the problem is invalid or unsolvable, explain why kindly
    `.trim();

    const result = await callAI(prompt);
    const suggestions = [
      'আমাকে এই ধরনের আরেকটি সমস্যা দাও সমাধান করতে',
      'এই সূত্রটি কোথায় কোথায় ব্যবহার হয়?',
      'এই অধ্যায়ের আরও কঠিন একটি সমস্যা দাও',
      'পরীক্ষায় এই ধরনের প্রশ্নে কোন ভুল বেশি হয়?',
    ];
    res.json({ result, suggestions });
  } catch (err) {
    console.error('MathSolver error:', err?.message);
    aiError(err, res);
  }
};

// ================================================================
// 2. SCIENCE CONCEPT EXPLAINER
// Physics, Chemistry, Biology -- NCTB style
// ================================================================
exports.scienceExplainer = async (req, res) => {
  try {
    const { concept, subject = 'Science', level = 'Class 9-10' } = req.body;
    if (!concept?.trim()) return res.status(400).json({ message: 'Concept is required.' });

    const prompt = `
You are a brilliant ${subject} teacher for ${level} students in Bangladesh, following the NCTB curriculum.
A student wants to understand: "${concept}"

Explain this concept clearly in markdown using this structure:

## ${concept} -- Explanation

### Simple Explanation
Explain in the simplest possible way, as if explaining to a curious 14-year-old. Use Bangla if the concept name is in Bangla, otherwise use English with Bangla explanations where helpful.

### Detailed Explanation
Full explanation with proper scientific accuracy appropriate for ${level}. Include:
- Definition
- Key components or steps (if any)
- Relevant formula or equation (if applicable)

### Real-Life Examples
Give 2-3 real-life examples that a student in Bangladesh would relate to (e.g., rice cooking, fan movement, pond water).

### How It Appears in Exams
List 2-3 common exam question formats for this concept at ${level} level (SSC/board exam style).

### Memory Tips
One memorable trick, mnemonic, or analogy to help the student never forget this concept.

Keep the language friendly and encouraging. Make the student feel smart for asking this question.
    `.trim();

    const result = await callAI(prompt);
    const suggestions = [
      `${concept} সম্পর্কে SSC পরীক্ষার MCQ প্র্যাকটিস দাও`,
      `${concept} এর সাথে সম্পর্কিত অন্য concept গুলো কী?`,
      `${subject} এর কোন অধ্যায়গুলো সবচেয়ে গুরুত্বপূর্ণ SSC তে?`,
      `এই concept টি diagram দিয়ে বোঝাও`,
    ];
    res.json({ result, suggestions });
  } catch (err) {
    console.error('ScienceExplainer error:', err?.message);
    aiError(err, res);
  }
};

// ================================================================
// 3. ENGLISH GRAMMAR FIXER + TRANSLATOR
// SSC/HSC English 2nd Paper focused
// ================================================================
exports.grammarFixer = async (req, res) => {
  try {
    const { text, mode = 'fix' } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Text is required.' });
    if (!['fix', 'translate', 'both'].includes(mode))
      return res.status(400).json({ message: 'Mode must be fix, translate, or both.' });

    let prompt;
    if (mode === 'fix') {
      prompt = `
You are an expert English teacher for SSC/HSC students in Bangladesh.
Fix all grammar, spelling, and sentence structure errors in this English text.

Original text:
"${text}"

Respond in this markdown format:

## Corrected Version
[Write the fully corrected text here]

## Mistakes Found and Explained
List each mistake with:
- Wrong: [wrong part]
  Correct: [corrected part]
  Why: [brief explanation in simple English]

## Overall Assessment
Rate the writing (Beginner / Intermediate / Good) and give 1-2 sentences of encouragement and advice for improvement.
      `.trim();
    } else if (mode === 'translate') {
      prompt = `
You are an expert English teacher for SSC/HSC students in Bangladesh.
The student has written something in Bangla. Translate it into correct, natural English suitable for SSC/HSC level.

Bangla text:
"${text}"

Respond in this markdown format:

## English Translation
[Write the natural English translation here]

## Writing Tips
Give 2-3 tips about the vocabulary or style used in the translation that the student should remember for their SSC/HSC exams.

## Key Vocabulary
List 3-5 important English words used in the translation with their Bangla meanings:
- **word** -- Bangla meaning
      `.trim();
    } else {
      prompt = `
You are an expert English teacher for SSC/HSC students in Bangladesh.
The student has written text in Bangla. Do two things: (1) Translate it to English, (2) Fix any grammar errors if they try writing it themselves.

Bangla text:
"${text}"

Respond in this markdown format:

## English Translation
[Natural English translation of the Bangla text]

## If You Wrote It in English -- Common Mistakes to Avoid
List 2-3 grammar mistakes that students typically make when writing this type of sentence.

## Key Vocabulary to Remember
List 4-5 important English words from this translation:
- **word** -- Bangla meaning -- example sentence
      `.trim();
    }

    const result = await callAI(prompt);
    const suggestions = [
      'আমার paragraph টি আরও উন্নত করে লেখো',
      'SSC English 2nd Paper এর জন্য গুরুত্বপূর্ণ grammar rules কী কী?',
      'এই বিষয়ে একটি model paragraph লিখে দাও',
      'Tense এর common ভুলগুলো কী কী?',
    ];
    res.json({ result, suggestions });
  } catch (err) {
    console.error('GrammarFixer error:', err?.message);
    aiError(err, res);
  }
};

// ================================================================
// 4. HANDWRITTEN NOTES -> DIGITAL + SUMMARY
// Vision fallback: Gemini Vision -> OpenAI Vision (GPT-4o)
// ================================================================
exports.digitizeNotes = async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', subject = '' } = req.body;
    if (!imageBase64) return res.status(400).json({ message: 'Image is required.' });

    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpe?g|gif|webp);base64,/, '');

    const prompt = `
You are an expert at reading handwritten notes and converting them to digital format.
A student has shared a photo of their handwritten ${subject ? subject + ' ' : ''}notes.

Please do the following:

## Digitized Notes
Carefully read ALL the handwritten text in the image and type it out exactly as written. Preserve headings, bullet points, and structure. If any word is unclear, write [unclear] but make your best guess in brackets.

## Summary
Write a clear, concise summary of the notes in 3-5 bullet points. Focus on the most important concepts.

## Key Points to Remember
List the 3-5 most important facts or formulas from these notes.

## Possible Exam Questions
Based on this content, write 3 exam questions a teacher might ask.

Be thorough and accurate. Every word in the notes matters to the student.
    `.trim();

    const result = await callVisionAI(cleanBase64, mimeType, prompt);

    const suggestions = [
      'এই notes গুলো থেকে flashcard বানিয়ে দাও',
      'এই topic এর উপর আরও বিস্তারিত notes লিখে দাও',
      'এই content থেকে MCQ প্র্যাকটিস প্রশ্ন দাও',
      'এই notes এর কোন অংশ বুঝতে সাহায্য করো',
    ];
    res.json({ result, suggestions });
  } catch (err) {
    console.error('DigtizeNotes error:', err?.message);
    aiError(err, res);
  }
};

// ================================================================
// 5. RESEARCH PAPER SUMMARIZER
// PDF text or abstract -> plain language summary
// ================================================================
exports.researchSummarizer = async (req, res) => {
  try {
    const { text, title = '' } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Paper text or abstract is required.' });
    if (text.length > 15000) return res.status(400).json({ message: 'Text too long. Please paste the abstract or a shorter excerpt (max ~3000 words).' });

    const prompt = `
You are an expert academic research assistant helping university students understand complex research papers.
${title ? `Paper Title: "${title}"` : ''}

A student has shared the following research paper text (abstract/excerpt):
---
${text}
---

Explain this research paper in simple, clear language that an undergraduate student can understand. Use this markdown structure:

## What Is This Paper About?
Explain the main topic and purpose in 2-3 simple sentences. No jargon.

## What Problem Does It Solve?
What gap or problem in existing knowledge does this research address? (2-3 sentences)

## How Did They Do It? (Methodology)
Explain the research method in plain language -- what did the researchers actually do?

## What Did They Find? (Key Results)
List the 3-5 most important findings or results in simple bullet points.

## Why Does It Matter? (Significance)
Why is this research important? Who benefits from it? Real-world impact?

## Limitations
What are the weaknesses or limitations of this research? (2-3 points)

## Difficult Terms Explained
Pick 5 technical terms from the text and explain each in one simple sentence:
- **term** -- simple explanation

## Related Topics to Explore
Suggest 3 related topics or papers the student might want to read next.

Keep everything simple, friendly, and encouraging.
    `.trim();

    const result = await callAI(prompt);
    const suggestions = [
      'এই paper এর methodology আরও বিস্তারিত বোঝাও',
      'এই research এর limitations কী কী?',
      'এই topic এ আমি কীভাবে research শুরু করতে পারি?',
      'এই paper cite করার জন্য APA format এ reference দাও',
    ];
    res.json({ result, suggestions });
  } catch (err) {
    console.error('ResearchSummarizer error:', err?.message);
    aiError(err, res);
  }
};

// ================================================================
// 6. ASSIGNMENT PLAGIARISM CHECKER (AI-based similarity analysis)
// ================================================================
exports.plagiarismChecker = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Text is required.' });
    if (text.length < 100) return res.status(400).json({ message: 'Please provide at least a paragraph of text (100+ characters).' });

    const prompt = `
You are an academic integrity assistant. Analyze the following text for signs of potential plagiarism, AI-generated content, and writing quality issues.

Text to analyze:
---
${text}
---

Provide a thorough analysis in this markdown format:

## Originality Assessment

**Estimated Originality Score:** [X]% Original

Provide a realistic estimate based on:
- Writing style consistency
- Phrase naturalness
- Presence of overly formal or generic phrases
- Indicators of copied academic writing

## Potential Red Flags Found
List specific phrases or sentences that appear:
- Suspiciously generic or could be from textbooks
- Written in a different style than surrounding text
- Overly formal or academic (possible copy-paste)

For each flag:
> **Flagged text:** "[excerpt]"
> **Reason:** [why this looks suspicious]

## AI-Generated Content Indicators
List any patterns that suggest AI-generated content (repetitive structure, lack of personal voice, perfect grammar with no natural errors, etc.)

**AI Content Likelihood:** Low / Medium / High

## Writing Style Analysis
- **Consistency:** Is the writing style consistent throughout?
- **Voice:** Does it sound like one person wrote it?
- **Natural Errors:** Are there natural human writing patterns?

## Recommendations
Give 3-4 specific suggestions to make this text more original and reduce plagiarism risk before submission.

## Disclaimer
Note: This is an AI-based analysis for self-checking purposes only. It is not a substitute for professional plagiarism detection tools like Turnitin. Use this to improve your writing before submission.
    `.trim();

    const result = await callAI(prompt);
    const suggestions = [
      'এই text টি আরও original করে rewrite করে দাও',
      'Academic writing এ plagiarism এড়ানোর সঠিক উপায় কী?',
      'Paraphrasing সঠিকভাবে কীভাবে করতে হয়?',
      'Citation এবং quotation এর মধ্যে পার্থক্য কী?',
    ];
    res.json({ result, suggestions });
  } catch (err) {
    console.error('PlagiarismChecker error:', err?.message);
    aiError(err, res);
  }
};

// ================================================================
// 7. LITERATURE REVIEW ASSISTANT
// Research topic -> structured lit review with gap analysis
// ================================================================
exports.literatureReview = async (req, res) => {
  try {
    const { topic, field = '', level = 'undergraduate' } = req.body;
    if (!topic?.trim()) return res.status(400).json({ message: 'Research topic is required.' });

    const prompt = `
You are a senior academic researcher with 15+ years of experience writing systematic literature reviews.
A ${level} student needs help with a literature review on: "${topic}"
${field ? `Field/Discipline: ${field}` : ''}

Write a comprehensive, structured literature review guide in markdown:

## Literature Review: ${topic}

### Overview of the Research Area
Describe the research landscape for this topic -- how it has evolved, key time periods, and major developments (3-4 paragraphs).

### Key Themes and Schools of Thought
Identify 4-5 major themes or theoretical frameworks that appear in the literature on this topic. For each:
- **Theme name**
- Brief description
- Key scholars/researchers associated with it (mention 2-3 real names if known, or note "prominent researchers in this area")

### Key Research Findings (What Research Shows)
Summarize what the existing literature generally agrees upon -- 5-7 bullet points of well-established findings.

### Debates and Contradictions
Identify 3-4 areas where researchers disagree or where findings are inconsistent. Explain each debate briefly.

### Research Gaps Identified
List 4-5 specific gaps in existing literature -- things that have NOT been adequately studied yet. Be specific and actionable.

### Recommended Search Keywords
Provide 10-15 specific search keywords/phrases to find relevant papers on Google Scholar, Scopus, or PubMed.

### How to Structure Your Review
Give a recommended outline structure for a literature review paper on this specific topic (5-7 sections with brief descriptions).

### Pro Tips for ${level} Students
3-4 practical tips specific to writing a literature review on "${topic}".
    `.trim();

    const result = await callAI(prompt);
    const suggestions = [
      `${topic} এর research gap গুলো আরও বিস্তারিত বলো`,
      `${topic} এ PhD করতে চাইলে কোন angle নিতে পারি?`,
      `এই topic এ research proposal কীভাবে লিখতে হয়?`,
      `${topic} এর জন্য research methodology কী হওয়া উচিত?`,
    ];
    res.json({ result, suggestions });
  } catch (err) {
    console.error('LiteratureReview error:', err?.message);
    aiError(err, res);
  }
};

// ================================================================
// 8. RESEARCH GAP FINDER
// Identifies unexplored areas in a research field
// ================================================================
exports.researchGapFinder = async (req, res) => {
  try {
    const { topic, field = '', context = '' } = req.body;
    if (!topic?.trim()) return res.status(400).json({ message: 'Research topic is required.' });

    const prompt = `
You are a world-class research strategist helping students and researchers identify novel, fundable research gaps.
Topic: "${topic}"
${field ? `Field: ${field}` : ''}
${context ? `Additional context from the student: ${context}` : ''}

Analyze this topic deeply and identify genuine research gaps. Structure your response in markdown:

## Research Gap Analysis: ${topic}

### Current State of Research
What do we already know well about "${topic}"? Summarize the established knowledge in 2-3 paragraphs.

### Identified Research Gaps

For each gap below, provide:
**[GAP NAME]**
- The Gap: What specific aspect is understudied or unexplored?
- Why It Matters: Real-world or theoretical significance
- Possible Research Questions: 2 specific research questions you could investigate
- Difficulty Level: Easy / Moderate / Challenging
- Estimated Scope: Suitable for undergraduate thesis / Master's thesis / PhD dissertation

**Gap 1: Geographic/Cultural Context Gap**
[Apply the above structure]

**Gap 2: Methodology Gap**
[Apply the above structure]

**Gap 3: Population/Sample Gap**
[Apply the above structure]

**Gap 4: Technology/Innovation Gap**
[Apply the above structure]

**Gap 5: Longitudinal/Temporal Gap**
[Apply the above structure]

### Most Promising Gap (Top Pick)
Which gap is the most feasible AND impactful for a student researcher? Explain why in 3-4 sentences.

### How to Validate Your Chosen Gap
Step-by-step guide (4-5 steps) to confirm your research gap is genuinely unexplored before you commit to it.

### Key Journals to Target
List 5 relevant academic journals where research on "${topic}" is typically published.
    `.trim();

    const result = await callAI(prompt);
    const suggestions = [
      `Gap 1 নিয়ে research proposal লিখে দাও`,
      `এই topic এ Bangladesh context এ কী কী gap আছে?`,
      `এই research এর জন্য কোন methodology সবচেয়ে ভালো হবে?`,
      `Supervisor কে convince করার জন্য research gap কীভাবে present করবো?`,
    ];
    res.json({ result, suggestions });
  } catch (err) {
    console.error('ResearchGapFinder error:', err?.message);
    aiError(err, res);
  }
};
