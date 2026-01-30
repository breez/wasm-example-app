import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDiagnostics: () => void;
  onLogout: () => void;
}

// Get position synchronously
const getContentRootPosition = () => {
  const el = document.getElementById('content-root');
  if (!el) return { left: 0, width: window.innerWidth };
  const rect = el.getBoundingClientRect();
  return { left: rect.left, width: rect.width };
};

const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  onOpenDiagnostics,
  onLogout,
}) => {
  const [position, setPosition] = useState(getContentRootPosition);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculate position based on content-root element
  const calculatePosition = useCallback(() => {
    setPosition(getContentRootPosition());
  }, []);

  // Update position on resize
  useEffect(() => {
    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    return () => {
      window.removeEventListener('resize', calculatePosition);
    };
  }, [calculatePosition]);

  // Handle open/close animation
  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      setIsVisible(true);
      // Small delay to ensure DOM is ready before animating
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before hiding
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, calculatePosition]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleDiagnosticsClick = () => {
    onOpenDiagnostics();
    onClose();
  };

  const handleLogoutClick = () => {
    onLogout();
    onClose();
  };

  if (!isVisible) return null;

  const menuContent = (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{
        left: position.left,
        width: position.width || '100%',
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black transition-opacity duration-200 ease-out"
        style={{
          opacity: isAnimating ? 0.5 : 0,
        }}
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        className="absolute top-0 left-0 h-full w-72 bg-[var(--card-bg)] shadow-xl transition-transform duration-300 ease-out"
        style={{
          transform: isAnimating ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Close button */}
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="text-[rgb(var(--text-white))] hover:opacity-70"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu Items */}
        <nav className="px-4 py-2">
          <ul className="space-y-2">
            <li>
              <button
                onClick={handleDiagnosticsClick}
                className="w-full flex items-center px-4 py-3 text-[rgb(var(--text-white))] hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Diagnostics
              </button>
            </li>
            <li>
              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center px-4 py-3 text-[var(--accent-red)] hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );

  return createPortal(menuContent, document.body);
};

export default SideMenu;
