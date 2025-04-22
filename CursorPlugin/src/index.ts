import * as WebSocket from 'ws';

interface MCPMessage {
    type: string;
    command?: string;
    query?: string;
    parameters?: Record<string, any>;
}

interface MCPResponse {
    success: boolean;
    message?: string;
    data?: any;
}

class MCPClient {
    private ws: WebSocket;
    private connected: boolean = false;
    private messageQueue: MCPMessage[] = [];
    private responseHandlers: Map<string, (response: MCPResponse) => void> = new Map();

    constructor(private url: string = 'ws://localhost:8090') {
        this.connect();
    }

    private connect() {
        this.ws = new WebSocket(this.url);

        this.ws.on('open', () => {
            this.connected = true;
            console.log('Connected to Unity MCP server');
            this.processMessageQueue();
        });

        this.ws.on('message', (data: WebSocket.Data) => {
            try {
                const response: MCPResponse = JSON.parse(data.toString());
                this.handleResponse(response);
            } catch (error) {
                console.error('Error parsing response:', error);
            }
        });

        this.ws.on('close', () => {
            this.connected = false;
            console.log('Disconnected from Unity MCP server');
            // Attempt to reconnect after 5 seconds
            setTimeout(() => this.connect(), 5000);
        });

        this.ws.on('error', (error: Error) => {
            console.error('WebSocket error:', error);
        });
    }

    private processMessageQueue() {
        while (this.messageQueue.length > 0 && this.connected) {
            const message = this.messageQueue.shift();
            if (message) {
                this.sendMessage(message);
            }
        }
    }

    private sendMessage(message: MCPMessage) {
        if (!this.connected) {
            this.messageQueue.push(message);
            return;
        }

        try {
            this.ws.send(JSON.stringify(message));
        } catch (error) {
            console.error('Error sending message:', error);
            this.messageQueue.push(message);
        }
    }

    private handleResponse(response: MCPResponse) {
        // Handle the response based on the message ID or other criteria
        console.log('Received response:', response);
    }

    public sendCommand(command: string, parameters?: Record<string, any>): Promise<MCPResponse> {
        return new Promise((resolve) => {
            const message: MCPMessage = {
                type: 'command',
                command,
                parameters
            };
            this.sendMessage(message);
            // Store the resolve function to be called when response is received
            this.responseHandlers.set(command, resolve);
        });
    }

    public sendQuery(query: string, parameters?: Record<string, any>): Promise<MCPResponse> {
        return new Promise((resolve) => {
            const message: MCPMessage = {
                type: 'query',
                query,
                parameters
            };
            this.sendMessage(message);
            // Store the resolve function to be called when response is received
            this.responseHandlers.set(query, resolve);
        });
    }

    public disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

// Export the MCPClient class
export { MCPClient, MCPMessage, MCPResponse }; 