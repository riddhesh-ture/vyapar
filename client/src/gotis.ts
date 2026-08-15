export interface Goti {
  id: string;
  name: string;
  emoji: string;
  className: string;
}

export const GOTIS: readonly Goti[] = [
  { id: 'cat', name: 'Cat', emoji: '🐱', className: 'goti-cat' },
  { id: 'dog', name: 'Dog', emoji: '🐶', className: 'goti-dog' },
  { id: 'frog', name: 'Frog', emoji: '🐸', className: 'goti-frog' },
  { id: 'cookie', name: 'Biscuit', emoji: '🍪', className: 'goti-cookie' },
  { id: 'cupcake', name: 'Cupcake', emoji: '🧁', className: 'goti-cupcake' },
  { id: 'rabbit', name: 'Rabbit', emoji: '🐰', className: 'goti-rabbit' },
  { id: 'panda', name: 'Panda', emoji: '🐼', className: 'goti-panda' },
  { id: 'donut', name: 'Donut', emoji: '🍩', className: 'goti-donut' },
] as const;

export function getGotiForPlayerIndex(playerIndex: number): Goti {
  return GOTIS[playerIndex % GOTIS.length] ?? GOTIS[0];
}
