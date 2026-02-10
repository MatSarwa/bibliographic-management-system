import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import App from './App';
import { useAuthStore } from './features/auth/store/authStore';
import api from './shared/utils/api';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

function AuthInitializer({ children }) {
  const { setAuth, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      api.get('/auth/verify')
        .then((res) => {

          const userData = res.data?.data?.user || res.data?.data || res.data;


          if (userData?.username && (userData?.id || userData?.userId)) {
            setAuth(
              {
                username: userData.username,
                email: userData.email,
                id: userData.id || userData.userId,
              },
              token
            );
          } else {
            console.warn('VERIFY - invalid user data:', userData);

            setLoading(false);
          }
        })
        .catch((err) => {
          console.error('Token verification failed:', err);
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  return children;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider
      theme={{
        primaryColor: 'violet',
        colors: {
          violet: [
            '#f3f0ff',
            '#e5dbff',
            '#d0bfff',
            '#b197fc',
            '#9775fa',
            '#845ef7',
            '#7950f2',
            '#7048e8',
            '#6741d9',
            '#5f3dc4',
          ],
        },
      }}
    >
      <Notifications position="top-right" />
      <AuthInitializer>
        <App />
      </AuthInitializer>
    </MantineProvider>
  </React.StrictMode>,
);