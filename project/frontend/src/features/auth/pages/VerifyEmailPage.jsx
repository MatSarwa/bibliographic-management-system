import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Title,
  Text,
  Loader,
  Stack,
  Button,
  Alert,
} from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import AuthBackground from '../components/AuthBackground';
import { authService } from '../services/authService';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const navigate = useNavigate();
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;

    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      return;
    }

    hasVerified.current = true;

    authService
      .verifyEmail(token)
      .then(() => {
        setStatus('success');
        setTimeout(() => navigate('/login'), 3000);
      })
      .catch((err) => {
        console.error('Verification error:', err);
        if (err.response?.data?.expired) {
          setStatus('expired');
        } else {
          setStatus('error');
        }
      });
  }, [searchParams, navigate]);

  return (
    <AuthBackground>
      <Container
        size={420}
        style={{ position: 'relative', zIndex: 1, paddingTop: '80px' }}
      >
        <Paper
          withBorder
          shadow="xl"
          p={36}
          radius="md"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}
        >
          <Stack align="center" gap="md">
            {status === 'verifying' && (
              <>
                <Loader size="lg" color="violet" />
                <Title order={3} c="#111827">
                  Weryfikacja emaila...
                </Title>
                <Text size="sm" c="#6b7280">
                  Proszę czekać
                </Text>
              </>
            )}

            {status === 'success' && (
              <>
                <Alert
                  icon={<IconCheck size={24} />}
                  title="Sukces!"
                  color="green"
                  w="100%"
                  variant="light"
                >
                  <Text size="sm">Email został zweryfikowany pomyślnie!</Text>
                </Alert>
                <Text size="sm" c="#6b7280">
                  Za chwilę zostaniesz przekierowany...
                </Text>
              </>
            )}

            {status === 'expired' && (
              <>
                <Alert
                  icon={<IconX size={24} />}
                  title="Token wygasł"
                  color="orange"
                  w="100%"
                  variant="light"
                >
                  <Text size="sm" mb="md">
                    Link weryfikacyjny wygasł. Zarejestruj się ponownie.
                  </Text>
                </Alert>
                <Button
                  onClick={() => navigate('/login')}
                  fullWidth
                  variant="light"
                  color="violet"
                >
                  Przejdź do rejestracji
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <Alert
                  icon={<IconX size={24} />}
                  title="Błąd weryfikacji"
                  color="red"
                  w="100%"
                  variant="light"
                >
                  <Text size="sm" mb="md">
                    Token weryfikacyjny jest nieprawidłowy. Spróbuj zarejestrować
                    się ponownie.
                  </Text>
                </Alert>
                <Button
                  onClick={() => navigate('/login')}
                  fullWidth
                  variant="light"
                  color="violet"
                >
                  Przejdź do logowania
                </Button>
              </>
            )}
          </Stack>
        </Paper>
      </Container>
    </AuthBackground>
  );
}