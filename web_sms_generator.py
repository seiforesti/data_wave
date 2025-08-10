#!/usr/bin/env python3
"""
Web-based SMS Verification Generator
Simple web interface for generating fake phone numbers and verification codes.
"""

import json
import random
import time
from datetime import datetime, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse
import webbrowser
import threading

class SMSVerificationAPI:
    def __init__(self):
        self.us_area_codes = [
            "201", "202", "203", "205", "206", "212", "213", "214", "215",
            "216", "217", "301", "302", "303", "304", "305", "310", "312",
            "313", "314", "315", "316", "317", "318", "404", "405", "406",
            "407", "408", "409", "410", "412", "413", "414", "415", "417",
            "501", "502", "503", "504", "505", "510", "512", "513", "515",
            "516", "517", "518", "520", "530", "540", "541", "559", "561",
            "562", "601", "602", "603", "605", "606", "607", "608", "609",
            "610", "612", "614", "615", "616", "617", "618", "619", "620"
        ]
        self.active_sessions = {}
    
    def generate_phone(self, country="us"):
        if country.lower() == "us":
            area_code = random.choice(self.us_area_codes)
            exchange = random.randint(200, 999)
            number = random.randint(1000, 9999)
            return f"+1-{area_code}-{exchange:03d}-{number:04d}"
        elif country.lower() == "uk":
            prefix = random.choice(["7400", "7500", "7600", "7700", "7800"])
            suffix = random.randint(100000, 999999)
            return f"+44-{prefix}-{suffix:06d}"
        else:
            return self.generate_phone("us")
    
    def send_verification(self, phone):
        code = f"{random.randint(100000, 999999):06d}"
        expiry = datetime.now() + timedelta(minutes=5)
        
        self.active_sessions[phone] = {
            "code": code,
            "expiry": expiry,
            "attempts": 0
        }
        
        return code
    
    def verify_code(self, phone, code):
        if phone not in self.active_sessions:
            return {"success": False, "message": "No verification session found"}
        
        session = self.active_sessions[phone]
        
        if datetime.now() > session["expiry"]:
            del self.active_sessions[phone]
            return {"success": False, "message": "Code expired"}
        
        if session["attempts"] >= 3:
            del self.active_sessions[phone]
            return {"success": False, "message": "Too many attempts"}
        
        session["attempts"] += 1
        
        if code == session["code"]:
            del self.active_sessions[phone]
            return {"success": True, "message": "Verification successful!"}
        else:
            return {"success": False, "message": f"Invalid code. {3 - session['attempts']} attempts remaining"}

class WebHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.api = SMSVerificationAPI()
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        if self.path == '/' or self.path == '/index.html':
            self.serve_html()
        elif self.path.startswith('/api/generate'):
            self.handle_generate()
        elif self.path.startswith('/api/send'):
            self.handle_send()
        elif self.path.startswith('/api/verify'):
            self.handle_verify()
        elif self.path.startswith('/api/sessions'):
            self.handle_sessions()
        else:
            self.send_error(404)
    
    def do_POST(self):
        self.do_GET()
    
    def serve_html(self):
        html = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SMS Verification Generator</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .container {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        h1 {
            text-align: center;
            color: #4a5568;
            margin-bottom: 30px;
            font-size: 2.5em;
        }
        .section {
            margin: 30px 0;
            padding: 20px;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            background: #f7fafc;
        }
        .section h2 {
            color: #2d3748;
            margin-top: 0;
        }
        button {
            background: #4299e1;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            margin: 5px;
            transition: background 0.3s;
        }
        button:hover {
            background: #3182ce;
        }
        input, select {
            padding: 10px;
            border: 2px solid #e2e8f0;
            border-radius: 5px;
            font-size: 16px;
            margin: 5px;
        }
        .result {
            background: #edf2f7;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            font-family: monospace;
            white-space: pre-wrap;
        }
        .success {
            background: #c6f6d5;
            border-left: 4px solid #38a169;
        }
        .error {
            background: #fed7d7;
            border-left: 4px solid #e53e3e;
        }
        .warning {
            background: #faf089;
            border-left: 4px solid #d69e2e;
            color: #744210;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: bold;
        }
        .phone-item {
            background: white;
            padding: 10px;
            margin: 5px 0;
            border-radius: 5px;
            border-left: 4px solid #4299e1;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📱 SMS Verification Generator</h1>
        
        <div class="warning">
            ⚠️ These are FAKE phone numbers for testing only! Do not use for real communication.
        </div>
        
        <div class="section">
            <h2>🎲 Generate Phone Numbers</h2>
            <select id="country">
                <option value="us">United States (+1)</option>
                <option value="uk">United Kingdom (+44)</option>
            </select>
            <input type="number" id="count" value="1" min="1" max="20" placeholder="Count">
            <button onclick="generateNumbers()">Generate Numbers</button>
            <div id="generated-numbers"></div>
        </div>
        
        <div class="section">
            <h2>📨 Send Verification Code</h2>
            <input type="text" id="send-phone" placeholder="Enter phone number" style="width: 250px;">
            <button onclick="sendVerification()">Send Code</button>
            <div id="send-result"></div>
        </div>
        
        <div class="section">
            <h2>✅ Verify Code</h2>
            <input type="text" id="verify-phone" placeholder="Phone number" style="width: 200px;">
            <input type="text" id="verify-code" placeholder="6-digit code" style="width: 150px;" maxlength="6">
            <button onclick="verifyCode()">Verify</button>
            <div id="verify-result"></div>
        </div>
        
        <div class="section">
            <h2>📋 Active Sessions</h2>
            <button onclick="listSessions()">Refresh Sessions</button>
            <button onclick="clearSessions()">Clear All</button>
            <div id="sessions-list"></div>
        </div>
    </div>

    <script>
        async function generateNumbers() {
            const country = document.getElementById('country').value;
            const count = document.getElementById('count').value;
            
            try {
                const response = await fetch(`/api/generate?country=${country}&count=${count}`);
                const data = await response.json();
                
                const container = document.getElementById('generated-numbers');
                container.innerHTML = '<div class="result">';
                data.numbers.forEach((phone, index) => {
                    container.innerHTML += `<div class="phone-item">${index + 1}. ${phone}</div>`;
                });
                container.innerHTML += '</div>';
                
            } catch (error) {
                document.getElementById('generated-numbers').innerHTML = 
                    '<div class="result error">Error generating numbers</div>';
            }
        }
        
        async function sendVerification() {
            const phone = document.getElementById('send-phone').value;
            if (!phone) {
                alert('Please enter a phone number');
                return;
            }
            
            try {
                const response = await fetch(`/api/send?phone=${encodeURIComponent(phone)}`);
                const data = await response.json();
                
                document.getElementById('send-result').innerHTML = 
                    `<div class="result success">
📱 SMS sent to: ${phone}
🔐 Verification code: ${data.code}
⏰ Expires in 5 minutes
                    </div>`;
                    
                // Auto-fill verify phone field
                document.getElementById('verify-phone').value = phone;
                
            } catch (error) {
                document.getElementById('send-result').innerHTML = 
                    '<div class="result error">Error sending verification</div>';
            }
        }
        
        async function verifyCode() {
            const phone = document.getElementById('verify-phone').value;
            const code = document.getElementById('verify-code').value;
            
            if (!phone || !code) {
                alert('Please enter both phone number and code');
                return;
            }
            
            try {
                const response = await fetch(`/api/verify?phone=${encodeURIComponent(phone)}&code=${code}`);
                const data = await response.json();
                
                const resultClass = data.success ? 'success' : 'error';
                const icon = data.success ? '✅' : '❌';
                
                document.getElementById('verify-result').innerHTML = 
                    `<div class="result ${resultClass}">${icon} ${data.message}</div>`;
                    
                if (data.success) {
                    document.getElementById('verify-code').value = '';
                }
                
            } catch (error) {
                document.getElementById('verify-result').innerHTML = 
                    '<div class="result error">Error verifying code</div>';
            }
        }
        
        async function listSessions() {
            try {
                const response = await fetch('/api/sessions');
                const data = await response.json();
                
                const container = document.getElementById('sessions-list');
                
                if (Object.keys(data).length === 0) {
                    container.innerHTML = '<div class="result">No active verification sessions</div>';
                    return;
                }
                
                let html = '<div class="result">';
                for (const [phone, info] of Object.entries(data)) {
                    html += `
                        <div class="phone-item">
                            📱 ${phone}<br>
                            🔐 Code: ${info.code}<br>
                            ⏰ Expires in: ${info.expires_in}<br>
                            🔄 Attempts: ${info.attempts}/3
                        </div>
                    `;
                }
                html += '</div>';
                container.innerHTML = html;
                
            } catch (error) {
                document.getElementById('sessions-list').innerHTML = 
                    '<div class="result error">Error loading sessions</div>';
            }
        }
        
        async function clearSessions() {
            try {
                const response = await fetch('/api/sessions?action=clear');
                const data = await response.json();
                
                document.getElementById('sessions-list').innerHTML = 
                    '<div class="result success">All sessions cleared</div>';
                    
            } catch (error) {
                document.getElementById('sessions-list').innerHTML = 
                    '<div class="result error">Error clearing sessions</div>';
            }
        }
        
        // Auto-refresh sessions every 30 seconds
        setInterval(listSessions, 30000);
        
        // Load initial sessions
        listSessions();
    </script>
</body>
</html>
        """
        
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(html.encode())
    
    def handle_generate(self):
        query = parse_qs(urlparse(self.path).query)
        country = query.get('country', ['us'])[0]
        count = int(query.get('count', ['1'])[0])
        
        numbers = []
        for _ in range(min(count, 20)):  # Limit to 20
            numbers.append(self.api.generate_phone(country))
        
        response = {"numbers": numbers, "country": country}
        self.send_json_response(response)
    
    def handle_send(self):
        query = parse_qs(urlparse(self.path).query)
        phone = query.get('phone', [''])[0]
        
        if not phone:
            self.send_json_response({"error": "Phone number required"}, 400)
            return
        
        code = self.api.send_verification(phone)
        response = {"phone": phone, "code": code, "message": "Verification code sent"}
        self.send_json_response(response)
    
    def handle_verify(self):
        query = parse_qs(urlparse(self.path).query)
        phone = query.get('phone', [''])[0]
        code = query.get('code', [''])[0]
        
        if not phone or not code:
            self.send_json_response({"error": "Phone and code required"}, 400)
            return
        
        result = self.api.verify_code(phone, code)
        self.send_json_response(result)
    
    def handle_sessions(self):
        query = parse_qs(urlparse(self.path).query)
        action = query.get('action', [''])[0]
        
        if action == 'clear':
            self.api.active_sessions.clear()
            self.send_json_response({"message": "Sessions cleared"})
        else:
            sessions = self.api.active_sessions # Changed from get_active_sessions() to active_sessions
            self.send_json_response(sessions)
    
    def send_json_response(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def log_message(self, format, *args):
        pass  # Suppress log messages

def start_server(port=8080):
    """Start the web server"""
    server = HTTPServer(('localhost', port), WebHandler)
    print(f"🌐 SMS Verification Generator Web Interface")
    print(f"🚀 Server starting on http://localhost:{port}")
    print(f"📱 Open your browser to start generating fake phone numbers!")
    print(f"⏹️  Press Ctrl+C to stop the server")
    print()
    
    # Try to open browser automatically
    try:
        threading.Timer(1.0, lambda: webbrowser.open(f'http://localhost:{port}')).start()
    except:
        pass
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")

if __name__ == "__main__":
    import sys
    
    port = 8080
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("Invalid port number. Using default 8080.")
    
    start_server(port)