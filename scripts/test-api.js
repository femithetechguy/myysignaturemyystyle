require('dotenv').config({ path: '.env.local' });
const { generateJWT } = require('../lib/jwtMiddleware');
const http = require('http');

async function testAPI() {
  console.log('=== Testing API Endpoint ===\n');
  
  // Create a test JWT token
  const token = generateJWT('admin');
  console.log('Generated JWT Token');
  
  // Test the API endpoint
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/users?table=admins',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      console.log(`Status Code: ${res.statusCode}\n`);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log('API Response:');
          console.log(JSON.stringify(parsed, null, 2));
          console.log(`\nTotal records: ${parsed.length || 0}`);
          resolve();
        } catch (err) {
          console.log('Raw response:', data);
          reject(err);
        }
      });
    });
    
    req.on('error', (err) => {
      console.error('Request failed:', err.message);
      console.log('\nMake sure the Next.js dev server is running on port 3000');
      console.log('Run: npm run dev');
      reject(err);
    });
    
    req.end();
  });
}

testAPI().catch(console.error);
