import { foldHeadword } from '../foldHeadword';

describe('foldHeadword – strips diacritics across scripts (Hermes-safe NFD)', () => {
  describe('ASCII lowercasing', () => {
    it('lowercases ASCII', () => {
      expect(foldHeadword('Apple')).toBe('apple');
      expect(foldHeadword('APPLE')).toBe('apple');
    });
  });

  describe('Latin diacritic stripping', () => {
    it('strips Latin diacritics', () => {
      expect(foldHeadword('Café')).toBe('cafe');
      expect(foldHeadword('CAFÉ')).toBe('cafe');
      expect(foldHeadword('naïve')).toBe('naive');
      expect(foldHeadword('Über')).toBe('uber');
      expect(foldHeadword('Ñoño')).toBe('nono');
    });
  });

  describe('Greek diacritic stripping (RESTORED – tonos must be stripped)', () => {
    it('strips tonos from Greek', () => {
      expect(foldHeadword('Ελλάδα')).toBe('ελλαδα');
    });
  });

  describe('Cyrillic diacritic stripping', () => {
    it('folds Cyrillic accent (Ё → е)', () => {
      expect(foldHeadword('Ёлка')).toBe('елка');
    });
  });

  describe('CJK passthrough', () => {
    it('passes CJK through unchanged (no Latin lowercasing)', () => {
      expect(foldHeadword('日本語')).toBe('日本語');
    });
  });

  describe('ligature behavior', () => {
    // NFD does NOT expand ligatures — Æ stays Æ (lowercased to æ).
    // Document this explicitly: full ligature expansion is out of scope for MVP.
    it('does NOT expand ligatures (Æ → æ, not ae)', () => {
      expect(foldHeadword('Æther')).toBe('æther');
    });
  });

  describe('whitespace handling', () => {
    it('trims surrounding whitespace', () => {
      expect(foldHeadword('  word  ')).toBe('word');
    });
  });

  describe('edge cases', () => {
    it('handles empty string', () => {
      expect(foldHeadword('')).toBe('');
    });
  });
});
