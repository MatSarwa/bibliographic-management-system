import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Title,
  TextInput,
  Button,
  Alert,
  Stack,
  Text,
} from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import AuthBackground from '../components/AuthBackground';
import { authService } from '../services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Błąd wysyłania emaila');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthBackground>
        <Container size={420} style={{ position: 'relative', zIndex: 1, paddingTop: '80px' }}>
          <Paper withBorder shadow="xl" p={36} radius="md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}>
            <Alert icon={<IconCheck size={18} />} color="green">
              Link do resetowania hasła został wysłany na {email}
            </Alert>
            <Text size="sm" ta="center" mt="md">
              <Link to="/login" style={{ color: '#6366f1' }}>
                Powrót do logowania
              </Link>
            </Text>
          </Paper>
        </Container>
      </AuthBackground>
    );
  }

  return (
    <AuthBackground>
      <Container size={420} style={{ position: 'relative', zIndex: 1, paddingTop: '80px' }}>
        <Paper withBorder shadow="xl" p={36} radius="md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}>
          <Title order={2} ta="center" mb="xl" c="#111827">
            Resetowanie hasła
          </Title>

          {error && (
            <Alert icon={<IconAlertCircle size={18} />} color="red" mb="md">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="Twój adres email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="md"
              />
              <Button type="submit" fullWidth size="md" loading={loading} style={{ backgroundColor: '#6366f1' }}>
                Wyślij link resetujący
              </Button>
              <Text size="sm" ta="center">
                <Link to="/login" style={{ color: '#6366f1', textDecoration: 'none' }}>
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