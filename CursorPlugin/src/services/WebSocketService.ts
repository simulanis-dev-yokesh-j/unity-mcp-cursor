import { MCPProtocol, RPCRequest, RPCResponse, RPCNotification } from '../mcp/protocol';

export class WebSocketService {
    private static instance: WebSocketService;
    private ws: WebSocket | null = null;
    private messageHandlers: Map<string, (data: any) => void> = new Map();
    private connectionHandlers: ((connected: boolean) => void)[] = [];
    private protocol: MCPProtocol;

    private constructor() {
        this.protocol = new MCPProtocol();
    }

    public static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    public async connect(port: number): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(`ws://localhost:${port}`);

                this.ws.onopen = () => {
                    this.notifyConnectionChange(true);
                    resolve();
                };

                this.ws.onclose = () => {
                    this.notifyConnectionChange(false);
                };

                this.ws.onerror = (error) => {
                    reject(new Error('WebSocket connection error'));
                };

                this.ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        this.protocol.handleMessage(message);
                    } catch (error) {
                        console.error('Error parsing message:', error);
                    }
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    public disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.notifyConnectionChange(false);
        }
    }

    public async sendRequest(method: string, params?: any): Promise<any> {
        if (!this.ws) {
            throw new Error('WebSocket is not connected');
        }
        return this.protocol.sendRequest(this.ws, method, params);
    }

    public sendNotification(method: string, params?: any): void {
        if (!this.ws) {
            throw new Error('WebSocket is not connected');
        }
        this.protocol.sendNotification(this.ws, method, params);
    }

    public isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    public onConnectionChange(handler: (connected: boolean) => void): void {
        this.connectionHandlers.push(handler);
    }

    public removeConnectionHandler(handler: (connected: boolean) => void): void {
        this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
    }

    private notifyConnectionChange(connected: boolean): void {
        this.connectionHandlers.forEach(handler => handler(connected));
    }
} 