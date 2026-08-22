export function getTileGridPosition(index: number): { col: number; row: number; side: 'bottom' | 'left' | 'top' | 'right' } {
  if (index === 0) return { col: 1, row: 1, side: 'top' };
  if (index < 10) return { col: index + 1, row: 1, side: 'top' };
  if (index === 10) return { col: 11, row: 1, side: 'right' };
  if (index < 20) return { col: 11, row: index - 10 + 1, side: 'right' };
  if (index === 20) return { col: 11, row: 11, side: 'bottom' };
  if (index < 30) return { col: 11 - (index - 20), row: 11, side: 'bottom' };
  if (index === 30) return { col: 1, row: 11, side: 'left' };
  return { col: 1, row: 11 - (index - 30), side: 'left' };
}
