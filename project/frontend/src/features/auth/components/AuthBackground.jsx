import { Box } from '@mantine/core';

export default function AuthBackground({ children }) {
  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--app-hover) 0%, var(--mantine-color-default-border) 100%)',
        position: 'relative',
      }}
    >
      <Box
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.12) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />
      {children}
    </Box>
  );
}