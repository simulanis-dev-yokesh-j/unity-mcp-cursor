import React, { useState, useEffect } from 'react';
import { WebSocketService } from '../services/WebSocketService';
import { JsonRpcErrorCodes } from '../mcp/protocol';

export const TestConnection: React.FC = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [sceneInfo, setSceneInfo] = useState<any>(null);
    const wsService = WebSocketService.getInstance();

    useEffect(() => {
        const handleConnectionChange = (connected: boolean) => {
            setIsConnected(connected);
            if (!connected) {
                setError('Disconnected from Unity server');
            }
        };

        wsService.onConnectionChange(handleConnectionChange);
        return () => {
            wsService.removeConnectionHandler(handleConnectionChange);
        };
    }, []);

    const handleConnect = async () => {
        try {
            setError(undefined);
            await wsService.connect(8090);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to connect to Unity server');
        }
    };

    const handleDisconnect = () => {
        try {
            wsService.disconnect();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error disconnecting from Unity server');
        }
    };

    const handleGetSceneInfo = async () => {
        try {
            const result = await wsService.sendRequest('unity.getSceneInfo');
            setSceneInfo(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error getting scene info');
        }
    };

    return (
        <div className="test-connection">
            <h2>Unity Connection Test</h2>
            
            <div className="connection-status">
                <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>

            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            <div className="connection-controls">
                {!isConnected ? (
                    <button onClick={handleConnect}>Connect to Unity</button>
                ) : (
                    <button onClick={handleDisconnect}>Disconnect</button>
                )}
            </div>

            {isConnected && (
                <div className="test-actions">
                    <button onClick={handleGetSceneInfo}>Get Scene Info</button>
                </div>
            )}

            {sceneInfo && (
                <div className="scene-info">
                    <h3>Scene Information</h3>
                    <pre>{JSON.stringify(sceneInfo, null, 2)}</pre>
                </div>
            )}

            <style jsx>{`
                .test-connection {
                    padding: 20px;
                    background-color: var(--vscode-editor-background);
                    border-radius: 6px;
                    border: 1px solid var(--vscode-panel-border);
                }

                .connection-status {
                    display: flex;
                    align-items: center;
                    margin: 10px 0;
                }

                .status-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    margin-right: 8px;
                }

                .status-dot.connected {
                    background-color: #4CAF50;
                }

                .status-dot.disconnected {
                    background-color: #F44336;
                }

                .error-message {
                    display: flex;
                    align-items: center;
                    margin: 10px 0;
                    padding: 8px;
                    background-color: rgba(244, 67, 54, 0.1);
                    border-radius: 4px;
                }

                .error-icon {
                    margin-right: 8px;
                }

                .connection-controls {
                    margin: 10px 0;
                }

                button {
                    padding: 8px 16px;
                    border-radius: 4px;
                    border: none;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    cursor: pointer;
                    margin-right: 8px;
                }

                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }

                .test-actions {
                    margin: 10px 0;
                }

                .scene-info {
                    margin-top: 20px;
                    padding: 10px;
                    background-color: var(--vscode-editor-background);
                    border-radius: 4px;
                    border: 1px solid var(--vscode-panel-border);
                }

                pre {
                    margin: 0;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }
            `}</style>
        </div>
    );
}; 