import { useState } from 'react';
import { Alert, Stack, TextInput, PasswordInput, Button, Text, Divider, Group } from '@mantine/core';
import { IconAlertCircle, IconBrandGoogle } from '@tabler/icons-react';
import { useAuthForm } from '../hooks/useAuthForm';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { notifications } from '@mantine/notifications';

export default function LoginForm() {
  const {
    login, setLogin,
    password, setPassword,
    error, success,
    handleSubmit,
    needsVerification, userEmail,
    loading,
  } = useAuthForm(false);

  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendVerification = async () => {
    try {
      await authService.resendVerification(userEmail);
      setResendSuccess(true);
      notifications.show({ title: 'Email wyslany!', message: 'Sprawdz skrzynke.', color: 'green' });
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      notifications.show({ title: 'Blad', message: 'Nie udalo sie wyslac.', color: 'red' });
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <>
      <Text fw={600} size="lg" ta="center" mb="md" c="#111827">Zaloguj sie</Text>

      {error && <Alert icon={<IconAlertCircle size={16} />} color="red" mb="sm" p="xs">{error}</Alert>}
      {success && <Alert color="teal" mb="sm" p="xs">{success}</Alert>}
      {resendSuccess && <Alert color="green" mb="sm" p="xs">Email wyslany ponownie.</Alert>}
      
      {needsVerification && (
        <Alert color="yellow" mb="sm" p="xs">
          <Group justify="space-between">
            <Text size="xs">Konto niezweryfikowane.</Text>
            <Button size="xs" variant="light" onClick={handleResendVerification}>Wyslij ponownie</Button>
          </Group>
        </Alert>
      )}

      <Button
        fullWidth
        size="sm"
        mb="sm"
        leftSection={<IconBrandGoogle size={18} />}
        onClick={handleGoogleLogin}
        variant="default"
      >
        Zaloguj przez Google
      </Button>

      <Divider label="lub" labelPosition="center" my="sm" />

      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          <TextInput
            label="Username lub Email"
            placeholder="jan@example.com"
            required
            size="sm"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />
          <PasswordInput
            label="Haslo"
            placeholder="Wprowadz haslo"
            required
            size="sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Group justify="space-between" align="center">
            <Link to="/forgot-password" style={{ color: '#6366f1', fontSize: '12px', textDecoration: 'none' }}>
              Zapomniałeś hasła?
            </Link>
            <Button type="submit" size="sm" loading={loading} color="violet">
              Zaloguj sie
            </Button>
          </Group>
        </Stack>
      </form>
    </>
  );
}