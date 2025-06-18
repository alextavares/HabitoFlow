const express = require('express');
const path = require('path');
const app = express();
const PORT = 5000;

// Servir arquivos estáticos
app.use(express.static('public'));
app.use('/src', express.static('src'));
app.use('/node_modules', express.static('node_modules'));

// Rota para a página de teste
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-web.html'));
});

// Rota principal
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>HabitoFlow</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 0;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
        }
        .container {
          text-align: center;
          color: white;
          padding: 40px;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          max-width: 600px;
        }
        h1 { font-size: 48px; margin-bottom: 20px; }
        .status {
          background: rgba(255,255,255,0.2);
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
        }
        .links {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-top: 30px;
        }
        a {
          background: white;
          color: #6366F1;
          padding: 15px 30px;
          border-radius: 25px;
          text-decoration: none;
          font-weight: bold;
          transition: all 0.3s;
        }
        a:hover {
          transform: scale(1.05);
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
        .error {
          background: rgba(239, 68, 68, 0.2);
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 HabitoFlow</h1>
        <div class="status">
          <h2>✅ Servidor Express Funcionando!</h2>
          <p>Porta: ${PORT}</p>
        </div>
        
        <div class="error">
          <h3>⚠️ Webpack ainda está compilando...</h3>
          <p>O servidor webpack está demorando para iniciar devido aos muitos módulos.</p>
          <p>Enquanto isso, você pode:</p>
        </div>
        
        <div class="links">
          <a href="/test">📱 Ver Demo</a>
          <a href="http://localhost:8080" target="_blank">🌐 Tentar Webpack</a>
        </div>
        
        <div style="margin-top: 30px; opacity: 0.8;">
          <p>Para rodar o app Android:</p>
          <code style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px;">
            npm run android
          </code>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`\n🎉 HabitoFlow servidor Express rodando!`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
  console.log(`🧪 Página de teste: http://localhost:${PORT}/test\n`);
});