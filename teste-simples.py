import http.server
import socketserver
import webbrowser
import time

PORT = 9999

html_content = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>HabitoFlow - Teste</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f0f0f0;
        }
        .success {
            background: #4CAF50;
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }
        .info {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        button {
            background: #2196F3;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background: #1976D2;
        }
    </style>
</head>
<body>
    <div class="success">
        <h1>✅ Servidor Funcionando!</h1>
        <p>HabitoFlow - Porta """ + str(PORT) + """</p>
    </div>
    
    <div class="info">
        <h2>Status do Sistema:</h2>
        <ul>
            <li>Python: ✅ Funcionando</li>
            <li>Servidor HTTP: ✅ Ativo</li>
            <li>Porta: """ + str(PORT) + """</li>
            <li>Hora: <span id="time"></span></li>
        </ul>
        
        <h3>Teste Interativo:</h3>
        <button onclick="alert('JavaScript funcionando!')">Testar JS</button>
        <button onclick="location.reload()">Recarregar</button>
        
        <h3>Próximos Passos:</h3>
        <ol>
            <li>O servidor web está funcionando corretamente</li>
            <li>Para rodar o app completo: <code>npm run web</code></li>
            <li>Para Android: <code>npm run android</code></li>
        </ol>
    </div>
    
    <script>
        document.getElementById('time').textContent = new Date().toLocaleString('pt-BR');
        console.log('HabitoFlow teste carregado com sucesso!');
    </script>
</body>
</html>
"""

class SimpleHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(html_content.encode('utf-8'))
        else:
            super().do_GET()

print(f"\n{'='*50}")
print(f"🚀 HabitoFlow - Servidor de Teste")
print(f"{'='*50}")
print(f"\n✅ Iniciando servidor na porta {PORT}...")

try:
    with socketserver.TCPServer(("", PORT), SimpleHandler) as httpd:
        print(f"✅ Servidor iniciado com sucesso!")
        print(f"\n📱 Acesse: http://localhost:{PORT}")
        print(f"\n⏹️  Pressione Ctrl+C para parar\n")
        
        # Tentar abrir o navegador automaticamente
        time.sleep(1)
        webbrowser.open(f'http://localhost:{PORT}')
        
        httpd.serve_forever()
except Exception as e:
    print(f"\n❌ ERRO ao iniciar servidor: {e}")
    print(f"\nPossíveis soluções:")
    print(f"1. Verifique se a porta {PORT} está livre")
    print(f"2. Tente executar como administrador")
    print(f"3. Verifique o firewall do Windows")
    input("\nPressione Enter para sair...")