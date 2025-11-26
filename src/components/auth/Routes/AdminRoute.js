import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  console.log('🔒 AdminRoute checking access...');
  
  // Get user from localStorage
  const userStr = localStorage.getItem('madeasy_user');
  console.log('📋 User from localStorage:', userStr);
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log('👤 Parsed user:', user);
      
      if (user.role === 'admin' || user.role === 'super_admin') {
        console.log('✅ Admin access granted');
        return children;
      } else {
        console.log('❌ User is not admin');
        return <Navigate to="/" replace />;
      }
    } catch (error) {
      console.error('❌ Error parsing user:', error);
    }
  } else {
    console.log('❌ No user found in localStorage');
  }
  
  console.log('🔄 Redirecting to admin login');
  return <Navigate to="/admin/login" replace />;
};

export default AdminRoute;
