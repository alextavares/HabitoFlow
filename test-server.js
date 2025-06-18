const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Servir arquivos estáticos
app.use(express.static('public'));

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'HabitoFlow API funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota principal
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>HabitoFlow - Teste</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          min-height: 100vh;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
          padding: 40px 20px;
        }
        h1 {
          font-size: 48px;
          margin-bottom: 20px;
        }
        .status {
          background: rgba(255,255,255,0.2);
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
        }
        .button {
          background: white;
          color: #667eea;
          padding: 15px 30px;
          border: none;
          border-radius: 25px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          margin: 10px;
        }
        .button:hover {
          transform: scale(1.05);
          transition: all 0.3s;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 HabitoFlow</h1>
        <div class="status">
          <h2>✅ Servidor de Teste Funcionando!</h2>
          <p>Porta: ${PORT}</p>
          <p>Status: Online</p>
        </div>
        <div>
          <a href="/api/test" class="button">Testar API</a>
          <button class="button" onclick="alert('HabitoFlow está pronto para desenvolvimento!')">
            Testar Interação
          </button>
        </div>
        <div style="margin-top: 40px; opacity: 0.8;">
          <p>Para executar o app completo:</p>
          <code style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px;">
            npm run web
          </code>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`\n🎉 HabitoFlow teste servidor rodando!`);
  console.log(`📱 Acesse: http://localhost:${PORT}\n`);
});