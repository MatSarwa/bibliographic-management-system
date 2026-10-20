import { Box } from '@mantine/core';
import Navbar from './Navbar';
import LeftSidebar from './LeftSidebar/index';
import RightSidebar from './RightSidebar';
import useLayout from '../hooks/useLayout';

export default function DashboardLayout({ 
  children, 
  selectedView, 
  onSelectView,
  selectedItem,
  onEditItem,
  onToggleFavorite,
  onOpenAddModal
}) {
  const layout = useLayout();

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--app-hover)' }}>
      <Navbar onOpenAddModal={onOpenAddModal} />

      <Box style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {!layout.rightFullScreen && (
          <LeftSidebar
            selectedView={selectedView}
            onSelectView={onSelectView}
            onResize={layout.handleLeftResize}
            leftRef={layout.leftRef}
            onToggleCollapse={() => layout.setLeftSidebarCollapsed(!layout.leftSidebarCollapsed)}
            isCollapsed={layout.leftSidebarCollapsed}
          />
        )}

        <Box
          style={{
            flex: 1,
            backgroundColor: 'var(--app-hover)',
            overflow: 'auto',
          }}
        >
          {children}
        </Box>

        {!layout.leftFullScreen && (
          <RightSidebar
            selectedItem={selectedItem}
            onEdit={onEditItem}
            onToggleFavorite={onToggleFavorite}
            onResize={layout.handleRightResize}
            rightRef={layout.rightRef}
            onToggleCollapse={() => layout.setRightSidebarCollapsed(!layout.rightSidebarCollapsed)}
            isCollapsed={layout.rightSidebarCollapsed}
          />
        )}
      </Box>
    </Box>
  );
}