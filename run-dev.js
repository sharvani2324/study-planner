import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting MERN Study Planner...');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// On Windows, cleanly kill any orphaned process previously holding port 5000
if (isWindows) {
  try {
    const netstatOut = execSync('netstat -ano | findstr :5000', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const lines = netstatOut.trim().split('\n');
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && !isNaN(pid) && Number(pid) > 0 && Number(pid) !== process.pid) {
        try {
          execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' });
        } catch {}
      }
    }
  } catch {}
}

const server = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true,
});

const client = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true,
});

const killTree = (child) => {
  if (!child || !child.pid) return;
  if (isWindows) {
    try {
      execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' });
    } catch {}
  } else {
    try {
      child.kill('SIGTERM');
    } catch {}
  }
};

const handleExit = () => {
  killTree(server);
  killTree(client);
  process.exit();
};

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);
process.on('exit', handleExit);
