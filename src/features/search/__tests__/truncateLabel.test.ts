import { truncateLabel } from '../truncateLabel';

describe('truncateLabel', () => {
  it('leaves short text unchanged', () => {
    expect(truncateLabel('OED')).toBe('OED');
    expect(truncateLabel('123456')).toBe('123456');
  });
  it('truncates long text with an ellipsis at 6 chars', () => {
    expect(truncateLabel('Oxford English')).toBe('Oxford…');
  });
  it('respects a custom max', () => {
    expect(truncateLabel('abcdef', 3)).toBe('abc…');
  });
});
