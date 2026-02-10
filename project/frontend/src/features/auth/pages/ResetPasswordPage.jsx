import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Title,
  PasswordInput,
  Button,
  Alert,
  Stack,
  Text,
} from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import AuthBackground from '../components/AuthBackground';
import { authService } from '../services/authService';
import { notifications } from '@mantine/notifications';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Brak tokenu resetowania');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Hasła nie są identyczne');
      return;
    }

    if (password.length < 6) {
      setError('Hasło musi mieć minimum 6 znaków');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      notifications.show({
        title: 'Sukces!',
        message: 'Hasło zostało zmienione!',
        color: 'green',
      });
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setLoading(false);
      const errorMsg = err.response?.data?.message || 'Błąd resetowania hasła';
      setError(errorMsg);
      notifications.show({
        title: 'Błąd',
        message: errorMsg,
        color: 'red',
      });
    }
  };

  if (success) {
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
            <Alert icon={<IconCheck size={18} />} color="green">
              Hasło zostało zmienione! Za chwilę zostaniesz przekierowany do
              logowania...
            </Alert>
          </Paper>
        </Container>
      </AuthBackground>
    );
  }

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
          <Title order={2} ta="center" mb="xl" c="#111827">
            Nowe hasło
          </Title>

          {error && (
            <Alert
              icon={<IconAlertCircle size={18} />}
              color="red"
              mb="md"
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <PasswordInput
                label="Nowe hasło"
                placeholder="Minimum 6 znaków"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="md"
                styles={{
                  input: {
                    backgroundColor: '#f9fafb',
                    color: '#111827',
                    border: '1px solid #e5e7eb',
                  },
                  label: { color: '#6b7280' },
                }}
              />
              <PasswordInput
                label="Potwierdź hasło"
                placeholder="Powtórz hasło"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                size="md"
                styles={{
                  input: {
                    backgroundColor: '#f9fafb',
                    color: '#111827',
                    border: '1px solid #e5e7eb',
                  },
                  label: { color: '#6b7280' },
                }}
              />
              <Button
                type="submit"
                fullWidth
                size="md"
                loading={loading}
                style={{ backgroundColor: '#6366f1' }}
              >
                Zmień hasło
              </Button>
              <Text size="sm" ta="center">
                <Link
                  to="/login"
                  style={{ color: '#6366f1', textDecoration: 'none' }}
                >
                  Powrót do logowania
                </Link>
              </Text>
            </Stack>
          </form>
        </Paper>
      </Container>
    </AuthBackground>
  );
}