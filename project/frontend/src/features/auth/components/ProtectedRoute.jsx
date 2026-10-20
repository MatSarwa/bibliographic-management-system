import { Navigate } from 'react-router-dom';
import { Center, Loader } from '@mantine/core';
import { useState, useEffect } from 'react';

export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
  
    const token = localStorage.getItem('token');
    
    setHasToken(!!token);
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader size="lg" color="violet" />
      </Center>
    );
  }

  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}