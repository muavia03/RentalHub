import { AppRegistry } from 'react-native';
import App from '../App';
import './index.css';

AppRegistry.registerComponent('Main', () => App);
if (typeof document !== 'undefined') {
  AppRegistry.runApplication('Main', {
    initialProps: {},
    rootTag: document.getElementById('root'),
  });
}
