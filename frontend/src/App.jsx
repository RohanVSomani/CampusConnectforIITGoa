import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Home from '@/pages/Home';
import Travel from '@/pages/Travel';
import Requests from '@/pages/Requests';
import Carpool from '@/pages/Carpool';
import Emergency from '@/pages/Emergency';
import Orders from '@/pages/Orders';
import Xerox from '@/pages/Xerox';
import Credits from '@/pages/Credits';
import CampusMap from '@/pages/CampusMap';
import Dashboard from '@/pages/Dashboard';
import Admin from '@/pages/Admin';
import Chat from '@/pages/Chat';
import XeroxShopDashboard from '@/pages/XeroxShopDashboard';

function ProtectedRoute({ children, adminOnly }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  // if (user?.role === 'shop') {
  //   return <Navigate to="/shop/orders" replace />;
  // }
  
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="travel" element={<Travel />} />
        <Route path="chat/:matchId" element={<Chat />} />
        <Route path="requests" element={<Requests />} />
        <Route path="carpool" element={<Carpool />} />
        <Route path="emergency" element={<Emergency />} />
        <Route path="orders" element={<Orders />} />
        <Route path="xerox" element={<Xerox />} />
        <Route path="credits" element={<Credits />} />
        <Route path="map" element={<CampusMap />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="shop/orders" element={<XeroxShopDashboard />} />

        <Route
          path="admin"
          element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
