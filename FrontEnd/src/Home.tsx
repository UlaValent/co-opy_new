/**
 * Home Page Component
 * 
 * The main landing page for the Co-opy drawing game.
 * Features a logo, action buttons for creating/joining rooms,
 * avatar selection, and floating controls. Includes modal
 * management for user interactions.
 */

import BackgroundLayers from './components/BackgroundLayers';
import MainContent from './components/MainContent';
import FloatingControls from './components/FloatingControls';
import ModalManager from './components/ModalManager';
import { useModalManager } from './hooks/useModalManager';
import { homeStyles } from './styles/homeStyles';
import { useEffect, useState } from 'react';
import { useLobbyName } from './hooks/useLobbyName';
import { getAuthSession } from './services/authSession';
import { useNavigate } from 'react-router-dom';

/**
 * Home page component with modal management
 * 
 * Renders the main game landing page with:
 * - Animated background layers
 * - Floating control buttons (sound, settings)
 * - Main content area with logo and action buttons
 * - Modal system for room creation, joining, and avatar selection
 */
function Home() {
  const navigate = useNavigate();
  // Modal state management using custom hook
  const {
    openModal,          // Currently open modal type
    closing,            // Whether modal is closing (for animations)
    selectedAvatar,     // Selected avatar ID
    setSelectedAvatar,  // Function to update selected avatar
    handleClose,        // Function to close current modal
    openCreateModal,    // Function to open create room modal
    openJoinModal,      // Function to open join room modal
    openChooseModal,    // Function to open avatar selection modal
  } = useModalManager();

  const { name, setName } = useLobbyName('');
  const [authMessage, setAuthMessage] = useState('');

  useEffect(() => {
    const session = getAuthSession();
    if (session?.account.username) {
      setName(session.account.username);
    }
    setSelectedAvatar(0);
  }, []);

  const ensureAuthenticated = async (): Promise<boolean> => {
    const session = getAuthSession();
    if (!session) {
      setAuthMessage('Please login or register first.');
      navigate('/auth', { state: { from: '/' } });
      return false;
    }

    if (!name?.trim()) {
      await setName(session.account.username);
    }

    setAuthMessage('');
    return true;
  };

  const handleCreateRoom = async () => {
    if (!(await ensureAuthenticated())) return;
    openCreateModal();
  };

  const handleJoinRoom = async () => {
    if (!(await ensureAuthenticated())) return;
    openJoinModal();
  };

  return (
    <BackgroundLayers>
      {/* Floating controls (sound toggle, settings) */}
      <FloatingControls />

      <button
        type="button"
        onClick={() => navigate('/auth', { state: { from: '/' } })}
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 5,
          fontFamily: "'Jersey 25', sans-serif",
          fontSize: '24px',
          borderRadius: '12px',
          border: '2px solid #b55d00',
          background: 'rgba(255, 232, 188, 0.95)',
          color: '#7a2500',
          padding: '8px 12px'
        }}
      >
        {getAuthSession() ? 'Manage Account' : 'Login / Register'}
      </button>
      
      {/* Main content area with logo and buttons */}
      <MainContent
        onCreateRoom={handleCreateRoom}    // Handler for create room button
        onJoinRoom={handleJoinRoom}        // Handler for join room button
        onChooseAvatar={openChooseModal}  // Handler for avatar selection button
      />

      {authMessage && (
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(140, 50, 0, 0.88)',
          color: '#fff6dd',
          padding: '8px 14px',
          borderRadius: '12px',
          fontFamily: "'Jersey 25', sans-serif",
          fontSize: '24px',
          zIndex: 5
        }}>
          {authMessage}
        </div>
      )}
      
      {/* Modal system for user interactions */}
      <ModalManager
        openModal={openModal}             // Current modal type
        closing={closing}                 // Animation state
        onClose={handleClose}             // Close handler
        selectedAvatar={selectedAvatar}   // Selected avatar state
        setSelectedAvatar={setSelectedAvatar} // Avatar selection handler
      />
      
      {/* Inject responsive styles for this page */}
      <style>{homeStyles}</style>
    </BackgroundLayers>
  );
}

export default Home