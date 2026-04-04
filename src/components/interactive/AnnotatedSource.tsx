import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../i18n/LanguageContext';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface Annotation {
  /** Start line (1-indexed, inclusive) */
  startLine: number;
  /** End line (1-indexed, inclusive) */
  endLine: number;
  /** Annotation title */
  title: string;
  titleEn: string;
  /** Annotation body */
  body: string;
  bodyEn: string;
  /** Highlight color */
  color: string;
}

interface Props {
  /** Source file path displayed at the top */
  filePath: string;
  /** The actual source code string */
  code: string;
  /** Annotations for specific line ranges */
  annotations: Annotation[];
  /** Language hint for syntax (unused for now, just displayed) */
  language?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AnnotatedSource({ filePath, code, annotations, language = 'typescript' }: Props) {
  const { t } = useLanguage();
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null);
  const [autoPlayIndex, setAutoPlayIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const codeRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const lines = code.split('\n');

  // Auto-play through annotations
  useEffect(() => {
    if (!isAutoPlaying) return;
    if (autoPlayIndex >= annotations.length) {
      setIsAutoPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setActiveAnnotation(autoPlayIndex);
      setAutoPlayIndex((prev) => prev + 1);
    }, autoPlayIndex === 0 ? 800 : 3000);

    return () => clearTimeout(timer);
  }, [autoPlayIndex, isAutoPlaying, annotations.length]);

  // Scroll to highlighted line when annotation changes
  useEffect(() => {
    if (activeAnnotation === null) return;
    const ann = annotations[activeAnnotation];
    if (!ann) return;

    const lineEl = lineRefs.current.get(ann.startLine);
    if (lineEl && codeRef.current) {
      // Scroll so the target line sits ~20% from the top of the code panel
      const container = codeRef.current;
      const targetTop = lineEl.offsetTop - container.offsetTop;
      const offset = container.clientHeight * 0.2;
      container.scrollTo({
        top: Math.max(0, targetTop - offset),
        behavior: 'smooth',
      });
    }
  }, [activeAnnotation, annotations]);

  // Check if a line is in any annotation's range
  const getLineAnnotationIndex = (lineNum: number): number | null => {
    for (let i = 0; i < annotations.length; i++) {
      if (lineNum >= annotations[i].startLine && lineNum <= annotations[i].endLine) {
        return i;
      }
    }
    return null;
  };

  const handleLineClick = (lineNum: number) => {
    const annIdx = getLineAnnotationIndex(lineNum);
    if (annIdx !== null) {
      setIsAutoPlaying(false);
      setActiveAnnotation(annIdx === activeAnnotation ? null : annIdx);
    }
  };

  const handleAnnotationClick = (idx: number) => {
    setIsAutoPlaying(false);
    setActiveAnnotation(idx === activeAnnotation ? null : idx);
  };

  const activeAnn = activeAnnotation !== null ? annotations[activeAnnotation] : null;

  return (
    <div className="ann-source">
      {/* Header */}
      <div className="ann-source__header">
        <div className="ann-source__file">
          <span className="ann-source__file-icon">📄</span>
          <span className="ann-source__file-path">{filePath}</span>
          <span className="ann-source__file-lang">{language}</span>
        </div>
        <div className="ann-source__annotations-count">
          {annotations.length} {t('个注解', 'annotations')}
        </div>
      </div>

      <div className="ann-source__body">
        {/* Code panel */}
        <div className="ann-source__code" ref={codeRef}>
          {lines.map((line, i) => {
            const lineNum = i + 1;
            const annIdx = getLineAnnotationIndex(lineNum);
            const isHighlighted = annIdx !== null && annIdx === activeAnnotation;
            const isAnnotatable = annIdx !== null;
            const ann = annIdx !== null ? annotations[annIdx] : null;
            const isFirstLine = ann && lineNum === ann.startLine;

            return (
              <div
                key={lineNum}
                ref={(el) => {
                  if (el) lineRefs.current.set(lineNum, el);
                }}
                className={`ann-source__line ${isHighlighted ? 'ann-source__line--active' : ''} ${isAnnotatable ? 'ann-source__line--annotatable' : ''}`}
                style={isHighlighted && ann ? { borderLeftColor: ann.color, background: `${ann.color}12` } : undefined}
                onClick={() => handleLineClick(lineNum)}
              >
                <span className="ann-source__line-num">{lineNum}</span>
                <span className="ann-source__line-code">
                  {renderSyntax(line)}
                </span>
                {isFirstLine && isHighlighted && (
                  <span className="ann-source__line-badge" style={{ background: ann!.color }}>
                    {activeAnnotation! + 1}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Annotation sidebar */}
        <div className="ann-source__sidebar">
          <div className="ann-source__sidebar-title">
            {t('注解', 'Annotations')}
          </div>

          <div className="ann-source__sidebar-list">
            {annotations.map((ann, idx) => (
              <button
                key={idx}
                className={`ann-source__sidebar-item ${idx === activeAnnotation ? 'ann-source__sidebar-item--active' : ''}`}
                onClick={() => handleAnnotationClick(idx)}
                style={idx === activeAnnotation ? { borderLeftColor: ann.color } : undefined}
              >
                <span className="ann-source__sidebar-num" style={{ background: ann.color }}>
                  {idx + 1}
                </span>
                <span className="ann-source__sidebar-label">
                  {t(ann.title, ann.titleEn)}
                </span>
                <span className="ann-source__sidebar-lines">
                  L{ann.startLine}-{ann.endLine}
                </span>
              </button>
            ))}
          </div>

          {/* Active annotation detail */}
          <AnimatePresence mode="wait">
            {activeAnn && (
              <motion.div
                key={activeAnnotation}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="ann-source__detail"
                style={{ borderLeftColor: activeAnn.color }}
              >
                <div className="ann-source__detail-title">
                  <span className="ann-source__detail-num" style={{ background: activeAnn.color }}>
                    {activeAnnotation! + 1}
                  </span>
                  {t(activeAnn.title, activeAnn.titleEn)}
                </div>
                <div className="ann-source__detail-body">
                  {t(activeAnn.body, activeAnn.bodyEn)}
                </div>
                <div className="ann-source__detail-lines">
                  Lines {activeAnn.startLine}–{activeAnn.endLine}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Simple syntax highlighting (TypeScript-aware)                      */
/* ------------------------------------------------------------------ */

function renderSyntax(line: string): JSX.Element {
  // Simple token-based highlighting
  const tokens: { text: string; className: string }[] = [];

  // Match patterns
  const patterns: [RegExp, string][] = [
    [/\/\/.*$/, 'comment'],
    [/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/, 'string'],
    [/\b(const|let|var|function|async|await|return|if|else|for|while|import|export|from|type|interface|new|yield|break|continue|true|false|null|undefined|void|typeof|instanceof)\b/, 'keyword'],
    [/\b(number|string|boolean|Promise|AsyncGenerator|Map|Set|Array)\b/, 'type'],
    [/\b(\d+)\b/, 'number'],
  ];

  // For simplicity, just highlight the whole line with basic rules
  let remaining = line;
  let pos = 0;

  if (remaining.trimStart().startsWith('//')) {
    return <span className="ann-source__syn-comment">{line}</span>;
  }

  // Very basic: split on keywords
  const parts = remaining.split(/(\b(?:const|let|var|function|async|await|return|if|else|for|while|import|export|from|type|interface|new|yield|break|continue|typeof|instanceof|true|false|null|undefined|void)\b|\/\/.*$|'[^']*'|"[^"]*"|`[^`]*`|\b\d+\b)/g);

  const keywords = new Set(['const', 'let', 'var', 'function', 'async', 'await', 'return', 'if', 'else', 'for', 'while', 'import', 'export', 'from', 'type', 'interface', 'new', 'yield', 'break', 'continue', 'typeof', 'instanceof', 'void']);
  const literals = new Set(['true', 'false', 'null', 'undefined']);

  return (
    <>
      {parts.map((part, i) => {
        if (keywords.has(part)) {
          return <span key={i} className="ann-source__syn-keyword">{part}</span>;
        }
        if (literals.has(part)) {
          return <span key={i} className="ann-source__syn-literal">{part}</span>;
        }
        if (/^\/\//.test(part)) {
          return <span key={i} className="ann-source__syn-comment">{part}</span>;
        }
        if (/^['"`]/.test(part)) {
          return <span key={i} className="ann-source__syn-string">{part}</span>;
        }
        if (/^\d+$/.test(part)) {
          return <span key={i} className="ann-source__syn-number">{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
