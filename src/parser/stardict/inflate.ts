import { ungzip } from 'pako';

/**
 * Inflates a StarDict `.dict.dz` (a gzip container — dictzip's random-access
 * FEXTRA header is gzip-compatible) into the raw `.dict` bytes. Pure JS via
 * pako, which is Hermes-safe (no Node zlib dependency).
 *
 * @throws if the input is not a valid gzip/dictzip stream (corrupt `.dict.dz`);
 *   the phase-3 import pipeline will catch this and fail that dictionary's import.
 */
export function inflateDict(bytes: Uint8Array): Uint8Array {
  return ungzip(bytes);
}
