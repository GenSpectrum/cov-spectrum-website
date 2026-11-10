import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

function findExecutableFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  return entries.flatMap(entry => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return findExecutableFiles(entryPath);
    }
    return entry.name === 'chrome' || entry.name === 'chrome-headless-shell' ? [entryPath] : [];
  });
}

function isRunnableBrowser(executablePath: string | undefined) {
  if (!executablePath || !fs.existsSync(executablePath)) {
    return false;
  }

  const result = spawnSync(executablePath, ['--version'], { stdio: 'ignore' });
  return result.status === 0;
}

export function getRunnableChromiumExecutablePath() {
  const candidates = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
  ];

  try {
    candidates.push(require('puppeteer').executablePath());
  } catch {
    // Optional fallback only.
  }

  candidates.push(...findExecutableFiles(path.join(os.homedir(), '.cache', 'puppeteer')));
  candidates.push(...findExecutableFiles(path.join(os.homedir(), '.cache', 'ms-playwright')));

  return candidates.find(isRunnableBrowser);
}
