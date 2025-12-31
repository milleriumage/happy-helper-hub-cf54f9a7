import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { SharePage } from './components/SharePage';
import { ShareCardPage } from './components/ShareCardPage';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/share/:shareId" element={<SharePage />} />
        <Route path="/card/:shareId" element={<ShareCardPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
