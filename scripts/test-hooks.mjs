import { resolve as pathResolve } from 'node:path';
import { existsSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const relative = specifier.replace('@/', '');
    const candidate = pathResolve(process.cwd(), 'src', relative);
    for (const ext of ['.ts', '.tsx', '/index.ts', '/index.tsx', '']) {
      if (existsSync(candidate + ext)) {
        return { url: pathToFileURL(candidate + ext).href, shortCircuit: true };
      }
    }
  }

  if ((specifier.startsWith('./') || specifier.startsWith('../')) && context.parentURL) {
    const parentDir = pathResolve(fileURLToPath(context.parentURL), '..');
    const candidate = pathResolve(parentDir, specifier);
    for (const ext of ['.ts', '.tsx', '/index.ts', '/index.tsx']) {
      if (existsSync(candidate + ext)) {
        return { url: pathToFileURL(candidate + ext).href, shortCircuit: true };
      }
    }
  }

  return nextResolve(specifier, context);
}
