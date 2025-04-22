import React, { useState, useEffect } from 'react';
import { ConnectionStatus } from './ConnectionStatus';
import { SettingsPanel } from './SettingsPanel';
import { MCPProtocol } from '../mcp/protocol';

interface MCPPanelProps {
    onConnect: (port: number) => Promise<void>;
    onDisconnect: () => void;
    isConnected: boolean;
    error?: string;
}

export const MCPPanel: React.FC<MCPPanelProps> = ({
    onConnect,
    onDisconnect,
    isConnected,
    error
}) => {
    const [settings, setSettings] = useState({
        port: 8090,
        autoConnect: false,
        showNotifications: true
    });

    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        // Load saved settings
        const savedSettings = localStorage.getItem('mcp-settings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    const handleSettingsChange = (newSettings: typeof settings) => {
        setSettings(newSettings);
        localStorage.setItem('mcp-settings', JSON.stringify(newSettings));
    };

    const handleConnect = async () => {
        await onConnect(settings.port);
    };

    return (
        <div className="mcp-panel">
            <div className="panel-header">
                <h2>Unity MCP</h2>
                <button
                    className="settings-button"
                    onClick={() => setShowSettings(!showSettings)}
                >
                    {showSettings ? 'Hide Settings' : 'Show Settings'}
                </button>
            </div>

            {showSettings && (
                <SettingsPanel
                    settings={settings}
                    onSettingsChange={handleSettingsChange}
                />
            )}

            <ConnectionStatus
                isConnected={isConnected}
                error={error}
                onConnect={handleConnect}
                onDisconnect={onDisconnect}
            />

            <style jsx>{`
                .mcp-panel {
                    padding: 16px;
                    background-color: var(--vscode-sideBar-background);
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                h2 {
                    margin: 0;
                    color: var(--vscode-foreground);
                    font-size: 18px;
                }

                .settings-button {
                    padding: 4px 8px;
                    border-radius: 4px;
                    border: 1px solid var(--vscode-button-border);
                    background-color: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                    cursor: pointer;
                    font-size: 12px;
                }

                .settings-button:hover {
                    background-color: var(--vscode-button-secondaryHoverBackground);
                }
            `}</style>
        </div>
    );
}; 