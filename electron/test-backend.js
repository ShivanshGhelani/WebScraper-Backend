const { exec } = require('child_process');

// Test the backend API
console.log('Testing backend API...');

// Test the root endpoint
exec('curl http://127.0.0.1:8000/', (error, stdout, stderr) => {
  if (error) {
    console.error('Error testing root endpoint:', error);
    return;
  }
  console.log('Root endpoint response:', stdout);
});

// Test the analyze endpoint with a simple POST request
setTimeout(() => {
  const testData = JSON.stringify({ domain: 'example.com' });
  
  exec(`curl -X POST http://127.0.0.1:8000/api/v1/analyze -H "Content-Type: application/json" -d "${testData}"`, 
    (error, stdout, stderr) => {
      if (error) {
        console.error('Error testing analyze endpoint:', error);
        return;
      }
      console.log('Analyze endpoint response:', stdout.substring(0, 200) + '...');
    });
}, 2000);
