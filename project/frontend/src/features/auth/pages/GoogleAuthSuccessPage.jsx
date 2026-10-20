import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Loader, Container, Text, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import AuthBackground from '../components/AuthBackground';
import { API_URL } from '../../../shared/utils/api';

export default function GoogleAuthSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUserFromGoogle } = useAuthStore();
  const [status, setStatus] = useState('Logowanie przez Google...');
  const [error, setError] = useState(null);
  const exchangeCalled = useRef(false);

  useEffect(() => {
    if (exchangeCalled.current) return;
    exchangeCalled.current = true;

    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('Logowanie przez Google nie powiodlo sie');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (!code) {
      setError('Brak kodu autoryzacji');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    fetch(`${API_URL}/auth/google/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.data?.token) {
        const { token, username, userId, email } = data.data;
        
        setUserFromGoogle(
          { 
            username, 
            id: userId, 
            email: email || '' 
          }, 
          token
        );

        notifications.show({
          title: 'Zalogowano!',
          message: `Witaj, ${username}!`,
          color: 'green',
        });

        navigate('/dashboard');
      } else {
        setError(data.message || 'Blad autoryzacji');
        setTimeout(() => navigate('/login'), 3000);
      }
    })
    .catch(err => {
      console.error('Google auth error:', err);
      setError('Blad polaczenia z serwerem');
      setTimeout(() => navigate('/login'), 3000);
    });

  }, [searchParams, setUserFromGoogle, navigate]);

  return (
    <AuthBackground>
      <Container w="100%" size={420} style={{ paddingTop: '100px' }}>
        <Stack align="center" gap="md">
          {error ? (
            <>
              <Text c="red" size="lg" fw={500}>{error}</Text>
              <Text c="dimmed" size="sm">Przekierowywanie do logowania...</Text>
            </>
          ) : (
            <>
              <Loader size="lg" color="violet" />
              <Text c="dimmed">{status}</Text>
            </>
          )}
        </Stack>
      </Container>
    </AuthBackground>
  );
}