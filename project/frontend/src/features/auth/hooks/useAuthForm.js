import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { notifications } from '@mantine/notifications';

export function useAuthForm(isRegister) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');
    setNeedsVerification(false);
    setLoading(true);

    try {
      if (isRegister) {

        if (password !== confirmPassword) {
          setError('Hasla nie sa takie same');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('Haslo musi miec minimum 6 znakow');
          setLoading(false);
          return;
        }

        const response = await authService.register({
          username,
          email,
          password
        });

        if (response.success || response.data) {
          setSuccess('Konto utworzone! Sprawdz email aby zweryfikowac konto.');
          notifications.show({
            title: 'Sukces!',
            message: 'Konto utworzone. Sprawdz email.',
            color: 'green',
          });

          setUsername('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        } else {
          setError(response.message || 'Blad rejestracji');
        }

      } else {

        const response = await authService.login({ login, password });

        const result = response.data;


        if (result?.token) {

          console.log('SETTING AUTH WITH:', {
            username: result.username,
            email: result.email,
            id: result.userId,
            altId: result.id,
            altUser: result.user,
          });

          setAuth(
            {
              username: result.username,
              email: result.email,
              id: result.userId,
            },
            result.token
          );

          notifications.show({
            title: 'Zalogowano!',
            message: `Witaj, ${result.username}!`,
            color: 'green',
          });

          navigate('/dashboard');
        } else if (result?.needsVerification) {
          setNeedsVerification(true);
          setUserEmail(result.email || login);
          setError('Konto wymaga weryfikacji email');
        } else {
          setError('Nieprawidlowa odpowiedz serwera');
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Wystapil blad';
      setError(errorMsg);

      notifications.show({
        title: 'Blad',
        message: errorMsg,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    username,
    setUsername,
    email,
    setEmail,
    login,
    setLogin,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    success,
    setError,
    setSuccess,
    needsVerification,
    userEmail,
    loading,
    handleSubmit,
  };
}