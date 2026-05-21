import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './styles/global.css';
import '../../../interfaces/bridge-tower-billboard.css';

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <App />
  </HashRouter>,
);
