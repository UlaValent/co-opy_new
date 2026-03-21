import ExpandButton from './ExpandButton';
import { mainActionButtonStyle, chooseAvatarButtonStyle } from '../styles/buttonStyles';

interface MainContentProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onChooseAvatar: () => void;
  onAuthNavigate: () => void;
  onManageAccount: () => void;
  isAuthenticated: boolean;
}

export default function MainContent({ onCreateRoom, onJoinRoom, onChooseAvatar, onAuthNavigate, onManageAccount, isAuthenticated }: MainContentProps) {
  return (
    <div
      style={{
        position: "relative",
        zIndex: 2,
        width: "90%",
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      {/* Logo */}
      <img
        src="/logo.png"
        alt="Co-opy Logo"
        style={{
          width: "90%",
          maxWidth: "1200px",
          minWidth: "300px",
          display: "block",
          margin: "0 auto 2vw auto",
          pointerEvents: "none",
        }}
      />
      
      {/* BUTTONS & TEXT SECTION */}
      {isAuthenticated ? (
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              color: "#790000",
              fontFamily: "'Jersey 25', sans-serif",
              fontWeight: "normal",
              fontSize: "2.2vw",
              marginBottom: "0.5rem",
              lineHeight: 1,
              pointerEvents: "none",
              textAlign: "center",
              minHeight: "2.2rem",
            }}
          >
            Create or join a room:
          </div>

          <div
            style={{
              display: "flex",
              gap: "2vw",
              marginBottom: "1.2rem",
              flexWrap: "wrap",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <ExpandButton style={mainActionButtonStyle} onClick={onCreateRoom}>
              CREATE ROOM
            </ExpandButton>
            <ExpandButton style={mainActionButtonStyle} onClick={onJoinRoom}>
              JOIN ROOM
            </ExpandButton>
          </div>

          <ExpandButton style={chooseAvatarButtonStyle} onClick={onChooseAvatar}>
            CHOOSE YOUR AVATAR
          </ExpandButton>

          <div style={{ marginTop: "0.8rem" }}>
            <ExpandButton style={chooseAvatarButtonStyle} onClick={onManageAccount}>
              MANAGE ACCOUNT
            </ExpandButton>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.9rem",
          }}
        >
          <div
            style={{
              color: "#790000",
              fontFamily: "'Jersey 25', sans-serif",
              fontWeight: "normal",
              fontSize: "clamp(20px, 1.5vw, 28px)",
              lineHeight: 1.1,
              textAlign: "center",
              background: "rgba(255, 233, 176, 0.86)",
              border: "2px solid #f0a41e",
              borderRadius: "16px",
              padding: "8px 16px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            }}
          >
            Login or register to continue.
          </div>

          <ExpandButton style={mainActionButtonStyle} onClick={onAuthNavigate}>
            LOGIN / REGISTER
          </ExpandButton>
        </div>
      )}
    </div>
  );
}