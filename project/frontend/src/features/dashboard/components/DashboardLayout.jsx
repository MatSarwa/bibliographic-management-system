import { useState } from 'react';
import { Box, Drawer } from '@mantine/core';
import Navbar from './Navbar';
import LeftSidebar from './LeftSidebar/index';
import RightSidebar from './RightSidebar';
import DetailPanel from '../../items/components/DetailPanel';
import useLayout from '../hooks/useLayout';
import { useIsMobile } from '../../../shared/hooks/useIsMobile';

export default function DashboardLayout({
  children,
  selectedView,
  onSelectView,
  selectedItem,
  onCloseItem,
  onEditItem,
  onToggleFavorite,
  onOpenAddModal
}) {
  const layout = useLayout();
  const isMobile = useIsMobile();
  const [menuOpened, setMenuOpened] = useState(false);

  // On phones the menu closes as soon as a view is picked, so the list is visible right away.
  const handleSelectViewMobile = (view) => {
    onSelectView(view);
    setMenuOpened(false);
  };

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100dvh', backgroundColor: 'var(--app-hover)' }}>
      <Navbar
        onOpenAddModal={onOpenAddModal}
        isMobile={isMobile}
        menuOpened={menuOpened}
        onToggleMenu={() => setMenuOpened((opened) => !opened)}
      />

      <Box style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {!isMobile && !layout.rightFullScreen && (
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
            minWidth: 0,
            backgroundColor: 'var(--app-hover)',
            overflow: 'auto',
          }}
        >
          {children}
        </Box>

        {!isMobile && !layout.leftFullScreen && (
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

      {isMobile && (
        <>
          {/* keepMounted: the sidebar owns modals (new collection, sharing) that must survive the drawer closing */}
          <Drawer
            opened={menuOpened}
            onClose={() => setMenuOpened(false)}
            size={300}
            padding={0}
            withCloseButton={false}
            keepMounted
          >
            <LeftSidebar
              inDrawer
              selectedView={selectedView}
              onSelectView={handleSelectViewMobile}
            />
          </Drawer>

          <Drawer
            opened={Boolean(selectedItem)}
            onClose={onCloseItem}
            position="right"
            size="100%"
            title="Szczegóły pozycji"
          >
            {selectedItem && (
              <DetailPanel
                item={selectedItem}
                onEdit={onEditItem}
                onToggleFavorite={onToggleFavorite}
              />
            )}
          </Drawer>
        </>
      )}
    </Box>
  );
}
