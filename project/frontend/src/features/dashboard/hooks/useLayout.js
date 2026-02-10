import { useState, useRef } from 'react';

export default function useLayout() {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [leftFullScreen, setLeftFullScreen] = useState(false);
  const [rightFullScreen, setRightFullScreen] = useState(false);

  const leftRef = useRef(null);
  const rightRef = useRef(null);

  const handleLeftResize = (width) => {
    if (leftRef.current) {
      leftRef.current.style.width = `${width}px`;
      localStorage.setItem('leftSidebarWidth', width);
    }
  };

  const handleRightResize = (width) => {
    if (rightRef.current) {
      rightRef.current.style.width = `${width}px`;
      localStorage.setItem('rightSidebarWidth', width);
    }
  };

  const resetLayout = () => {
    handleLeftResize(280);
    handleRightResize(320);
  };

  return {
    leftSidebarCollapsed,
    setLeftSidebarCollapsed,
    rightSidebarCollapsed,
    setRightSidebarCollapsed,
    leftFullScreen,
    setLeftFullScreen,
    rightFullScreen,
    setRightFullScreen,
    leftRef,
    rightRef,
    handleLeftResize,
    handleRightResize,
    resetLayout,
  };
}