import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
// ✨ 1. Router import kiya
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* ✨ 2. App ko BrowserRouter se wrap kar diya */}
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);