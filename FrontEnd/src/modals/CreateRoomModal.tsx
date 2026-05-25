import ExpandButton from '../components/ExpandButton';
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import lobbyHub from "../services/lobbyHub";
import * as api from "../services/lobbyApi";
import { useLobbyName } from "../hooks/useLobbyName";

type GameModePreset = 'Standard' | 'Short' | 'Long' | 'Multiplayer';

const gameModeOptions: Array<{
    value: GameModePreset;
    label: string;
    description: string;
}> = [
    { value: 'Standard', label: 'Standard', description: 'Default 5 minute session for 2 players.' },
    { value: 'Short', label: 'Short', description: '3 minute session for quick rounds.' },
    { value: 'Long', label: 'Long', description: '8 minute session for longer play.' },
    { value: 'Multiplayer', label: 'Multiplayer', description: '5 minute shared-canvas mode for up to 4 players.' },
];

type Props = {
    onClose?: () => void
    selectedAvatar?: number | null
}

function CreateRoomModal({ onClose = () => {}, selectedAvatar }: Props) {
    const { name } = useLobbyName('');
    const [status, setStatus] = useState<string>("");
    const [showModes, setShowModes] = useState(false);
    const [selectedMode, setSelectedMode] = useState<GameModePreset>('Standard');
    const navigate = useNavigate();

    const handleCreate = async () => {
        if (!name || !name.trim()) { setStatus("Set a name first"); return; }

        // Get avatarId from sessionStorage, fallback to prop or default to 1
        const storedAvatarId = sessionStorage.getItem('avatarId');
        const avatarId = storedAvatarId ? parseInt(storedAvatarId, 10) : (selectedAvatar ?? 1);
        console.log("Avatars", sessionStorage.getItem('avatarId'), avatarId);

        setStatus("Creating lobby...");
        try {
            const res = await api.joinLobby({
                LobbyId: "",
                Username: name.trim(),
                IconId: avatarId,
                GameMode: selectedMode,
            });
            if (!res.ok) { setStatus("Create failed: " + (res.message ?? "unknown")); return; }

            const code = res.lobbyCode ?? (res.message ?? "");
            if (!code) { setStatus("Create failed: no code returned"); return; }

            // start hub and add player (match Lobby.tsx behavior)
            await lobbyHub.start();
            await lobbyHub.addPlayerToLobby(code, name.trim(), avatarId);

            sessionStorage.setItem('lobbyId', code);

            setStatus("Lobby created: " + code);

            // Navigate to Lobby page and pass lobby code in state
            navigate('/lobby', { state: { lobbyCode: code } });
            onClose();
        } catch (err) {
            console.error("Create lobby error", err);
            setStatus("Create failed: " + ((err as any)?.message ?? String(err)));
        }
    };

    return (
        <div className="create-room-modal" style={{
                background: '#FFC892',
                border: '3px solid #FFB042',
                borderRadius: '30px',
                padding: '35px',
                minWidth: '450px',
                maxWidth: '550px',
                minHeight: '350px',
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                position: 'relative'
            }}>
            
            {/* Close Button */}
            <ExpandButton 
                onClick={onClose}
                className="close-button"
                style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: 'rgba(139, 69, 19, 0.8)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    zIndex: 10
                }}
            >
                ×
            </ExpandButton>
            
            {/* Title Block */}
            <div className="modal-title-block" style={{
                background: '#FF962C',
                border: '2px solid #DE5C00',
                borderRadius: '15px',
                padding: '16px 20px',
                marginBottom: '35px',
                marginLeft: 'auto',
                marginRight: 'auto',
                width: 'fit-content',
                minWidth: '200px',
                maxWidth: '240px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                opacity: 0.73
            }}>
                <h2 style={{
                    color: '#FFE9A1',
                    fontFamily: "'Jersey 25', sans-serif",
                    fontSize: '32px',
                    margin: '0',
                    textAlign: 'center',
                    fontWeight: 'normal',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                }}>
                    CREATE ROOM
                </h2>
            </div>

            <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: '24px'
            }}>
                <ExpandButton
                    onClick={() => setShowModes((current) => !current)}
                    style={{
                        padding: '14px 28px',
                        background: showModes ? '#DE5C00' : '#FEC65F',
                        color: showModes ? '#FFF8E0' : '#DA6804',
                        border: '2px solid #FF9500',
                        borderRadius: '18px',
                        fontSize: '22px',
                        fontFamily: "'Jersey 25', sans-serif",
                        cursor: 'pointer',
                        boxShadow: '0 4px 8px rgba(255, 149, 0, 0.25)'
                    }}
                >
                    Gamemodes
                </ExpandButton>
                <div style={{
                    alignSelf: 'center',
                    color: '#8B4513',
                    fontFamily: "'Jersey 25', sans-serif",
                    fontSize: '20px'
                }}>
                    Selected: {selectedMode}
                </div>
            </div>

            {showModes && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '12px',
                    marginBottom: '24px'
                }}>
                    {gameModeOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setSelectedMode(option.value)}
                            style={{
                                textAlign: 'left',
                                padding: '14px 16px',
                                borderRadius: '18px',
                                border: selectedMode === option.value ? '3px solid #DE5C00' : '2px solid rgba(139,69,19,0.2)',
                                background: selectedMode === option.value ? '#FFF0C2' : 'rgba(255,255,255,0.85)',
                                color: '#7A3B00',
                                cursor: 'pointer',
                                boxShadow: '0 3px 8px rgba(0,0,0,0.12)',
                                fontFamily: "'Jersey 25', sans-serif"
                            }}
                        >
                            <div style={{ fontSize: '22px', marginBottom: '6px' }}>{option.label}</div>
                            <div style={{ fontSize: '16px', lineHeight: 1.2 }}>{option.description}</div>
                        </button>
                    ))}
                </div>
            )}

            {/* Status Message */}
            {status && <div style={{ textAlign: 'center', color: '#8B4513', marginBottom: 12 }}>{status}</div>}
                    
            {/* Create Button */}
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <ExpandButton
                    onClick={handleCreate}
                    style={{
                        padding: '16px 40px',
                        background: '#FEC65F',
                        color: '#DA6804',
                        border: '2px solid #FF9500',
                        borderRadius: '20px',
                        fontSize: '24px',
                        fontFamily: "'Jersey 25', sans-serif",
                        cursor: 'pointer',
                        fontWeight: 'normal',
                        boxShadow: '0 4px 8px rgba(255, 149, 0, 0.3)',
                        opacity: 1
                    }}
                >
                    Create
                </ExpandButton>
            </div>
        </div>
    )
}

export default CreateRoomModal
