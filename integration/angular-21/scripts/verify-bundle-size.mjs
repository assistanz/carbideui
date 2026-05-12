#!/usr/bin/env node
/**
 * verify-bundle-size.mjs
 *
 * Enterprise-grade bundle size guard for the CarbideUI integration tests.
 *
 * Purpose:
 *   Prevents accidental bundle bloat from reaching consumers by asserting
 *   that the production build output stays within defined budget thresholds.
 *   Fails CI with a non-zero exit code when any budget is exceeded.
 *
 * Usage (called by npm run verify:full):
 *   node scripts/verify-bundle-size.mjs
 */

import { readdirSync, statSync } from 'fs';
import { join } from 'path';

// ── Budget thresholds (KiB) ────────────────────────────────────────────────
const BUDGETS = {
  maxInitialBundleKb: 800,
  maxTotalJsKb: 1500,
  maxTotalCssKb: 800,
};

const DIST_PATH = join(process.cwd(), 'dist', 'integration', 'browser');

function kib(bytes) {
  return (bytes / 1024).toFixed(1);
}

function getFilesRecursive(dir, ext) {
  let results = [];
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        results = results.concat(getFilesRecursive(full, ext));
      } else if (entry.endsWith(ext)) {
        results.push({ path: full, size: stat.size });
      }
    }
  } catch {
    // dist/browser may not exist if output path differs
  }
  return results;
}

const jsFiles = getFilesRecursive(DIST_PATH, '.js');
const cssFiles = getFilesRecursive(DIST_PATH, '.css');

if (jsFiles.length === 0) {
  const DIST_PATH_FLAT = join(process.cwd(), 'dist', 'integration');
  jsFiles.push(...getFilesRecursive(DIST_PATH_FLAT, '.js'));
  cssFiles.push(...getFilesRecursive(DIST_PATH_FLAT, '.css'));
}

const totalJs = jsFiles.reduce((acc, f) => acc + f.size, 0);
const totalCss = cssFiles.reduce((acc, f) => acc + f.size, 0);
const largestJs = jsFiles.reduce((max, f) => (f.size > max.size ? f : max), { size: 0, path: '' });

console.log('\n── Bundle Size Report ────────────────────────────────────────');
console.log(`  JS files found   : ${jsFiles.length}`);
console.log(`  CSS files found  : ${cssFiles.length}`);
console.log(`  Largest JS chunk : ${kib(largestJs.size)} KiB  (${largestJs.path.split('/').pop()})`);
console.log(`  Total JS         : ${kib(totalJs)} KiB  (budget: ${BUDGETS.maxTotalJsKb} KiB)`);
console.log(`  Total CSS        : ${kib(totalCss)} KiB  (budget: ${BUDGETS.maxTotalCssKb} KiB)`);
console.log('─────────────────────────────────────────────────────────────\n');

let failed = false;

if (largestJs.size / 1024 > BUDGETS.maxInitialBundleKb) {
  console.error(`✘ BUDGET EXCEEDED: Largest JS chunk ${kib(largestJs.size)} KiB > ${BUDGETS.maxInitialBundleKb} KiB`);
  failed = true;
}

if (totalJs / 1024 > BUDGETS.maxTotalJsKb) {
  console.error(`✘ BUDGET EXCEEDED: Total JS ${kib(totalJs)} KiB > ${BUDGETS.maxTotalJsKb} KiB`);
  failed = true;
}

if (totalCss / 1024 > BUDGETS.maxTotalCssKb) {
  console.error(`✘ BUDGET EXCEEDED: Total CSS ${kib(totalCss)} KiB > ${BUDGETS.maxTotalCssKb} KiB`);
  failed = true;
}

if (failed) {
  console.error('Bundle size check FAILED. Review imports for unintended side-effects or missing tree-shaking.\n');
  process.exit(1);
} else {
  console.log('✔ All bundle size budgets passed.\n');
}
