export function scrambleCheck(scramble, cubeType) {
  const moveSets = {
    '2x2': ['R', 'R\'', 'R2', 'L', 'L\'', 'L2', 'U', 'U\'', 'U2', 'D', 'D\'', 'D2', 'F', 'F\'', 'F2', 'B', 'B\'', 'B2'],
    '3x3': ['R', 'R\'', 'R2', 'L', 'L\'', 'L2', 'U', 'U\'', 'U2', 'D', 'D\'', 'D2', 'F', 'F\'', 'F2', 'B', 'B\'', 'B2'],
    '4x4': ['R', 'R\'', 'R2', 'L', 'L\'', 'L2', 'U', 'U\'', 'U2', 'D', 'D\'', 'D2', 'F', 'F\'', 'F2', 'B', 'B\'', 'B2', 'Rw', 'Rw\'', 'Rw2', 'Lw', 'Lw\'', 'Lw2', 'Uw', 'Uw\'', 'Uw2', 'Dw', 'Dw\'', 'Dw2', 'Fw', 'Fw\'', 'Fw2', 'Bw', 'Bw\'', 'Bw2'],
    '5x5': ['R', 'R\'', 'R2', 'L', 'L\'', 'L2', 'U', 'U\'', 'U2', 'D', 'D\'', 'D2', 'F', 'F\'', 'F2', 'B', 'B\'', 'B2', 'Rw', 'Rw\'', 'Rw2', 'Lw', 'Lw\'', 'Lw2', 'Uw', 'Uw\'', 'Uw2', 'Dw', 'Dw\'', 'Dw2', 'Fw', 'Fw\'', 'Fw2', 'Bw', 'Bw\'', 'Bw2'],
    '6x6': ['R', 'R\'', 'R2', 'L', 'L\'', 'L2', 'U', 'U\'', 'U2', 'D', 'D\'', 'D2', 'F', 'F\'', 'F2', 'B', 'B\'', 'B2', 'Rw', 'Rw\'', 'Rw2', 'Lw', 'Lw\'', 'Lw2', 'Uw', 'Uw\'', 'Uw2', 'Dw', 'Dw\'', 'Dw2', 'Fw', 'Fw\'', 'Fw2', 'Bw', 'Bw\'', 'Bw2'],
    '7x7': ['R', 'R\'', 'R2', 'L', 'L\'', 'L2', 'U', 'U\'', 'U2', 'D', 'D\'', 'D2', 'F', 'F\'', 'F2', 'B', 'B\'', 'B2', 'Rw', 'Rw\'', 'Rw2', 'Lw', 'Lw\'', 'Lw2', 'Uw', 'Uw\'', 'Uw2', 'Dw', 'Dw\'', 'Dw2', 'Fw', 'Fw\'', 'Fw2', 'Bw', 'Bw\'', 'Bw2']
  };

  const validMoves = moveSets[cubeType];
  if(!validMoves) return true; // could be squan, skewb, pyra and i cant render its state after scramble

  const moves = scramble.trim().split(/\s+/);

  return moves.every(move => validMoves.includes(move));
}
