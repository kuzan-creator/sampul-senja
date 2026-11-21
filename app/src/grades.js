// Colour grades: a canvas filter for the photos plus overlay washes and the lettering palette.
// Each grade keeps the photos recognisable while giving the cover its sunset or neon look.
// subtitleGlow colours the neon glow behind the script subtitle.
export const GRADES = {
  senja: {
    id: 'senja', name: 'Senja',
    filter: 'saturate(1.30) contrast(1.06) brightness(1.03)',
    washes: [
      { blend: 'soft-light', stops: [[0, 'rgba(255,170,60,0.55)'], [1, 'rgba(255,70,120,0.55)']] },
      { blend: 'overlay', stops: [[0, 'rgba(255,120,40,0.10)'], [1, 'rgba(120,20,90,0.22)']] },
    ],
    title: ['#fff3b0', '#ffb347', '#ff5e78'],
    outline: '#230a24',
    subtitleGlow: '#ff2d78',
  },
  neon: {
    id: 'neon', name: 'Neon',
    filter: 'saturate(1.55) contrast(1.16) brightness(1.00)',
    washes: [
      { blend: 'soft-light', stops: [[0, 'rgba(0,229,255,0.50)'], [1, 'rgba(255,45,149,0.55)']] },
      { blend: 'screen', stops: [[0, 'rgba(255,0,128,0.08)'], [1, 'rgba(0,180,255,0.10)']] },
    ],
    title: ['#a5f3fc', '#f0abfc', '#ff2d95'],
    outline: '#12041f',
    subtitleGlow: '#00e5ff',
  },
  dusk: {
    id: 'dusk', name: 'Senja Ungu',
    filter: 'saturate(1.12) contrast(1.09) brightness(0.96)',
    washes: [
      { blend: 'overlay', stops: [[0, 'rgba(124,58,237,0.30)'], [1, 'rgba(45,212,191,0.28)']] },
      { blend: 'soft-light', stops: [[0, 'rgba(30,10,60,0.25)'], [1, 'rgba(255,120,180,0.18)']] },
    ],
    title: ['#e9d5ff', '#c084fc', '#f472b6'],
    outline: '#160a24',
    subtitleGlow: '#c084fc',
  },
  palm: {
    id: 'palm', name: 'Emas Palem',
    filter: 'sepia(0.22) saturate(1.35) contrast(1.06) brightness(1.02)',
    washes: [
      { blend: 'soft-light', stops: [[0, 'rgba(255,214,100,0.55)'], [1, 'rgba(255,120,60,0.45)']] },
      { blend: 'overlay', stops: [[0, 'rgba(255,200,80,0.08)'], [1, 'rgba(90,40,10,0.20)']] },
    ],
    title: ['#fef08a', '#fbbf24', '#fb7185'],
    outline: '#241002',
    subtitleGlow: '#fbbf24',
  },
  teal: {
    id: 'teal', name: 'Pantai Biru',
    filter: 'saturate(1.28) contrast(1.10) brightness(1.04)',
    washes: [
      { blend: 'soft-light', stops: [[0, 'rgba(0,200,220,0.55)'], [1, 'rgba(0,120,200,0.50)']] },
      { blend: 'overlay', stops: [[0, 'rgba(20,220,190,0.12)'], [1, 'rgba(0,40,110,0.24)']] },
    ],
    title: ['#ecfeff', '#67e8f9', '#0ea5e9'],
    outline: '#04222e',
    subtitleGlow: '#22d3ee',
  },
  noir: {
    id: 'noir', name: 'Noir',
    filter: 'grayscale(1) contrast(1.28) brightness(1.04)',
    washes: [
      { blend: 'overlay', stops: [[0, 'rgba(255,255,255,0.14)'], [1, 'rgba(0,0,0,0.30)']] },
      { blend: 'soft-light', stops: [[0, 'rgba(255,255,255,0.20)'], [1, 'rgba(0,0,0,0.28)']] },
    ],
    title: ['#ffffff', '#d4d4d4', '#8a8a8a'],
    outline: '#000000',
    subtitleGlow: '#f5f5f5',
  },
};

/** Paints a grade's overlay washes over the whole cover (after the photos, before the lettering). */
export function paintGradeWash(ctx, w, h, gradeId) {
  const grade = GRADES[gradeId];
  for (const wash of grade.washes) {
    const g = ctx.createLinearGradient(0, 0, w * 0.35, h);
    for (const [offset, color] of wash.stops) g.addColorStop(offset, color);
    ctx.save();
    ctx.globalCompositeOperation = wash.blend;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}
