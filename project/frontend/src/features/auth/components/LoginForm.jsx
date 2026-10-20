import { useState } from 'react';
import { Alert, Box, Stack, TextInput, PasswordInput, Button, Text, Divider, Group } from '@mantine/core';
import { IconAlertCircle, IconBrandGoogle } from '@tabler/icons-react';
import { useAuthForm } from '../hooks/useAuthForm';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { notifications } from '@mantine/notifications';
import { API_URL } from '../../../shared/utils/api';
import { GOOGLE_LOGIN_ENABLED, REGISTRATION_ENABLED } from '../../../shared/config/features';

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
    } catch {
      notifications.show({ title: 'Blad', message: 'Nie udalo sie wyslac.', color: 'red' });
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <>
      <Text fw={600} size="lg" ta="center" mb="md" c="var(--mantine-color-text)">Zaloguj sie</Text>

      {/* Fixed-height slot for one message at a time, so the form never changes size when it appears. */}
      <Box mih={44} mb="sm">
        {needsVerification ? (
          <Alert color="yellow" p="xs">
            <Group justify="space-between" wrap="nowrap">
              <Text size="sm">{resendSuccess ? 'Email wysłany ponownie.' : 'Konto niezweryfikowane.'}</Text>
              <Button size="xs" variant="light" color="yellow" onClick={handleResendVerification} disabled={resendSuccess}>
                Wyślij ponownie
              </Button>
            </Group>
          </Alert>
        ) : error ? (
          <Alert icon={<IconAlertCircle size={16} />} color="red" p="xs">{error}</Alert>
        ) : success ? (
          <Alert color="teal" p="xs">{success}</Alert>
        ) : null}
      </Box>

      {GOOGLE_LOGIN_ENABLED && (
        <>
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
        </>
      )}

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
          <Group justify={REGISTRATION_ENABLED ? 'space-between' : 'flex-end'} align="center">
            {REGISTRATION_ENABLED && (
              <Link to="/forgot-password" style={{ color: 'var(--mantine-primary-color-filled)', fontSize: '12px', textDecoration: 'none' }}>
                Zapomniałeś hasła?
              </Link>
            )}
            <Button type="submit" size="sm" loading={loading} color="violet">
              Zaloguj sie
            </Button>
          </Group>
        </Stack>
      </form>
    </>
  );
}