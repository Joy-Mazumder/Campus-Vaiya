const GPA = require('../models/GPA');
const User = require('../models/User');
const PDFDocument = require('pdfkit');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ================================================================
// HELPERS
// ================================================================
const W = 595.28; // A4 width in pts
const H = 841.89; // A4 height in pts
const M = 55;     // page margin

const drawHRule = (doc, y, color = '#cccccc', lw = 0.8) => {
  doc.save().moveTo(M, y).lineTo(W - M, y)
     .lineWidth(lw).strokeColor(color).stroke().restore();
};

const pageFooter = (doc, text) => {
  // H - 45 = 796.89 which is PAST the bottom margin (H - M = 786.89).
  // PDFKit sees this as overflow and adds a blank page before drawing.
  // Fix: draw inside the content area at H - M - 6 = 780.89.
  const footerY = H - M - 6;
  doc.fontSize(8).fillColor('#aaaaaa')
     .text(text, M, footerY, { align: 'center', width: W - M * 2, lineBreak: false });
};

// FIX 1: embedLogo now accepts startY so the image is always placed
// at the correct position, not wherever doc.y happens to be.
// Returns the Y position right below the image so callers can continue from there.
const embedLogo = (doc, b64, startY, targetW = 120) => {
  if (!b64) return startY;
  try {
    const data = b64.replace(/^data:image\/(png|jpe?g|gif);base64,/, '');
    const buf = Buffer.from(data, 'base64');
    const x = (W - targetW) / 2;
    doc.image(buf, x, startY, { width: targetW });
    // doc.y is updated by PDFKit to bottom of image; capture it
    return doc.y + 8;
  } catch (e) {
    console.error('Logo embed error:', e.message);
    return startY;
  }
};

// ================================================================
// 1.  LAB REPORT GENERATOR
// ================================================================
exports.generateLabReport = async (req, res) => {
  try {
    const {
      experimentName, experimentNo, date,
      studentName, studentId, department, course, courseCode, instructor,
      objective, apparatus, procedure, observation, dataTable, discussion, conclusion,
      style = 'classic', logoBase64
    } = req.body;

    const instName = req.user?.institution?.name || 'CampusVaiya Academics';
    const safeName = (experimentName || 'Report').replace(/\s+/g, '_');

    const doc = new PDFDocument({ margin: M, size: 'A4', autoFirstPage: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Lab_Report_${safeName}.pdf`);
    doc.pipe(res);

    // ── COVER PAGE ───────────────────────────────────────────────
    _drawCover(doc, {
      style, instName, logoBase64,
      title: experimentName || 'Lab Experiment',
      subtitle: experimentNo ? `Experiment No. ${experimentNo}` : null,
      rows: [
        ['Student Name', studentName || ''],
        ['Student ID',   studentId   || ''],
        ['Department',   department  || ''],
        ['Course',       course ? `${course}${courseCode ? ` (${courseCode})` : ''}` : null],
        ['Submitted To', instructor  || ''],
        ['Date',         date || new Date().toLocaleDateString()],
      ].filter(r => r[1]),
      docType: 'LABORATORY REPORT'
    });

    // ── CONTENT PAGES — only for non-empty sections ──────────────
    const sections = [
      { title: 'OBJECTIVE',             content: objective   },
      { title: 'APPARATUS / MATERIALS', content: apparatus   },
      { title: 'PROCEDURE',             content: procedure   },
      { title: 'OBSERVATION',           content: observation },
      { title: 'DATA TABLE',            content: dataTable   },
      { title: 'DISCUSSION',            content: discussion  },
      { title: 'CONCLUSION',            content: conclusion  },
    ].filter(s => s.content && s.content.trim() !== '');

    sections.forEach((section, idx) => {
      doc.addPage();

      // Running header — draw at fixed absolute position
      doc.fontSize(8).font('Helvetica').fillColor('#999999')
         .text(`${instName}  ·  Lab Report: ${experimentName || ''}`, M, 28, { align: 'right', width: W - M * 2 });
      drawHRule(doc, 42, '#e0e0e0', 0.5);

      // Body starts at fixed Y — no cursor drift
      const bodyTop = 58;

      _drawSectionHeading(doc, section.title, style, bodyTop);

      doc.fontSize(11).font('Helvetica').fillColor('#1a1a2e')
         .text(section.content, M, doc.y, { align: 'justify', lineGap: 3, width: W - M * 2 });

      pageFooter(doc, `${experimentName || 'Lab Report'}  ·  Page ${idx + 2}`);
    });

    doc.end();
  } catch (err) {
    console.error('Lab report error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'PDF generation failed', detail: err.message });
  }
};

// ================================================================
// 2.  COVER PAGE GENERATOR
// ================================================================
exports.generateCoverPage = async (req, res) => {
  try {
    const {
      title, subtitle, studentName, studentId, department,
      course, courseCode, instructor, institution, date,
      style = 'classic', logoBase64
    } = req.body;

    const instName = institution || req.user?.institution?.name || 'CampusVaiya Academics';

    const doc = new PDFDocument({ margin: M, size: 'A4', autoFirstPage: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Cover_${(title || 'Page').replace(/\s+/g, '_')}.pdf`);
    doc.pipe(res);

    _drawCover(doc, {
      style, instName, logoBase64,
      title: title || 'Document Title',
      subtitle,
      rows: [
        ['Submitted By', studentName || ''],
        ['Student ID',   studentId   || ''],
        ['Department',   department  || ''],
        ['Course',       course ? `${course}${courseCode ? ` (${courseCode})` : ''}` : null],
        ['Submitted To', instructor  || ''],
        ['Date',         date || new Date().toLocaleDateString()],
      ].filter(r => r[1]),
      docType: null
    });

    doc.end();
  } catch (err) {
    console.error('Cover page error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Cover page generation failed' });
  }
};

// ================================================================
// 3.  ASSIGNMENT GENERATOR
// ================================================================
exports.generateAssignment = async (req, res) => {
  try {
    const {
      title, subject, courseCode, instructor,
      studentName, studentId, department, institution, date,
      content, style = 'classic', includeLines, logoBase64
    } = req.body;

    const instName = institution || req.user?.institution?.name || 'CampusVaiya Academics';

    const doc = new PDFDocument({ margin: M, size: 'A4', autoFirstPage: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Assignment_${(title || 'doc').replace(/\s+/g, '_')}.pdf`);
    doc.pipe(res);

    // Cover
    _drawCover(doc, {
      style, instName, logoBase64,
      title: title || 'Assignment',
      subtitle: subject ? `${subject}${courseCode ? ` — ${courseCode}` : ''}` : null,
      rows: [
        ['Submitted By', studentName || ''],
        ['Student ID',   studentId   || ''],
        ['Department',   department  || ''],
        ['Submitted To', instructor  || ''],
        ['Date',         date || new Date().toLocaleDateString()],
      ].filter(r => r[1]),
      docType: 'ASSIGNMENT SUBMISSION'
    });

    // Content page (only if body provided)
    if (content && content.trim()) {
      doc.addPage();

      // Header at fixed position
      doc.fontSize(8).font('Helvetica').fillColor('#999999')
         .text(`${instName}  ·  ${title || 'Assignment'}`, M, 28, { align: 'right', width: W - M * 2 });
      drawHRule(doc, 42, '#e0e0e0', 0.5);

      let y = 58;

      doc.fontSize(16).font('Helvetica-Bold').fillColor('#0f172a')
         .text(title || 'Assignment', M, y, { align: 'center', width: W - M * 2 });
      y = doc.y + 6;
      drawHRule(doc, y, '#e0e0e0', 0.5);
      y += 14;

      doc.fontSize(11.5).font('Helvetica').fillColor('#1e293b')
         .text(content, M, y, { align: 'justify', lineGap: 4, width: W - M * 2 });

      // Optional handwriting lines
      if (includeLines === 'true' || includeLines === true) {
        doc.moveDown(2);
        let ly = doc.y;
        while (ly < H - 70) {
          drawHRule(doc, ly, '#d1d5db', 0.4);
          ly += 24;
        }
      }

      pageFooter(doc, `${title || 'Assignment'}  ·  Page 2`);
    }

    doc.end();
  } catch (err) {
    console.error('Assignment error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Assignment generation failed' });
  }
};

// ================================================================
// PRIVATE: Master cover page renderer  (4 styles)
// ================================================================
function _drawCover(doc, { style, instName, logoBase64, title, subtitle, rows, docType }) {
  // ── UNIVERSITY ────────────────────────────────────────────────
  if (style === 'university') {
    doc.rect(28, 28, W - 56, H - 56).lineWidth(1.5).stroke('#1a1a2e');
    doc.rect(34, 34, W - 68, H - 68).lineWidth(0.5).stroke('#888888');

    let y = 64;

    if (logoBase64) {
      y = embedLogo(doc, logoBase64, y, 130);
    }

    doc.fontSize(13).font('Helvetica-Bold').fillColor('#0f172a')
       .text(instName.toUpperCase(), M, y, { align: 'center', width: W - M * 2 });
    y = doc.y + 4;
    drawHRule(doc, y, '#1a1a2e', 1.2);
    y += 12;

    if (docType) {
      doc.fontSize(10).font('Helvetica').fillColor('#555555')
         .text(docType, M, y, { align: 'center', width: W - M * 2 });
      y = doc.y + 24;
    } else {
      y += 24;
    }

    doc.fontSize(20).font('Helvetica-Bold').fillColor('#0f172a')
       .text(title, M, y, { align: 'center', width: W - M * 2 });
    y = doc.y + 6;

    if (subtitle) {
      doc.fontSize(12).font('Helvetica-Oblique').fillColor('#555555')
         .text(subtitle, M, y, { align: 'center', width: W - M * 2 });
      y = doc.y + 6;
    }

    y += 30;
    drawHRule(doc, y, '#cccccc', 0.6);
    y += 20;

    const allCenter = rows.length <= 3;

    if (!allCenter && rows.some(r => r[0].toLowerCase().includes('to'))) {
      const toRows  = rows.filter(r => r[0].toLowerCase().includes('to'));
      const byRows  = rows.filter(r => !r[0].toLowerCase().includes('to'));

      const blockX = (W - 320) / 2;
      let cy = y;

      const renderBlock = (label, blockRows, startY) => {
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1a1a2e')
           .text(label + ':', blockX, startY, { underline: true, width: 320, align: 'center' });
        let by2 = doc.y + 6;
        blockRows.forEach(([l, v]) => {
          doc.fontSize(10).font('Helvetica').fillColor('#222222')
             .text(v, blockX, by2, { width: 320, align: 'center' });
          by2 = doc.y + 2;
        });
        return doc.y + 10;
      };

      cy = renderBlock('Submitted to', toRows, cy);
      cy += 18;
      renderBlock('Submitted by', byRows, cy);
    } else {
      let cy = y;
      rows.forEach(([label, value]) => {
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#333333')
           .text(`${label}:`, M, cy, { continued: true, width: 160, align: 'right' });
        doc.font('Helvetica').fillColor('#111111')
           .text(`  ${value}`, { width: 220 });
        cy = doc.y + 3;
      });
    }

  // ── MODERN ────────────────────────────────────────────────────
  } else if (style === 'modern') {
    doc.rect(0, 0, W, H * 0.52).fill('#0f172a');
    doc.rect(0, H * 0.52, W, 6).fill('#2563eb');
    doc.rect(0, H * 0.52 + 6, W, H * 0.48).fill('#ffffff');

    for (let gx = 0; gx < W; gx += 32) {
      doc.save().moveTo(gx, 0).lineTo(gx, H * 0.52)
         .lineWidth(0.3).strokeColor('#ffffff').opacity(0.04).stroke().restore();
    }

    let y = 55;
    if (logoBase64) {
      doc.opacity(1);
      y = embedLogo(doc, logoBase64, y, 110);
    }

    doc.opacity(1).fontSize(10).font('Helvetica').fillColor('#94a3b8')
       .text(instName.toUpperCase(), M, y, { align: 'center', width: W - M * 2, characterSpacing: 1.5 });
    y = doc.y + 6;

    if (docType) {
      doc.fontSize(9).font('Helvetica').fillColor('#64748b')
         .text(docType, M, y, { align: 'center', width: W - M * 2 });
      y = doc.y + 20;
    } else {
      y += 20;
    }

    doc.fontSize(26).font('Helvetica-Bold').fillColor('#f1f5f9')
       .text(title, M, y, { align: 'center', width: W - M * 2 });
    y = doc.y + 8;

    if (subtitle) {
      doc.fontSize(13).font('Helvetica').fillColor('#94a3b8')
         .text(subtitle, M, y, { align: 'center', width: W - M * 2 });
    }

    // Info rows on white section — fixed Y, independent of dark half
    let cy = H * 0.56;
    rows.forEach(([label, value]) => {
      doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#0f172a')
         .text(label + ':', M + 60, cy, { continued: true, width: 160 });
      doc.font('Helvetica').fillColor('#334155').text('  ' + value, { width: 250 });
      cy = doc.y + 4;
    });

  // ── MINIMAL ────────────────────────────────────────────────────
  } else if (style === 'minimal') {
    doc.rect(0, 0, 5, H).fill('#2563eb');
    doc.rect(0, 0, W, 1).fill('#2563eb');

    let y = 60;
    if (logoBase64) {
      // Minimal: left-aligned logo
      try {
        const data = logoBase64.replace(/^data:image\/(png|jpe?g|gif);base64,/, '');
        const buf = Buffer.from(data, 'base64');
        doc.image(buf, 30, y, { width: 100 });
        y = doc.y + 10;
      } catch (e) { /* ignore */ }
    }

    doc.fontSize(9).font('Helvetica').fillColor('#94a3b8')
       .text(instName, 30, y, { width: W - 60 });
    y = doc.y + 2;
    drawHRule(doc, y, '#e2e8f0', 0.5);
    y += 30;

    if (docType) {
      doc.fontSize(9).font('Helvetica').fillColor('#94a3b8')
         .text(docType, 30, y, { characterSpacing: 1.8 });
      y = doc.y + 14;
    }

    doc.fontSize(30).font('Helvetica-Bold').fillColor('#0f172a')
       .text(title, 30, y, { width: W - 90 });
    y = doc.y + 8;

    if (subtitle) {
      doc.fontSize(14).font('Helvetica').fillColor('#64748b')
         .text(subtitle, 30, y, { width: W - 90 });
      y = doc.y + 8;
    }

    drawHRule(doc, H * 0.56, '#e2e8f0', 0.5);

    let cy = H * 0.59;
    rows.forEach(([label, value]) => {
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#94a3b8')
         .text(label.toUpperCase(), 30, cy, { width: 120 });
      doc.fontSize(11).font('Helvetica').fillColor('#1e293b')
         .text(value, 165, cy, { width: 320 });
      cy += 28;
    });

    doc.rect(0, H - 5, W, 5).fill('#2563eb');

  // ── BOLD ──────────────────────────────────────────────────────
  } else if (style === 'bold') {
    doc.rect(0, 0, W, H).fill('#0f172a');
    doc.circle(W * 0.88, 100, 120).fill('#1e3a5f');
    doc.circle(W * 0.88, 100, 80).fill('#0f172a');
    doc.rect(0, H * 0.56, W, H * 0.44).fill('#0a0f1e');
    doc.rect(0, H * 0.56 - 3, W, 3).fill('#2563eb');

    let y = 60;
    if (logoBase64) {
      y = embedLogo(doc, logoBase64, y, 110);
    }

    doc.fontSize(9).font('Helvetica').fillColor('#475569')
       .text(instName.toUpperCase(), M, y, { align: 'center', width: W - M * 2, characterSpacing: 1.5 });
    y = doc.y + 10;

    if (docType) {
      doc.fontSize(9).font('Helvetica').fillColor('#334155')
         .text(docType, M, y, { align: 'center', width: W - M * 2 });
      y = doc.y + 18;
    } else {
      y += 18;
    }

    doc.fontSize(28).font('Helvetica-Bold').fillColor('#f8fafc')
       .text(title, M, y, { align: 'center', width: W - M * 2 });
    y = doc.y + 8;

    if (subtitle) {
      doc.fontSize(13).font('Helvetica').fillColor('#64748b')
         .text(subtitle, M, y, { align: 'center', width: W - M * 2 });
    }

    const cardX = 70, cardW = W - 140, cardH = rows.length * 27 + 28;
    const cardY = H * 0.59;
    doc.roundedRect(cardX, cardY, cardW, cardH, 10).fill('#1e293b');

    let cy = cardY + 18;
    rows.forEach(([label, value]) => {
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#475569')
         .text(label.toUpperCase() + ':', cardX + 20, cy, { width: 120 });
      doc.fontSize(10).font('Helvetica').fillColor('#e2e8f0')
         .text(value, cardX + 150, cy, { width: cardW - 170 });
      cy += 27;
    });

  // ── CLASSIC (default) ─────────────────────────────────────────
  } else {
    doc.rect(28, 28, W - 56, H - 56).lineWidth(1.5).stroke('#1a1a2e');
    doc.rect(34, 34, W - 68, H - 68).lineWidth(0.5).stroke('#aaaaaa');

    let y = 68;
    if (logoBase64) {
      y = embedLogo(doc, logoBase64, y, 120);
    }

    doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000')
       .text(instName.toUpperCase(), M, y, { align: 'center', width: W - M * 2 });
    y = doc.y + 5;
    drawHRule(doc, y, '#000000', 1.2);
    y += 12;

    if (docType) {
      doc.fontSize(11).font('Helvetica').fillColor('#555555')
         .text(docType, M, y, { align: 'center', width: W - M * 2 });
      y = doc.y + 30;
    } else {
      y += 30;
    }

    doc.fontSize(20).font('Helvetica-Bold').fillColor('#000000')
       .text(title, M, y, { align: 'center', width: W - M * 2 });
    y = doc.y + 8;

    if (subtitle) {
      doc.fontSize(12).font('Helvetica-Oblique').fillColor('#444444')
         .text(subtitle, M, y, { align: 'center', width: W - M * 2 });
      y = doc.y + 8;
    }

    y += 40;
    drawHRule(doc, y, '#aaaaaa', 0.6);
    y += 24;

    rows.forEach(([label, value]) => {
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#333333')
         .text(label + ':', M + 50, y, { continued: true, width: 160 });
      doc.font('Helvetica').fillColor('#000000').text('  ' + value, { width: 260 });
      y = doc.y + 6;
    });
  }
}

// ================================================================
// PRIVATE: Section heading for content pages
// FIX 2: Accepts explicit `y` — no more doc.y - 22 / doc.y - 18
// which caused text to be drawn ABOVE (behind) the background rect.
// ================================================================
function _drawSectionHeading(doc, title, style, y) {
  if (style === 'modern') {
    // Draw background rect first, then text inside it at correct y
    doc.rect(M, y, W - M * 2, 26).fill('#0f172a');
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#ffffff')
       .text(title, M + 8, y + 7, { width: W - M * 2 - 16 });
    doc.y = y + 38;
  } else if (style === 'minimal' || style === 'university') {
    // Draw accent bar and title side by side at same y
    doc.rect(M, y, 4, 22).fill('#2563eb');
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#0f172a')
       .text(title, M + 14, y + 4, { width: W - M * 2 - 14 });
    doc.y = y + 34;
  } else if (style === 'bold') {
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e293b')
       .text(title, M, y);
    drawHRule(doc, doc.y + 3, '#2563eb', 1.5);
    doc.y = doc.y + 16;
  } else {
    // classic
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#0f172a').text(title, M, y);
    drawHRule(doc, doc.y + 3, '#1a1a2e', 1);
    doc.y = doc.y + 16;
  }
}

// ================================================================
// 4.  AI ROADMAP
// ================================================================
const https = require('https');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── low-level HTTPS POST helper (no extra packages needed) ──────
function _httpsPost(hostname, path, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = https.request(
      { hostname, path, method: 'POST',
        headers: { 'Content-Type': 'application/json',
                   'Content-Length': Buffer.byteLength(payload),
                   ...extraHeaders } },
      (res) => {
        let raw = '';
        res.on('data', c => { raw += c; });
        res.on('end', () => {
          if (res.statusCode >= 400) {
            const e = new Error(raw);
            e.status = res.statusCode;
            return reject(e);
          }
          try { resolve(JSON.parse(raw)); }
          catch (pe) { reject(pe); }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ── Per-provider callers ─────────────────────────────────────────
async function _tryGemini(modelName, prompt) {
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function _tryGroq(prompt) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw Object.assign(new Error('GROQ_API_KEY not set'), { status: 0 });
  const data = await _httpsPost(
    'api.groq.com', '/openai/v1/chat/completions',
    { model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7, max_tokens: 2048 },
    { Authorization: `Bearer ${key}` }
  );
  return data.choices[0].message.content;
}

async function _tryOpenAI(prompt) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw Object.assign(new Error('OPENAI_API_KEY not set'), { status: 0 });
  const data = await _httpsPost(
    'api.openai.com', '/v1/chat/completions',
    { model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7, max_tokens: 2048 },
    { Authorization: `Bearer ${key}` }
  );
  return data.choices[0].message.content;
}

// ── Master fallback chain ────────────────────────────────────────
// Tries Gemini models first (in order), then Groq, then OpenAI.
// Any provider whose API key is missing is skipped automatically.
async function callAIWithFallback(prompt) {
  // If caller pinned a specific Gemini model, honour it exclusively
  if (process.env.GEMINI_MODEL) {
    return _tryGemini(process.env.GEMINI_MODEL, prompt);
  }

  const providers = [
    { label: 'gemini gemini-2.0-flash',      fn: () => _tryGemini('gemini-2.0-flash', prompt) },
    { label: 'gemini gemini-2.0-flash-lite',  fn: () => _tryGemini('gemini-2.0-flash-lite', prompt) },
    { label: 'gemini gemini-1.5-flash',       fn: () => _tryGemini('gemini-1.5-flash', prompt) },
    { label: 'gemini gemini-1.5-pro',         fn: () => _tryGemini('gemini-1.5-pro', prompt) },
    { label: 'groq  llama-3.3-70b',           fn: () => _tryGroq(prompt) },
    { label: 'openai gpt-4o-mini',            fn: () => _tryOpenAI(prompt) },
  ];

  let lastErr;
  for (const { label, fn } of providers) {
    try {
      const text = await fn();
      console.log(`[AI] success — ${label}`);
      return text;
    } catch (err) {
      lastErr = err;
      // Skip cleanly if key is simply missing (status 0)
      if (!err.status) {
        console.log(`[AI] skipped — ${label} (no API key)`);
      } else {
        console.warn(`[AI] failed  — ${label} (${err.status}), trying next…`);
      }
    }
  }
  throw lastErr;
}

exports.generateAiRoadmap = async (req, res) => {
  try {
    const { targetGoal } = req.body;
    if (!targetGoal) return res.status(400).json({ message: 'Target goal is required.' });

    const user    = await User.findById(req.user._id);
    const gpaData = await GPA.find({ user: req.user._id });

    const totalCred = gpaData.reduce((s, i) => s + (i.totalCredits || 0), 0);
    const totalPts  = gpaData.reduce((s, i) => s + ((i.gpa || 0) * (i.totalCredits || 0)), 0);
    const currentCGPA = totalCred > 0 ? (totalPts / totalCred).toFixed(2) : 'Not available';

    const skillsList   = user?.skills?.join(', ') || 'None listed';
    const gpaHistory   = gpaData.length
      ? gpaData.map(g => `Semester ${g.semesterOrClass}: GPA ${g.gpa} (${g.totalCredits} credits)`).join(' | ')
      : 'No GPA history recorded yet';

    const prompt = `
You are an elite career strategist and academic advisor with 20 years of experience. A student has shared their REAL academic data with you. Your job is to give them brutally honest, hyper-personalized advice — not generic motivational fluff. Every sentence must be directly connected to their actual numbers and skills.

════════════════════════════════
STUDENT'S REAL PROFILE
════════════════════════════════
Name            : ${user?.fullName || 'Student'}
Education Level : ${user?.educationLevel || 'Not specified'} — Year/Class: ${user?.currentClass || 'N/A'}
Current CGPA    : ${currentCGPA}
GPA History     : ${gpaHistory}
Current Skills  : ${skillsList}
Dream Career    : ${targetGoal}
════════════════════════════════

Write the roadmap in this EXACT structure using markdown:

## 🎯 Honest Profile Assessment
In 3-4 sentences, directly evaluate their CGPA (${currentCGPA}) — is it competitive for ${targetGoal}? What does their skill set (${skillsList}) tell you? Be honest but constructive. Reference their actual numbers.

## ⚡ Top 5 Skill Gaps to Close NOW
List exactly 5 skills/knowledge areas they must acquire for ${targetGoal}, ordered by urgency. For each one: name it, explain in one sentence why it is critical specifically for ${targetGoal}, and name one specific free/paid resource to learn it (course, book, or platform).

## 🗺️ 4-Phase Action Plan

### Phase 1 — Foundation (Months 1–3)
3–4 concrete, specific actions. No vague advice. Mention actual tools, platforms, or techniques they should use.

### Phase 2 — Build (Months 4–6)
3–4 actions focused on building real portfolio work or projects relevant to ${targetGoal}. Name the type of project they should build.

### Phase 3 — Enter the Market (Months 7–12)
3–4 actions for internships, networking, and first real opportunities in the ${targetGoal} field. Mention how their CGPA of ${currentCGPA} affects this and what to say/do about it.

### Phase 4 — Accelerate (Year 2+)
3–4 moves that will separate them from hundreds of other ${targetGoal} candidates. Think niche, specialization, or unconventional strategies.

## 💡 The Unfair Advantage
One powerful, unconventional insight that someone with their specific profile (CGPA: ${currentCGPA}, skills: ${skillsList}) can use to get ahead of competition in the ${targetGoal} field. Make it feel like insider knowledge.

---
Be sharp, direct, and data-driven. Every point must be actionable within 24 hours of reading.
    `.trim();

    const roadmap = await callAIWithFallback(prompt);

    // Dynamic follow-up suggestions built from the user's real goal + CGPA
    const suggestions = [
      `Build me a detailed 30-day study plan to kickstart my journey toward becoming a ${targetGoal}`,
      `Which top companies hire ${targetGoal}s and what do they look for in a candidate with CGPA ${currentCGPA}?`,
      `What are the best certifications or online courses for ${targetGoal} in ${new Date().getFullYear()} — free and paid?`,
      `My current skills are: ${skillsList}. Which one should I deepen first for ${targetGoal} and why?`,
      `Write me a powerful LinkedIn headline and summary for someone aspiring to be a ${targetGoal}`,
    ];

    res.json({ roadmap, suggestions });
  } catch (err) {
    console.error('Roadmap error:', err?.status, err?.message);
    const msg = err?.message || '';
    const status = err?.status || 0;
    let userMsg;
    if (msg.includes('API_KEY') || msg.includes('API key'))
      userMsg = 'Gemini API key is not configured or invalid.';
    else if (status === 429 || msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED'))
      userMsg = 'AI is rate-limited right now. Please wait a moment and try again.';
    else if (status === 503 || msg.includes('503') || msg.includes('overloaded'))
      userMsg = 'AI service is temporarily overloaded. Please try again in a few seconds.';
    else if (status === 404 || msg.includes('404') || msg.includes('not found'))
      userMsg = 'AI model not found. Please contact support.';
    else
      userMsg = 'AI generation failed. Please try again.';
    res.status(500).json({ message: userMsg });
  }
};

// ================================================================
// 5.  GPA (unchanged)
// ================================================================
exports.saveGPA = async (req, res) => {
  try {
    const { semesterOrClass, gpa, totalCredits, subjects } = req.body;
    const record = await GPA.create({ user: req.user._id, semesterOrClass, gpa, totalCredits, subjects });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getGPAHistory = async (req, res) => {
  try {
    const history = await GPA.find({ user: req.user._id }).sort({ createdAt: -1 });
    let pts = 0, creds = 0;
    history.forEach(i => { pts += i.gpa * i.totalCredits; creds += i.totalCredits; });
    res.json({ history, cumulativeCGPA: creds > 0 ? (pts / creds).toFixed(2) : '0.00', totalCredits: creds });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
