import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import Datasets from './pages/Datasets';
import DatasetView from './pages/DatasetView';
import { useAuthStore } from './store/authStore';
import AutoML from './pages/AutoML';
import Predict from './pages/Predict';
import Reports from './pages/Reports';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
          />
        </Route>

        {/* Dashboard Routes (Protected in Layout) */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="datasets" element={<Datasets />} />
          <Route path="datasets/:id" element={<DatasetView />} />
          <Route path="automl" element={<AutoML />} />
          <Route path="predict" element={<Predict />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<div className="p-4 text-center">Settings Page (Coming Soon)</div>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
