import * as migration_20260213_213921 from './20260213_213921';
import * as migration_20260213_214029 from './20260213_214029';

export const migrations = [
  {
    up: migration_20260213_213921.up,
    down: migration_20260213_213921.down,
    name: '20260213_213921',
  },
  {
    up: migration_20260213_214029.up,
    down: migration_20260213_214029.down,
    name: '20260213_214029'
  },
];
