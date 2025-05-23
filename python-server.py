#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 3000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b'''
            <html>
            <body>
            <h1>Not a Label - Working!</h1>
            <p>The server is accessible at port 3000</p>
            <p>Backend API: <a href="http://localhost:4000/__test">http://localhost:4000/__test</a></p>
            </body>
            </html>
            ''')
        else:
            super().do_GET()

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    print(f"Server running at http://localhost:{PORT}/")
    httpd.serve_forever()