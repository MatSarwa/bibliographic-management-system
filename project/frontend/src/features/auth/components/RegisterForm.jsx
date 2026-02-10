import { Alert, Stack, TextInput, PasswordInput, Button, Text, Group } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAuthForm } from '../hooks/useAuthForm';

export default function RegisterForm() {
  const {
    username, setUsername,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    error, success,
    handleSubmit,
    loading,
  } = useAuthForm(true);

  return (
    <>
      <Text fw={600} size="lg" ta="center" mb="md" c="#111827">Utworz konto</Text>

      {error && <Alert icon={<IconAlertCircle size={16} />} color="red" mb="sm" p="xs">{error}</Alert>}
      {success && <Alert color="teal" mb="sm" p="xs">{success}</Alert>}

      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          <Group grow>
            <TextInput
              label="Nazwa uzytkownika"
              placeholder="jan.kowalski"
              required
              size="sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextInput
              label="Email"
              placeholder="jan@example.com"
              type="email"
              required
              size="sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Group>
          <Group grow>
            <PasswordInput
              label="Haslo"
              placeholder="Min. 6 znakow"
              required
              size="sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordInput
              label="Potwierdz haslo"
              placeholder="Powtorz haslo"
              required
              size="sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Group>
          <Button type="submit" fullWidth size="sm" loading={loading} color="violet">
            Zarejestruj sie
          </Button>
        </Stack>
      </form>
    </>
  );
}