export const SUBJECTS_CONFIG = [
  { value: 'DAA', label: 'DAA', fullName: 'Design & Analysis of Algorithms', icon: '⚡', color: '#0284c7', bg: '#e0f2fe' },
  { value: 'Backend', label: 'Backend', fullName: 'Backend (Node, Express, REST)', icon: '🚀', color: '#059669', bg: '#ecfdf5' },
  { value: 'Python', label: 'Python', fullName: 'Python Programming', icon: '🐍', color: '#d97706', bg: '#fef9c3' },
  { value: 'Mathematics', label: 'Mathematics', fullName: 'Engineering Mathematics', icon: '📐', color: '#ea580c', bg: '#ffedd5', aliases: ['Maths'] },
  { value: 'DBMS', label: 'DBMS', fullName: 'Database Management Systems', icon: '🗄️', color: '#7c3aed', bg: '#f3e8ff' },
  { value: 'ACS', label: 'ACS', fullName: 'Advanced Communication Skills', icon: '🗣️', color: '#db2777', bg: '#fce7f3' },
  { value: 'Web Development', label: 'Web Development', fullName: 'Web Development (HTML, CSS, React)', icon: '🌐', color: '#0891b2', bg: '#cffafe', aliases: ['WebDevelopment'] },
  { value: 'P and S', label: 'P and S', fullName: 'Probability & Statistics', icon: '🎲', color: '#4f46e5', bg: '#e0e7ff', aliases: ['PandS', 'PNS'] },
];

export const CANONICAL_SUBJECTS = [
  'DAA',
  'Backend',
  'Python',
  'Mathematics',
  'DBMS',
  'ACS',
  'Web Development',
  'P and S'
];

export const CORE_SUBJECTS_LIST = CANONICAL_SUBJECTS;
export const SUBJECT_LIST = CANONICAL_SUBJECTS;

// ALLOWED_SUBJECTS for UI and forms: strictly the 8 canonical subjects (no duplicates)
export const ALLOWED_SUBJECTS = CANONICAL_SUBJECTS;

// All recognized values including historical database aliases
export const ALL_RECOGNIZED_SUBJECTS = [
  'DAA',
  'Backend',
  'Python',
  'Mathematics',
  'Maths',
  'DBMS',
  'ACS',
  'Web Development',
  'WebDevelopment',
  'P and S',
  'PandS',
  'PNS'
];

export const normalizeSubject = (subject) => {
  if (!subject) return 'DAA';
  const clean = String(subject).trim();
  if (clean === 'Maths' || clean === 'Mathematics') return 'Mathematics';
  if (clean === 'WebDevelopment' || clean === 'Web Development') return 'Web Development';
  if (clean === 'PandS' || clean === 'PNS' || clean === 'P and S') return 'P and S';
  return clean;
};

export const SUBJECT_ICONS = {
  'All Subjects': '🌟',
  All: '🌟',
  DAA: '⚡',
  Backend: '🚀',
  Python: '🐍',
  Mathematics: '📐',
  Maths: '📐',
  DBMS: '🗄️',
  ACS: '🗣️',
  'Web Development': '🌐',
  WebDevelopment: '🌐',
  'P and S': '🎲',
  PandS: '🎲',
  PNS: '🎲'
};

export const SUBJECT_EMOJIS = SUBJECT_ICONS;

export const SUBJECT_COLORS = {
  'All Subjects': '#0284c7',
  All: '#0284c7',
  DAA: '#0284c7',
  Backend: '#059669',
  Python: '#d97706',
  Mathematics: '#ea580c',
  Maths: '#ea580c',
  DBMS: '#7c3aed',
  ACS: '#db2777',
  'Web Development': '#0891b2',
  WebDevelopment: '#0891b2',
  'P and S': '#4f46e5',
  PandS: '#4f46e5',
  PNS: '#4f46e5'
};

export const SUBJECT_BG = {
  'All Subjects': '#e0f2fe',
  All: '#e0f2fe',
  DAA: '#e0f2fe',
  Backend: '#ecfdf5',
  Python: '#fef9c3',
  Mathematics: '#ffedd5',
  Maths: '#ffedd5',
  DBMS: '#f3e8ff',
  ACS: '#fce7f3',
  'Web Development': '#cffafe',
  WebDevelopment: '#cffafe',
  'P and S': '#e0e7ff',
  PandS: '#e0e7ff',
  PNS: '#e0e7ff'
};

export const SUBJECT_LABELS = {
  'All Subjects': 'All Subjects',
  All: 'All Subjects',
  DAA: 'DAA',
  Backend: 'Backend',
  Python: 'Python',
  Mathematics: 'Mathematics',
  Maths: 'Mathematics',
  DBMS: 'DBMS',
  ACS: 'ACS',
  'Web Development': 'Web Development',
  WebDevelopment: 'Web Development',
  'P and S': 'P and S',
  PandS: 'P and S',
  PNS: 'P and S'
};

export const getSubjectLabel = (subject) => {
  const norm = normalizeSubject(subject);
  const found = SUBJECTS_CONFIG.find((s) => s.value === norm || s.label === norm || (s.aliases && s.aliases.includes(subject)));
  return found ? found.label : (SUBJECT_LABELS[subject] || subject);
};

export const getSubjectFullName = (subject) => {
  const norm = normalizeSubject(subject);
  const found = SUBJECTS_CONFIG.find((s) => s.value === norm || s.label === norm || (s.aliases && s.aliases.includes(subject)));
  return found ? found.fullName : subject;
};

export const getTodayDateStr = () => new Date().toISOString().split('T')[0];

export default {
  SUBJECTS_CONFIG,
  ALLOWED_SUBJECTS,
  CORE_SUBJECTS_LIST,
  SUBJECT_LIST,
  normalizeSubject,
  SUBJECT_ICONS,
  SUBJECT_EMOJIS,
  SUBJECT_COLORS,
  SUBJECT_BG,
  SUBJECT_LABELS,
  getSubjectLabel,
  getSubjectFullName,
  getTodayDateStr,
};
