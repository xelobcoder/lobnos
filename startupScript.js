const { spawn } = require('child_process');

// Command to start your Node.js application
const appProcess = spawn('npm', ['run', 'dev'], {
  detached: true,
  stdio: 'ignore' // Ignore stdin, stdout, stderr
});

// Optionally, you can listen for events on the child process
appProcess.on('error', (err) => {
  console.error('Failed to start child process:', err);
});

appProcess.on('exit', (code, signal) => {
  console.log(`Child process exited with code ${code} and signal ${signal}`);
});

// Log a message indicating that the Node.js application has started
console.log('Node.js application started.');
