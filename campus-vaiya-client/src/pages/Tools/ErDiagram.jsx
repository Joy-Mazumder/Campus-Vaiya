import React, { useState, useCallback, useRef } from 'react';
import { GitBranch, Play, RotateCcw, Copy, Check, Download, AlertCircle, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

// ── Mongoose schema parser (pure frontend, no backend needed) ─────────────────

function parseMongooseSchemas(code) {
  const models = [];

  const schemaRegex = /(?:const|let|var)\s+(\w+)\s*=\s*new\s+(?:mongoose\.)?Schema\s*\(\s*\{([\s\S]*?)\}\s*(?:,[\s\S]*?)?\)/g;
  const modelRegex  = /(?:mongoose\.)?model\s*\(\s*['"`](\w+)['"`]/g;

  const modelNames = {};
  let m;
  while ((m = modelRegex.exec(code)) !== null) {
    modelNames[m[1]] = m[1];
  }

  while ((m = schemaRegex.exec(code)) !== null) {
    const varName = m[1];
    const body    = m[2];
    const fields  = parseFields(body);

    const modelNameRegex = new RegExp(
      `model\\s*\\(\\s*['"\`](\\w+)['"\`]\\s*,\\s*${varName}\\b`,
      'i'
    );
    const mnMatch = modelNameRegex.exec(code);
    const modelName = mnMatch ? mnMatch[1] : varName.replace(/Schema$/i, '');

    models.push({ name: modelName, varName, fields });
  }

  return models;
}

function parseFields(body) {
  const fields = [];
  const lines = body.split('\n').map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    if (line.startsWith('//') || line.startsWith('*') || line === '{' || line === '}' || line === '},') continue;

    const fieldMatch = line.match(/^(\w+)\s*:/);
    if (!fieldMatch) continue;

    const fieldName = fieldMatch[1];
    if (['type', 'default', 'required', 'unique', 'index', 'min', 'max', 'enum', 'validate', 'get', 'set', 'ref'].includes(fieldName)) continue;

    let fieldType = 'Mixed';
    let ref = null;
    let isArray = false;

    const rest = line.slice(line.indexOf(':') + 1).trim().replace(/,$/, '');

    if (rest.startsWith('[')) {
      isArray = true;
      const inner = rest.slice(1).replace(/\].*/, '').trim();
      if (inner.includes('ref')) {
        const refMatch = inner.match(/ref\s*:\s*['"`](\w+)['"`]/);
        if (refMatch) ref = refMatch[1];
        fieldType = 'ObjectId';
      } else if (inner.match(/^(String|Number|Boolean|Date|ObjectId|Buffer|Mixed)/i)) {
        fieldType = inner.match(/^(String|Number|Boolean|Date|ObjectId|Buffer|Mixed)/i)[1];
      }
    } else if (rest.startsWith('{')) {
      const typeMatch = rest.match(/type\s*:\s*([A-Za-z.[\]]+)/);
      const refMatch  = rest.match(/ref\s*:\s*['"`](\w+)['"`]/);
      if (typeMatch) fieldType = typeMatch[1].trim();
      if (refMatch)  { ref = refMatch[1]; fieldType = 'ObjectId'; }
    } else {
      const simple = rest.split(',')[0].split('//')[0].trim();
      if (simple.match(/ObjectId|Schema\.Types\.ObjectId/i)) fieldType = 'ObjectId';
      else if (simple.match(/^(String|Number|Boolean|Date|Buffer|Mixed|Map)/i))
        fieldType = simple.match(/^(String|Number|Boolean|Date|Buffer|Mixed|Map)/i)[1];
    }

    fields.push({ name: fieldName, type: fieldType, ref, isArray });
  }

  return fields;
}

// ── SVG Diagram Renderer ──────────────────────────────────────────────────────

const CARD_W     = 200;
const CARD_H_HDR = 36;
const FIELD_H    = 24;
const GAP_X      = 80;
const GAP_Y      = 40;
const COLS       = 3;

function layoutModels(models) {
  return models.map((model, i) => {
    const col   = i % COLS;
    const row   = Math.floor(i / COLS);
    const cardH = CARD_H_HDR + model.fields.length * FIELD_H + 12;
    const x     = col * (CARD_W + GAP_X) + 20;
    const y     = row * (200 + GAP_Y) + 20;
    return { ...model, x, y, cardH };
  });
}

function buildRelationships(laid) {
  const rels   = [];
  const byName = {};
  laid.forEach((m) => { byName[m.name.toLowerCase()] = m; });

  laid.forEach((model) => {
    model.fields.forEach((f, fi) => {
      if (f.ref) {
        const target = byName[f.ref.toLowerCase()];
        if (target) {
          const sx = model.x + CARD_W;
          const sy = model.y + CARD_H_HDR + fi * FIELD_H + FIELD_H / 2;
          const tx = target.x;
          const ty = target.y + CARD_H_HDR / 2;
          rels.push({ sx, sy, tx, ty, label: f.isArray ? '1:N' : '1:1', fieldName: f.name });
        }
      }
    });
  });
  return rels;
}

function DiagramSVG({ models }) {
  const laid = layoutModels(models);
  const rels  = buildRelationships(laid);

  const maxX = Math.max(...laid.map((m) => m.x + CARD_W)) + 40;
  const maxY = Math.max(...laid.map((m) => m.y + m.cardH)) + 40;

  const TYPE_COLORS = {
    String:   '#60a5fa',
    Number:   '#34d399',
    Boolean:  '#f87171',
    Date:     '#fbbf24',
    ObjectId: '#a78bfa',
    Mixed:    '#94a3b8',
  };

  return (
    <svg width={maxX} height={maxY} xmlns="http://www.w3.org/2000/svg" className="font-mono">
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#6366f1" />
        </marker>
      </defs>

      {rels.map((r, i) => (
        <g key={i}>
          <line
            x1={r.sx} y1={r.sy} x2={r.tx} y2={r.ty}
            stroke="#6366f1" strokeWidth="1.5" strokeDasharray="5,3"
            markerEnd="url(#arrow)" opacity={0.7}
          />
          <text
            x={(r.sx + r.tx) / 2}
            y={(r.sy + r.ty) / 2 - 5}
            fill="#a5b4fc" fontSize="10" textAnchor="middle"
          >
            {r.label}
          </text>
        </g>
      ))}

      {laid.map((model) => (
        <g key={model.name}>
          <rect
            x={model.x} y={model.y}
            width={CARD_W} height={model.cardH}
            rx="8" ry="8"
            fill="#0f172a" stroke="#334155" strokeWidth="1.5"
          />
          <rect
            x={model.x} y={model.y}
            width={CARD_W} height={CARD_H_HDR}
            rx="8" ry="8" fill="#1e293b"
          />
          <rect x={model.x} y={model.y + CARD_H_HDR - 4} width={CARD_W} height={4} fill="#1e293b" />
          <text
            x={model.x + CARD_W / 2} y={model.y + CARD_H_HDR / 2 + 5}
            fill="#e2e8f0" fontSize="13" fontWeight="bold" textAnchor="middle"
          >
            {model.name}
          </text>

          {model.fields.map((f, fi) => {
            const fy    = model.y + CARD_H_HDR + fi * FIELD_H + 6;
            const color = TYPE_COLORS[f.type] || '#94a3b8';
            return (
              <g key={f.name}>
                <line
                  x1={model.x + 8} y1={fy + FIELD_H - 2}
                  x2={model.x + CARD_W - 8} y2={fy + FIELD_H - 2}
                  stroke="#1e293b" strokeWidth="1"
                />
                <text x={model.x + 10} y={fy + 15} fill="#cbd5e1" fontSize="11">
                  {f.name}{f.isArray ? '[]' : ''}
                </text>
                <text x={model.x + CARD_W - 8} y={fy + 15} fill={color} fontSize="10" textAnchor="end">
                  {f.type}
                </text>
                {f.ref && (
                  <text x={model.x + CARD_W - 8} y={fy + 25} fill="#a78bfa" fontSize="8" textAnchor="end">
                    - {f.ref}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}

// ── Example code ──────────────────────────────────────────────────────────────

const EXAMPLE_CODE = `const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  createdAt: { type: Date, default: Date.now },
  posts: [{ type: ObjectId, ref: 'Post' }],
});
const User = mongoose.model('User', UserSchema);

const PostSchema = new Schema({
  title: String,
  content: String,
  author: { type: ObjectId, ref: 'User' },
  comments: [{ type: ObjectId, ref: 'Comment' }],
  tags: [String],
  publishedAt: Date,
});
const Post = mongoose.model('Post', PostSchema);

const CommentSchema = new Schema({
  text: String,
  author: { type: ObjectId, ref: 'User' },
  post: { type: ObjectId, ref: 'Post' },
  likes: Number,
});
const Comment = mongoose.model('Comment', CommentSchema);`;

const T = {
  bn: {
    badge: 'MongoDB ER Diagram Generator',
    title: 'ER Diagram Generator',
    subtitle: 'Mongoose schema code paste করুন — automatically ER diagram তৈরি হবে',
    codeLabel: 'Mongoose Schema Code',
    showExample: 'উদাহরণ দেখুন',
    diagramLabel: 'ER Diagram',
    generate: 'Diagram তৈরি করো',
    placeholder: '// Mongoose schema code paste করুন',
    emptyHint: 'Mongoose schema code paste করুন',
    emptySubHint: 'Diagram এখানে দেখাবে',
    noCode: 'Mongoose schema code paste করুন।',
    success: (n) => `${n}টি model পাওয়া গেছে!`,
    parseError: 'Code parse করতে সমস্যা হয়েছে। Schema code সঠিকভাবে লিখুন।',
    noSchema: 'কোনো Mongoose schema খুঁজে পাওয়া যায়নি। "new Schema({...})" pattern ব্যবহার করুন।',
  },
  en: {
    badge: 'MongoDB ER Diagram Generator',
    title: 'ER Diagram Generator',
    subtitle: 'Paste Mongoose schema code — an ER diagram will be generated automatically',
    codeLabel: 'Mongoose Schema Code',
    showExample: 'Show Example',
    diagramLabel: 'ER Diagram',
    generate: 'Generate Diagram',
    placeholder: '// Paste your Mongoose schema code here',
    emptyHint: 'Paste Mongoose schema code',
    emptySubHint: 'Diagram will appear here',
    noCode: 'Please paste Mongoose schema code.',
    success: (n) => `${n} model(s) found!`,
    parseError: 'Could not parse the code. Please write the schema correctly.',
    noSchema: 'No Mongoose schema found. Use the "new Schema({...})" pattern.',
  },
};

// ── Main Component ────────────────────────────────────────────────────────────

const ErDiagram = () => {
  const [code, setCode]     = useState('');
  const [models, setModels] = useState([]);
  const [error, setError]   = useState('');
  const [copied, setCopied] = useState(false);
  const [lang, setLang]     = useState('bn');
  const svgRef              = useRef(null);

  const t = T[lang];

  const generate = useCallback((inputCode) => {
    const src = inputCode || code;
    if (!src.trim()) { toast.error(t.noCode); return; }
    setError('');
    try {
      const parsed = parseMongooseSchemas(src);
      if (parsed.length === 0) {
        setError(t.noSchema);
        setModels([]);
        return;
      }
      setModels(parsed);
      toast.success(t.success(parsed.length));
    } catch (err) {
      setError(t.parseError);
    }
  }, [code, t]);

  const handleExample = () => {
    setCode(EXAMPLE_CODE);
    generate(EXAMPLE_CODE);
  };

  const handleDownload = () => {
    const svgEl = svgRef.current?.querySelector('svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob    = new Blob([svgData], { type: 'image/svg+xml' });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    a.href = url; a.download = 'er-diagram.svg'; a.click();
    URL.revokeObjectURL(url);
    toast.success('SVG downloading!');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => { setCode(''); setModels([]); setError(''); };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 md:px-10 bg-[#020617] text-white">
      <div className="max-w-5xl mx-auto">

        {/* Language toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-white/10 backdrop-blur-md text-sm font-bold text-white hover:border-violet-500/50 hover:bg-violet-500/10 transition-all duration-300 shadow-lg"
          >
            <Globe className="w-4 h-4 text-violet-400" />
            {lang === 'bn' ? 'English' : 'বাংলা'}
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-violet-500/10 border border-violet-500/20 rounded-full px-5 py-2 mb-4">
            <GitBranch className="w-5 h-5 text-violet-400" />
            <span className="text-violet-300 text-sm font-medium">{t.badge}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-3">
            {t.title}
          </h1>
          <p className="text-gray-400 text-base">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left: Code input */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm font-medium">{t.codeLabel}</p>
              <div className="flex gap-2">
                <button
                  onClick={handleExample}
                  className="text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 px-3 py-1.5 rounded-lg transition-all"
                >
                  {t.showExample}
                </button>
                <button onClick={handleReset} className="text-xs text-gray-500 hover:text-gray-300 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t.placeholder}
              rows={20}
              className="w-full bg-[#0f172a] text-green-300 placeholder-gray-600 text-xs font-mono resize-none outline-none border border-white/10 rounded-xl p-4 leading-relaxed"
            />

            <button
              onClick={() => generate()}
              disabled={!code.trim()}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all"
            >
              <Play className="w-4 h-4" />
              {t.generate}
            </button>
          </div>

          {/* Right: Diagram output */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm font-medium">
                {t.diagramLabel} {models.length > 0 && <span className="text-violet-400">({models.length} models)</span>}
              </p>
              {models.length > 0 && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  SVG Download
                </button>
              )}
            </div>

            <div
              ref={svgRef}
              className="bg-[#0f172a] border border-white/10 rounded-xl overflow-auto"
              style={{ minHeight: '440px' }}
            >
              {error && (
                <div className="flex items-start gap-3 m-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {!error && models.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-20 text-gray-600">
                  <GitBranch className="w-12 h-12 mb-4 opacity-30" />
                  <p className="text-sm">{t.emptyHint}</p>
                  <p className="text-xs mt-1">{t.emptySubHint}</p>
                </div>
              )}

              {models.length > 0 && (
                <div className="p-4">
                  <DiagramSVG models={models} />
                </div>
              )}
            </div>

            {/* Legend */}
            {models.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                {[['#60a5fa', 'String'], ['#34d399', 'Number'], ['#f87171', 'Boolean'], ['#fbbf24', 'Date'], ['#a78bfa', 'ObjectId']].map(([color, label]) => (
                  <span key={label} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} />
                    {label}
                  </span>
                ))}
                <span className="flex items-center gap-1.5">
                  <span className="w-8 border-t border-dashed border-indigo-500" />
                  Relationship
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErDiagram;
