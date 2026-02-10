import { Box, ActionIcon, Tooltip } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useRef, useState } from 'react';

export default function Resizer({ 
  onResize, 
  position = 'right', 
  sidebarRef,
  onToggleCollapse,
  isCollapsed 
}) {
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseDown = (e) => {
    if (isCollapsed) return;
    e.preventDefault();
    isDragging.current = true;
    startX.current = e.clientX;
    
    if (sidebarRef?.current) {
      startWidth.current = sidebarRef.current.offsetWidth;
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !sidebarRef?.current) return;

    const delta = position === 'right' 
      ? e.clientX - startX.current
      : startX.current - e.clientX;

    const newWidth = startWidth.current + delta;
    
    const minWidth = position === 'right' ? 200 : 250;
    const maxWidth = position === 'right' ? 500 : 600;
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));

    sidebarRef.current.style.width = `${clampedWidth}px`;

    if (newWidth < 100) {
      handleMouseUp();
      onToggleCollapse();
    }
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';

    if (sidebarRef?.current && onResize) {
      const finalWidth = sidebarRef.current.offsetWidth;
      onResize(finalWidth);
    }
  };

  if (isCollapsed) {
    return (
      <Box
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'fixed',
          top: 60,
          [position === 'right' ? 'left' : 'right']: 0,
          width: '4px',
          height: 'calc(100vh - 60px)',
          cursor: 'pointer',
          zIndex: 10, 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isHovered ? '#d1d5db' : '#e5e7eb',
          transition: 'all 0.2s ease'
        }}
        onClick={onToggleCollapse}
      >
        <Tooltip 
          label="Rozwiń panel" 
          position={position === 'right' ? 'right' : 'left'}
          offset={10}
        >
          <ActionIcon
            size="xs"
            variant="subtle"
            color="gray"
            style={{
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.2s ease',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              zIndex: 10 
            }}
          >
            {position === 'right' ? (
              <IconChevronRight size={12} />
            ) : (
              <IconChevronLeft size={12} />
            )}
          </ActionIcon>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'absolute',
        top: 0,
        [position]: 0,
        width: '16px',
        height: '100%',
        cursor: 'col-resize',
        zIndex: 10, 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease'
      }}
    >
      <Box
        style={{
          position: 'absolute',
          [position]: 0,
          top: 0,
          bottom: 0,
          width: '16px',
        }}
      />

      <Box
        style={{
          width: '3px',
          height: '32px',
          backgroundColor: isDragging.current 
            ? '#9ca3af' 
            : isHovered 
              ? '#d1d5db' 
              : '#e5e7eb',
          borderRadius: '2px',
          transition: 'all 0.2s ease',
          pointerEvents: 'none',
          marginBottom: '8px'
        }}
      />

      <Tooltip 
        label="Schowaj panel" 
        position={position === 'right' ? 'left' : 'right'}
        offset={5}
        withArrow
      >
        <Box
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse();
          }}
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '3px',
            backgroundColor: isHovered ? '#f3f4f6' : 'transparent',
            border: isHovered ? '1px solid #e5e7eb' : '1px solid transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: isHovered ? 1 : 0,
            transition: 'all 0.2s ease',
            pointerEvents: 'auto',
            zIndex: 10 
          }}
        >
          {position === 'right' ? (
            <IconChevronLeft size={14} color="#6b7280" />
          ) : (
            <IconChevronRight size={14} color="#6b7280" />
          )}
        </Box>
      </Tooltip>

      <Box
        style={{
          width: '3px',
          height: '32px',
          backgroundColor: isDragging.current 
            ? '#9ca3af' 
            : isHovered 
              ? '#d1d5db' 
              : '#e5e7eb',
          borderRadius: '2px',
          transition: 'all 0.2s ease',
          pointerEvents: 'none',
          marginTop: '8px'
        }}
      />
    </Box>
  );
}