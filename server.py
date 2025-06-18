#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            html = '''
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HabitoFlow - Servidor Python</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .container {
            text-align: center;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            width: 90%;
            animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        h1 {
            font-size: 48px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        .status {
            background: rgba(255, 255, 255, 0.2);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .success { color: #10B981; font-weight: bold; font-size: 20px; }
        .habit-demo {
            background: rgba(0, 0, 0, 0.2);
            padding: 20px;
            border-radius: 15px;
            margin: 20px 0;
        }
        .habit-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 10px;
            margin: 10px 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            transition: all 0.3s;
        }
        .habit-item:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateX(5px);
        }
        .habit-left {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .habit-icon {
            font-size: 30px;
        }
        .habit-name {
            font-size: 18px;
            font-weight: 500;
        }
        .habit-streak {
            font-size: 14px;
            opacity: 0.8;
        }
        .checkbox {
            width: 30px;
            height: 30px;
            border: 3px solid white;
            border-radius: 8px;
            cursor: pointer;
            position: relative;
            transition: all 0.3s;
        }
        .checkbox.checked {
            background: #10B981;
            border-color: #10B981;
        }
        .checkbox.checked::after {
            content: "✓";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 20px;
            font-weight: bold;
        }
        button {
            background: white;
            color: #6366F1;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            margin: 10px;
        }
        button:hover {
            transform: scale(1.05);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        .info {
            margin-top: 30px;
            opacity: 0.8;
            font-size: 14px;
        }
        code {
            background: rgba(0, 0, 0, 0.3);
            padding: 10px 15px;
            border-radius: 5px;
            display: inline-block;
            margin-top: 10px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>
            <span>🚀</span>
            <span>HabitoFlow</span>
        </h1>
        
        <div class="status">
            <p class="success">✅ Servidor Python Funcionando!</p>
            <p>Porta: ''' + str(PORT) + '''</p>
        </div>
        
        <div class="habit-demo">
            <h3 style="margin-bottom: 15px;">📱 Demo Interativo:</h3>
            
            <div class="habit-item" onclick="toggleHabit(this, 0)">
                <div class="habit-left">
                    <span class="habit-icon">💧</span>
                    <div>
                        <div class="habit-name">Beber Água</div>
                        <div class="habit-streak">🔥 5 dias de streak</div>
                    </div>
                </div>
                <div class="checkbox" id="habit-0"></div>
            </div>
            
            <div class="habit-item" onclick="toggleHabit(this, 1)">
                <div class="habit-left">
                    <span class="habit-icon">🏃</span>
                    <div>
                        <div class="habit-name">Exercício</div>
                        <div class="habit-streak">🔥 3 dias de streak</div>
                    </div>
                </div>
                <div class="checkbox" id="habit-1"></div>
            </div>
            
            <div class="habit-item" onclick="toggleHabit(this, 2)">
                <div class="habit-left">
                    <span class="habit-icon">📚</span>
                    <div>
                        <div class="habit-name">Leitura</div>
                        <div class="habit-streak">🔥 7 dias de streak</div>
                    </div>
                </div>
                <div class="checkbox" id="habit-2"></div>
            </div>
        </div>
        
        <div>
            <button onclick="testNotification()">🔔 Testar Notificação</button>
            <button onclick="showStats()">📊 Ver Estatísticas</button>
        </div>
        
        <div class="info">
            <p>Para executar o app completo:</p>
            <code>npm run android</code>
            <p style="margin-top: 10px;">ou</p>
            <code>npm run web</code>
        </div>
    </div>
    
    <script>
        let completedHabits = 0;
        
        function toggleHabit(element, id) {
            const checkbox = document.getElementById('habit-' + id);
            checkbox.classList.toggle('checked');
            
            if (checkbox.classList.contains('checked')) {
                completedHabits++;
                element.style.background = 'rgba(16, 185, 129, 0.2)';
            } else {
                completedHabits--;
                element.style.background = 'rgba(255, 255, 255, 0.1)';
            }
            
            if (completedHabits === 3) {
                celebrate();
            }
        }
        
        function celebrate() {
            alert('🎉 Parabéns! Você completou todos os hábitos de hoje!');
            // Resetar após celebração
            setTimeout(() => {
                document.querySelectorAll('.checkbox').forEach(cb => {
                    cb.classList.remove('checked');
                });
                document.querySelectorAll('.habit-item').forEach(item => {
                    item.style.background = 'rgba(255, 255, 255, 0.1)';
                });
                completedHabits = 0;
            }, 2000);
        }
        
        function testNotification() {
            if ('Notification' in window) {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification('HabitoFlow', {
                            body: '🎯 Hora de completar seus hábitos diários!',
                            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">🚀</text></svg>'
                        });
                    } else {
                        alert('Por favor, permita notificações nas configurações do navegador');
                    }
                });
            } else {
                alert('Notificações não suportadas neste navegador');
            }
        }
        
        function showStats() {
            alert('📊 Suas Estatísticas:\\n\\n✅ Hábitos completados hoje: ' + completedHabits + '/3\\n🔥 Maior streak: 7 dias\\n🏆 Conquistas desbloqueadas: 5\\n📈 Taxa de conclusão: 85%');
        }
        
        console.log('🚀 HabitoFlow Demo carregado com sucesso!');
    </script>
</body>
</html>
            '''
            self.wfile.write(html.encode())
        elif self.path == '/test-web.html':
            super().do_GET()
        else:
            super().do_GET()

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    print(f"\n🚀 HabitoFlow - Servidor Python")
    print(f"✅ Rodando em: http://localhost:{PORT}")
    print(f"📱 Pressione Ctrl+C para parar\n")
    httpd.serve_forever()