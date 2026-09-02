import { cp, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
await mkdir(resolve(projectRoot, 'dist/sql'), { recursive: true });
await cp(resolve(projectRoot, 'src/sql'), resolve(projectRoot, 'dist/sql'), {
  recursive: true,
});
