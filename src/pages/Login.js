// src/pages/Login.js
import React from 'react';
import LoginForm from '../components/auth/Login';

const Login = () => {
  return (
    <div className="login-page">
      <div className="container">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;