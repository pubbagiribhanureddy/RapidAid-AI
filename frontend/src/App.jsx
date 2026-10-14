import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ReportPage from './pages/ReportPage.jsx';
import MapPage from './pages/MapPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ReportPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
