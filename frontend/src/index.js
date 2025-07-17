/**
 * AdMimic React App Entry Point
 * Renders the main application with proper configuration
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render app with error boundary protection
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);