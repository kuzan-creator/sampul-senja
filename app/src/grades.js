// Sampul Senja v4 — colour grades. Each grade is a canvas filter applied to
// the photo plus a translucent gradient wash drawn over it, so the same
// photo reads as a different Vice City sunset in every grade.

export const GRADE_DEFS = {
  senja: {
    filter: 'saturate(1.25) contrast(1.05) sepia(0.25)',
    wash: ['rgba(255,122,24,0.20)', 'rgba(255,46,136,0.14)'],
  },
  neon: {
    filter: 'saturate(1.6) contrast(1.15)',
    wash: ['rgba(255,46,136,0.20)', 'rgba(0,229,255,0.16)'],
  },
  ungu: {
    filter: 'saturate(1.3) hue-rotate(-20deg) contrast(1.05)',
    wash: ['rgba(124,58,237,0.24)', 'rgba(255,46,136,0.12)'],
  },
  emas: {
    filter: 'sepia(0.5) saturate(1.4) contrast(1.05)',
    wash: ['rgba(255,200,60,0.20)', 'rgba(255,122,24,0.10)'],
  },
  biru: {
    filter: 'saturate(1.2) hue-rotate(15deg) contrast(1.05)',
    wash: ['rgba(0,180,200,0.22)', 'rgba(0,80,160,0.14)'],
  },
  noir: {
    filter: 'grayscale(1) contrast(1.25) brightness(1.02)',
    wash: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)'],
  },
  krom: {
    filter: 'grayscale(0.7) contrast(1.2) brightness(1.06)',
    wash: ['rgba(220,230,240,0.10)', 'rgba(120,140,160,0.08)'],
  },
  magenta: {
    filter: 'saturate(1.5) hue-rotate(300deg) contrast(1.08)',
    wash: ['rgba(255,0,128,0.22)', 'rgba(160,0,255,0.14)'],
  },
};

export function gradeOf(id) {
  return GRADE_DEFS[id] || GRADE_DEFS.senja;
}
