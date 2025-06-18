import { AppRegistry } from 'react-native';
import App from './App.web';

// Registrar o app
AppRegistry.registerComponent('HabitoFlow', () => App);

// Criar root element se não existir
if (!document.getElementById('root')) {
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
}

// Rodar o app
AppRegistry.runApplication('HabitoFlow', {
  rootTag: document.getElementById('root')
});