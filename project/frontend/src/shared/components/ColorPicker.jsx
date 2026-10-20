import { useState } from 'react';
import {
  Button, CheckIcon, ColorPicker as MantineColorPicker, ColorSwatch, Popover, SimpleGrid, Stack, Text, Tooltip,
  UnstyledButton,
} from '@mantine/core';

// 15 presets + the custom-color wheel = 16, i.e. two even rows of 8.
const COLORS = [
  { value: '#6366f1', label: 'Indygo' },
  { value: '#8b5cf6', label: 'Fioletowy' },
  { value: '#a855f7', label: 'Purpurowy' },
  { value: '#d946ef', label: 'Fuksja' },
  { value: '#ec4899', label: 'Różowy' },
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

const RAINBOW = 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)';

export default function ColorPicker({
  value,
  onChange,
  label = 'Kolor',
  size = 28
}) {
  const [pickerOpened, setPickerOpened] = useState(false);
  const isPreset = COLORS.some((c) => c.value.toLowerCase() === value?.toLowerCase());
  const isCustom = Boolean(value) && !isPreset;

  return (
    <Stack gap="xs">
      {label && (
        <Text size="sm" fw={500}>
          {label}
        </Text>
      )}
      <SimpleGrid cols={8} spacing={8} verticalSpacing={8} w="fit-content">
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

        {/* Rainbow wheel: opens a full palette; after picking, it shows the chosen custom color in the middle.
            The palette renders in a portal above modals, so a modal's edges cannot clip it. */}
        <Popover opened={pickerOpened} onChange={setPickerOpened} position="bottom" withArrow shadow="md" withinPortal zIndex={1000}>
          <Popover.Target>
            <Tooltip label="Własny kolor" withArrow openDelay={300}>
              <UnstyledButton
                type="button"
                aria-label="Własny kolor"
                aria-pressed={isCustom}
                onClick={() => setPickerOpened((o) => !o)}
                style={{
                  width: size,
                  height: size,
                  borderRadius: '50%',
                  background: RAINBOW,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                {isCustom && (
                  <span
                    style={{
                      width: size / 2,
                      height: size / 2,
                      borderRadius: '50%',
                      background: value,
                      border: '2px solid #fff',
                    }}
                  />
                )}
              </UnstyledButton>
            </Tooltip>
          </Popover.Target>
          <Popover.Dropdown>
            <Stack gap="xs">
              <MantineColorPicker format="hex" value={value || '#6366f1'} onChange={onChange} />
              <Button size="xs" variant="light" color="violet" onClick={() => setPickerOpened(false)}>
                Gotowe
              </Button>
            </Stack>
          </Popover.Dropdown>
        </Popover>
      </SimpleGrid>
    </Stack>
  );
}
