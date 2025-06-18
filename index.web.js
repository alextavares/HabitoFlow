import { AppRegistry } from 'react-native';
import App from './App';
import appConfig from './app.json';

const appName = appConfig.name;

// Registrar o app
AppRegistry.registerComponent(appName, () => App);

// Rodar o app na web
AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root')
});