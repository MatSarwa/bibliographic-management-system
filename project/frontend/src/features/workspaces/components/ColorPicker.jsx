import { CheckIcon, ColorInput, ColorSwatch, Group, Stack, Text, Tooltip } from '@mantine/core';

export const COLORS = [
  { value: '#6366f1', label: 'Indygo' },
  { value: '#8b5cf6', label: 'Fioletowy' },
  { value: '#a855f7', label: 'Purpurowy' },
  { value: '#d946ef', label: 'Fuksja' },
  { value: '#ec4899', label: 'Różowy' },
  { value: '#f43f5e', label: 'Malinowy' },
  { value: '#ef4444', label: 'Czerwony' },
  { value: '#f97316', label: 'Pomarańczowy' },
  { value: '#f59e0b', label: 'Bursztynowy' },
  { value: '#eab308', label: 'Żółty' },
  { value: '#84cc16', label: 'Limonkowy' },
  { value: '#10b981', label: 'Zielony' },
  { value: '#14b8a6', label: 'Morski' },
  { value: '#06b6d4', label: 'Cyjan' },
  { value: '#3b82f6', label: 'Niebieski' },
  { value: '#64748b', label: 'Grafitowy' },
];

// Preset swatches plus a free color field (with a full picker) for anything outside the presets.
export default function ColorPicker({
  value,
  onChange,
  label = 'Kolor',
  size = 28
}) {
  const isPreset = COLORS.some((c) => c.value.toLowerCase() === value?.toLowerCase());

  return (
    <Stack gap="xs">
      {label && (
        <Text size="sm" fw={500}>
          {label}
        </Text>
      )}
      <Group gap={8}>
        {COLORS.map((c) => {
          const selected = c.value.toLowerCase() === value?.toLowerCase();
          return (
            <Tooltip key={c.value} label={c.label} withArrow openDelay={300}>
              <ColorSwatch
                component="button"
                type="button"
                color={c.value}
                size={size}
                onClick={() => onChange(c.value)}
                aria-label={c.label}
                aria-pressed={selected}
                style={{ cursor: 'pointer', color: '#fff' }}
              >
                {selected && <CheckIcon size={12} />}
              </ColorSwatch>
            </Tooltip>
          );
        })}
      </Group>
      <ColorInput
        size="sm"
        label="Własny kolor"
        placeholder="#a1b2c3"
        format="hex"
        value={isPreset ? '' : value || ''}
        onChange={(hex) => hex && onChange(hex)}
        swatches={COLORS.map((c) => c.value)}
        swatchesPerRow={8}
        withEyeDropper={false}
      />
    </Stack>
  );
}
