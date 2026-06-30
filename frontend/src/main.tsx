import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <WorkspaceProvider>
      <App />
    </WorkspaceProvider>
  </React.StrictMode>,
);
