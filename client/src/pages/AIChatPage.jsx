import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Trash2,
  Copy,
  Check,
  Bot,
  User,
  Sparkles,
  BookOpen,
  ArrowRight,
  Code,
  HelpCircle,
} from 'lucide-react';
import api from '../api/api';
import { ALLOWED_SUBJECTS, SUBJECT_COLORS, SUBJECT_EMOJIS, SUBJECT_LABELS } from '../utils/subjectConstants';

const BASE_PROMPTS = {
  DAA: [
    'Explain binary search and time complexity in simple words.',
    'I have a DAA exam next week. What are high-yield revision topics?',
    'What is the difference between QuickSort and MergeSort?',
    'Explain Dynamic Programming vs Divide and Conquer with examples.',
  ],
  Backend: [
    'Explain RESTful API principles simply with examples.',
    'How does JWT authentication work with Express middleware?',
    'I have a Backend exam coming up. What should I study?',
    'Explain MongoDB vs SQL databases with key differences.',
  ],
  Python: [
    'Explain Python decorators and how they work in simple words.',
    'What are generators and iterators in Python and how do they save memory?',
    'Give me top Python interview questions on OOP.',
    'Explain list comprehensions vs loops with performance tips.',
  ],
  Mathematics: [
    'Explain Bayes Theorem step by step with a real-life probability example.',
    'How do I find eigenvalues and eigenvectors of a 3x3 matrix?',
    'Give me a practice discrete mathematics problem on graph theory.',
    'What should I study for my Engineering Mathematics exam?',
  ],
  DBMS: [
    'Explain 1NF, 2NF, 3NF, and BCNF normalization clearly with table examples.',
    'I have a DBMS exam next week. What should I revise first?',
    'Explain ACID properties in database transactions.',
    'Explain SQL JOIN types (INNER, LEFT, RIGHT, FULL) with examples.',
  ],
  'Web Development': [
    'Explain CSS Flexbox vs Grid with common layout scenarios.',
    'How does the React Virtual DOM work and why is it fast?',
    'Explain Promises, Async/Await, and the Event Loop in JavaScript.',
    'What are key web security practices (XSS, CSRF, CORS)?',
  ],
  ACS: [
    'How do I structure an argument vs counter-argument in formal debate essays?',
    'What are the most common subject-verb agreement and tense errors in English?',
    'Give me tips for delivering an impactful technical project presentation.',
    'Explain formal email writing etiquette with a sample template.',
  ],
  'P and S': [
    'Explain Normal Distribution vs Poisson Distribution with examples.',
    'How do Hypothesis Testing, null hypothesis (H0), and p-values work?',
    'What is the Central Limit Theorem and why is it fundamental in data analysis?',
    'Give me a practice problem on Conditional Probability and Bayes Rule.',
  ],
};

const SUGGESTED_PROMPTS = {
  ...BASE_PROMPTS,
  Maths: BASE_PROMPTS.Mathematics,
  WebDevelopment: BASE_PROMPTS['Web Development'],
  PandS: BASE_PROMPTS['P and S'],
  PNS: BASE_PROMPTS['P and S'],
};

export const AIChatPage = ({ initialSubject = 'DAA', onOpenAddModal }) => {
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || 'DAA');
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const [messages, setMessages] = useState([
    {
      role: 'ai',
      subject: 'DAA',
      content: `### Hello! I am your AI Study Assistant 🤖

I'm here to help you master all 8 core subjects: **DAA, Backend, Python, Mathematics, DBMS, Web Development, ACS (Advanced Communication Skills), and P and S (Probability & Statistics)**.

You can ask me to:
- 💡 **Explain any concept simply** with clear examples & analogies
- 📝 **Generate exam study roadmaps** & high-yield revision topics
- 💻 **Provide code implementations** & complexity analysis
- 📐 **Solve mathematics, statistics, & algorithm problems**
- ✍️ **Review communication, formal writing & interview techniques**
- ❓ **Provide practice & interview questions**

Select a subject above or pick one of the quick prompts below to begin!`,
    },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMsg = {
      role: 'user',
      subject: selectedSubject,
      content: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await api.chatWithAI(selectedSubject, query);
      if (response.data && response.data.success && response.data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            subject: selectedSubject,
            content: response.data.reply,
          },
        ]);
      } else if (response.data && response.data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            subject: selectedSubject,
            content: response.data.reply,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          subject: selectedSubject,
          content: `⚠️ **Error:** ${err.response?.data?.message || err.message || 'Unable to connect to AI assistant. Please try again.'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'ai',
        subject: selectedSubject,
        content: `Chat cleared! Ready for your next academic doubt in **${selectedSubject}** (${SUBJECT_LABELS[selectedSubject] || selectedSubject}).`,
      },
    ]);
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // High-fidelity Markdown renderer for AI messages with maximum contrast and clear visibility
  const renderInline = (text) => {
    if (!text) return '';
    const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return tokens.map((tok, i) => {
      if (tok.startsWith('`') && tok.endsWith('`') && tok.length > 2) {
        return (
          <code
            key={i}
            style={{
              background: '#f1f5f9',
              color: '#0284c7',
              border: '1px solid #cbd5e1',
              padding: '2px 6px',
              borderRadius: '4px',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '0.88em',
              fontWeight: 600,
            }}
          >
            {tok.slice(1, -1)}
          </code>
        );
      }
      if (tok.startsWith('**') && tok.endsWith('**') && tok.length > 4) {
        return (
          <strong key={i} style={{ color: '#0f172a', fontWeight: 800 }}>
            {tok.slice(2, -2)}
          </strong>
        );
      }
      return tok;
    });
  };

  const formatContent = (content) => {
    if (!content) return null;

    // Split on code blocks ```...``` if explicitly provided
    const segments = content.split(/(```[\s\S]*?```)/g);

    return segments.map((seg, sIdx) => {
      if (seg.startsWith('```') && seg.endsWith('```')) {
        const raw = seg.slice(3, -3).trim();
        const firstLineEnd = raw.indexOf('\n');
        let lang = '';
        let codeText = raw;
        if (firstLineEnd !== -1) {
          const firstLine = raw.slice(0, firstLineEnd).trim();
          if (/^[a-zA-Z0-9_-]+$/.test(firstLine)) {
            lang = firstLine;
            codeText = raw.slice(firstLineEnd + 1);
          }
        }

        return (
          <div
            key={sIdx}
            style={{
              margin: '0.85rem 0',
              borderRadius: '12px',
              background: '#0f172a',
              border: '1.5px solid #334155',
              overflow: 'hidden',
              boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 14px',
                background: '#1e293b',
                borderBottom: '1px solid #334155',
                fontSize: '0.75rem',
                color: '#94a3b8',
                fontWeight: 700,
              }}
            >
              <span>{lang ? lang.toUpperCase() : 'CODE'}</span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(codeText)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#38bdf8',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                Copy
              </button>
            </div>
            <pre
              style={{
                margin: 0,
                padding: '12px 16px',
                overflowX: 'auto',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: '0.88rem',
                lineHeight: 1.5,
                color: '#f8fafc',
              }}
            >
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }

      // Group table rows or render plain markdown lines
      const lines = seg.split('\n');
      const renderedElements = [];
      let i = 0;

      while (i < lines.length) {
        const line = lines[i];

        // Check for markdown table start
        if (line.trim().startsWith('|') && line.trim().endsWith('|') && i + 1 < lines.length && lines[i + 1].includes('---')) {
          const headerCells = line.split('|').map(c => c.trim()).filter(Boolean);
          i += 2; // skip header and separator line
          const rows = [];
          while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
            const cells = lines[i].split('|').map(c => c.trim()).filter(Boolean);
            rows.push(cells);
            i++;
          }

          renderedElements.push(
            <div key={`table-${i}`} style={{ overflowX: 'auto', margin: '0.85rem 0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden', border: '1.5px solid #cbd5e1' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    {headerCells.map((h, hIdx) => (
                      <th key={hIdx} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 800, fontSize: '0.84rem', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                        {renderInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, rIdx) => (
                    <tr key={rIdx} style={{ background: rIdx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      {r.map((c, cIdx) => (
                        <td key={cIdx} style={{ padding: '8px 12px', fontSize: '0.84rem', color: '#1e293b', border: '1px solid #e2e8f0' }}>
                          {renderInline(c)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }

        if (line.startsWith('### ')) {
          renderedElements.push(
            <h3 key={i} style={{ margin: '0.9rem 0 0.4rem', fontSize: '1.18rem', fontWeight: 800, color: '#0f172a' }}>
              {renderInline(line.replace('### ', ''))}
            </h3>
          );
        } else if (line.startsWith('#### ')) {
          renderedElements.push(
            <h4 key={i} style={{ margin: '0.75rem 0 0.3rem', fontSize: '1.05rem', fontWeight: 700, color: '#0369a1' }}>
              {renderInline(line.replace('#### ', ''))}
            </h4>
          );
        } else if (line.startsWith('> ')) {
          renderedElements.push(
            <blockquote
              key={i}
              style={{
                borderLeft: '4px solid #0284c7',
                color: '#0369a1',
                margin: '0.65rem 0',
                background: '#f0f9ff',
                borderRadius: '0 8px 8px 0',
                padding: '8px 14px',
                fontSize: '0.92rem',
                lineHeight: 1.5,
              }}
            >
              {renderInline(line.replace('> ', ''))}
            </blockquote>
          );
        } else if (line.startsWith('- ') || line.startsWith('• ')) {
          renderedElements.push(
            <li key={i} style={{ marginLeft: '1.25rem', marginBottom: '0.3rem', color: '#334155', lineHeight: 1.6 }}>
              {renderInline(line.replace(/^[-•]\s*/, ''))}
            </li>
          );
        } else if (/^\d+\.\s/.test(line)) {
          renderedElements.push(
            <div key={i} style={{ marginLeft: '0.5rem', marginBottom: '0.35rem', color: '#1e293b', lineHeight: 1.6 }}>
              {renderInline(line)}
            </div>
          );
        } else if (!line.trim()) {
          renderedElements.push(<div key={i} style={{ height: '0.4rem' }} />);
        } else {
          renderedElements.push(
            <p key={i} style={{ margin: '0.4rem 0', color: '#1e293b', lineHeight: 1.65, fontSize: '0.94rem' }}>
              {renderInline(line)}
            </p>
          );
        }
        i++;
      }

      return renderedElements;
    });
  };

  return (
    <div className="page-container page-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800 }}>
            AI Doubt Assistant 🤖
          </h1>
          <p style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            Instant, personalized explanations and study plans for all 8 academic subjects
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handleClearChat}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 0.95rem', fontSize: '0.84rem' }}
            title="Clear Chat History"
          >
            <Trash2 size={16} />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Main AI Chat Interface Container */}
      <div className="ai-chat-container">
        {/* Chat Header with Subject Selector */}
        <div className="ai-chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary, #94a3b8)' }}>
              Subject Focus:
            </span>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {ALLOWED_SUBJECTS.map((sub) => {
                const isSelected = selectedSubject === sub;
                const color = SUBJECT_COLORS[sub] || '#3b82f6';
                return (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubject(sub)}
                    style={{
                      padding: '0.35rem 0.8rem',
                      borderRadius: '9999px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: isSelected ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.1)',
                      background: isSelected ? `${color}25` : 'rgba(255,255,255,0.03)',
                      color: isSelected ? '#fff' : 'var(--text-secondary, #94a3b8)',
                      boxShadow: isSelected ? `0 2px 8px ${color}35` : 'none',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>{SUBJECT_EMOJIS[sub]}</span>
                    <span>{sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#4ade80',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}
          >
            ● AI Ready
          </span>
        </div>

        {/* Chat Messages Stream */}
        <div className="ai-chat-messages">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';

            return (
              <div key={idx} className={`chat-bubble ${isUser ? 'user' : 'ai'}`}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.4rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    opacity: 0.85,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {isUser ? <User size={14} /> : <Bot size={14} />}
                    {isUser ? 'You' : `AI Coach (${msg.subject || selectedSubject})`}
                  </span>

                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.content, idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.72rem',
                      }}
                      title="Copy response"
                    >
                      {copiedIndex === idx ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                    </button>
                  )}
                </div>

                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
                  {formatContent(msg.content)}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="chat-bubble ai" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot size={16} color="#0284c7" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)' }}>AI Coach is thinking...</span>
              <div className="typing-dots">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Carousel */}
        <div className="ai-quick-prompts">
          {(SUGGESTED_PROMPTS[selectedSubject] || SUGGESTED_PROMPTS[selectedSubject?.replace(/\s+/g, '')] || []).map((prompt, index) => (
            <button
              key={index}
              onClick={() => handleSendMessage(prompt)}
              className="prompt-chip"
              disabled={loading}
            >
              💡 {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          className="ai-chat-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Ask a doubt in ${selectedSubject}... (e.g. "Explain Key Concepts" or "Practice Question")`}
            className="ai-input"
            disabled={loading}
          />
          <button type="submit" disabled={!inputMessage.trim() || loading} className="btn-send-ai">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChatPage;
