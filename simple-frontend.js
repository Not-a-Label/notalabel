const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Not a Label - Login</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; }
        input { width: 100%; padding: 10px; margin: 10px 0; }
        button { width: 100%; padding: 10px; background: #3b82f6; color: white; border: none; cursor: pointer; }
        button:hover { background: #2563eb; }
        .message { margin: 10px 0; padding: 10px; border-radius: 5px; }
        .error { background: #fee; color: #c00; }
        .success { background: #efe; color: #080; }
      </style>
    </head>
    <body>
      <h1>Not a Label</h1>
      <h2>Login</h2>
      <form id="loginForm">
        <input type="email" id="email" placeholder="Email" value="testartist@example.com" required>
        <input type="password" id="password" placeholder="Password" value="password123" required>
        <button type="submit">Login</button>
      </form>
      <div id="message"></div>
      <p>Test accounts available:</p>
      <ul>
        <li>testartist@example.com / password123</li>
        <li>janesmith@example.com / password123</li>
      </ul>
      
      <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
          const messageDiv = document.getElementById('message');
          
          try {
            const response = await fetch('http://localhost:4000/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
              messageDiv.className = 'message success';
              messageDiv.textContent = 'Login successful! Token: ' + data.token.substring(0, 20) + '...';
              localStorage.setItem('token', data.token);
              
              // Redirect to dashboard
              setTimeout(() => {
                window.location.href = '/dashboard';
              }, 1000);
            } else {
              messageDiv.className = 'message error';
              messageDiv.textContent = data.message || 'Login failed';
            }
          } catch (error) {
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Error: ' + error.message;
          }
        });
      </script>
    </body>
    </html>
  `);
});

app.get('/dashboard', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Not a Label - Dashboard</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
        .stat { background: #f5f5f5; padding: 20px; border-radius: 10px; text-align: center; }
        .stat h3 { margin: 0 0 10px 0; color: #666; font-size: 14px; }
        .stat p { margin: 0; font-size: 32px; font-weight: bold; }
        button { padding: 10px 20px; margin: 10px; cursor: pointer; }
      </style>
    </head>
    <body>
      <h1>Not a Label Dashboard</h1>
      <div id="content">Loading...</div>
      
      <script>
        async function loadDashboard() {
          const token = localStorage.getItem('token');
          if (!token) {
            window.location.href = '/';
            return;
          }
          
          try {
            const response = await fetch('http://localhost:4000/api/analytics/dashboard', {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            
            if (!response.ok) {
              throw new Error('Failed to load dashboard');
            }
            
            const data = await response.json();
            const dashboard = data.dashboard;
            
            document.getElementById('content').innerHTML = \`
              <div class="stats">
                <div class="stat">
                  <h3>Total Streams</h3>
                  <p>\${dashboard.totalStreams.toLocaleString()}</p>
                </div>
                <div class="stat">
                  <h3>Monthly Growth</h3>
                  <p>+\${dashboard.monthlyGrowth}%</p>
                </div>
                <div class="stat">
                  <h3>Top Platform</h3>
                  <p>\${dashboard.topPlatforms[0]?.platform || 'N/A'}</p>
                </div>
              </div>
              
              <h2>Platform Breakdown</h2>
              <ul>
                \${dashboard.topPlatforms.map(p => 
                  '<li>' + p.platform + ': ' + p.total_streams.toLocaleString() + ' streams</li>'
                ).join('')}
              </ul>
              
              <button onclick="localStorage.clear(); window.location.href='/';">Logout</button>
            \`;
          } catch (error) {
            document.getElementById('content').innerHTML = '<p>Error: ' + error.message + '</p>';
          }
        }
        
        loadDashboard();
      </script>
    </body>
    </html>
  `);
});

app.listen(3000, () => {
  console.log('Simple frontend running at http://localhost:3000');
});