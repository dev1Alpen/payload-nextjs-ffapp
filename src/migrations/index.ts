import * as migration_20260213_213921 from './20260213_213921';

export const migrations = [
  {
    up: migration_20260213_213921.up,
    down: migration_20260213_213921.down,
    name: '20260213_213921'
  },
];
