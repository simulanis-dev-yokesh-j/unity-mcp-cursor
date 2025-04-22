import React, { useState, useEffect } from 'react';
import { MCPProtocol, MCPErrorCode } from '../mcp/protocol';

interface ConnectionStatusProps {
    isConnected: boolean;
    error?: string;
    onConnect: () => void;
    onDisconnect: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
    isConnected,
    error,
    onConnect,
    onDisconnect
}) => {
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            await onConnect();
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div className="mcp-connection-status">
            <div className="status-indicator">
                <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
                <span className="status-text">
                    {isConnected ? 'Connected to Unity' : 'Disconnected'}
                </span>
            </div>
            
            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            <div className="connection-controls">
                {!isConnected ? (
                    <button
                        className="connect-button"
                        onClick={handleConnect}
                        disabled={isConnecting}
                    >
                        {isConnecting ? 'Connecting...' : 'Connect to Unity'}
                    </button>
                ) : (
                    <button
                        className="disconnect-button"
                        onClick={onDisconnect}
                    >
                        Disconnect
                    </button>
                )}
            </div>

            <style jsx>{`
                .mcp-connection-status {
                    padding: 12px;
                    border-radius: 6px;
                    background-color: var(--vscode-editor-background);
                    border: 1px solid var(--vscode-panel-border);
                }

                .status-indicator {
                    display: flex;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    margin-right: 8px;
                }

                .status-dot.connected {
                    background-color: #4CAF50;
                }

                .status-dot.disconnected {
                    background-color: #F44336;
                }

                .status-text {
                    font-size: 14px;
                    color: var(--vscode-foreground);
                }

                .error-message {
                    display: flex;
                    align-items: center;
                    margin: 8px 0;
                    padding: 8px;
                    background-color: rgba(244, 67, 54, 0.1);
                    border-radius: 4px;
                }

                .error-icon {
                    margin-right: 8px;
                }

                .connection-controls {
                    margin-top: 12px;
                }

                button {
                    padding: 6px 12px;
                    border-radius: 4px;
                    border: none;
                    cursor: pointer;
                    font-size: 14px;
                    transition: background-color 0.2s;
                }

                .connect-button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                }

                .connect-button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }

                .connect-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .disconnect-button {
                    background-color: var(--vscode-errorForeground);
                    color: white;
                }

                .disconnect-button:hover {
                    background-color: #D32F2F;
                }
            `}</style>
        </div>
    );
}; 