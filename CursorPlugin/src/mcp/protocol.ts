/**
 * MCP Protocol Implementation using JSON-RPC 2.0
 * This file defines the core protocol types and utilities for communication between Cursor and Unity
 */

// JSON-RPC 2.0 Message Types
export interface RPCRequest {
    jsonrpc: '2.0';
    method: string;
    params?: any;
    id?: string | number;
}

export interface RPCResponse {
    jsonrpc: '2.0';
    result?: any;
    error?: RPCError;
    id: string | number | null;
}

export interface RPCError {
    code: number;
    message: string;
    data?: any;
}

export interface RPCNotification {
    jsonrpc: '2.0';
    method: string;
    params?: any;
}

// Unity Specific Types
export interface UnitySceneInfo {
    name: string;
    path: string;
    rootObjects: UnityGameObjectInfo[];
}

export interface UnityGameObjectInfo {
    name: string;
    instanceId: number;
    components?: string[];
    children?: number;
    active?: boolean;
}

export interface UnityCommand {
    command: string;
    args: any[];
}

// MCP Specific Message Types
export interface MCPMessage {
    type: 'command' | 'query' | 'event';
    payload: any;
}

export interface MCPCommand extends MCPMessage {
    type: 'command';
    payload: UnityCommand;
}

export interface MCPQuery extends MCPMessage {
    type: 'query';
    payload: {
        query: string;
        params: any;
    };
}

export interface MCPEvent extends MCPMessage {
    type: 'event';
    payload: {
        event: string;
        data: any;
    };
}

// Protocol Utilities
export class MCPProtocol {
    private static nextId = 1;
    private pendingRequests: Map<string | number, {
        resolve: (value: any) => void;
        reject: (reason: any) => void;
    }> = new Map();

    // Unity Specific Methods
    static createGetSceneInfoRequest(): RPCRequest {
        return this.createRequest('unity.getSceneInfo');
    }

    static createGetGameObjectInfoRequest(instanceId: number): RPCRequest {
        return this.createRequest('unity.getGameObjectInfo', instanceId);
    }

    static createExecuteCommandRequest(command: string, args: any[]): RPCRequest {
        return this.createRequest('unity.executeCommand', { command, args });
    }

    static createSubscribeToEventRequest(eventName: string): RPCRequest {
        return this.createRequest('unity.subscribeToEvent', eventName);
    }

    static createUnsubscribeFromEventRequest(eventName: string): RPCRequest {
        return this.createRequest('unity.unsubscribeFromEvent', eventName);
    }

    // Base Protocol Methods
    static createRequest(method: string, params?: any): RPCRequest {
        return {
            jsonrpc: '2.0',
            method,
            params,
            id: MCPProtocol.nextId++
        };
    }

    static createNotification(method: string, params?: any): RPCNotification {
        return {
            jsonrpc: '2.0',
            method,
            params
        };
    }

    static createResponse(id: string | number | null, result?: any, error?: RPCError): RPCResponse {
        return {
            jsonrpc: '2.0',
            id,
            result,
            error
        };
    }

    static createError(id: string | number | null, code: number, message: string, data?: any): RPCResponse {
        return {
            jsonrpc: '2.0',
            id,
            error: {
                code,
                message,
                data
            }
        };
    }

    public handleMessage(message: any): void {
        if (!this.isValidMessage(message)) {
            throw new Error('Invalid JSON-RPC message');
        }

        if (this.isRequest(message)) {
            this.handleRequest(message);
        } else if (this.isResponse(message)) {
            this.handleResponse(message);
        } else if (this.isNotification(message)) {
            this.handleNotification(message);
        }
    }

    private isValidMessage(message: any): boolean {
        return message && 
               message.jsonrpc === '2.0' &&
               (this.isRequest(message) || 
                this.isResponse(message) || 
                this.isNotification(message));
    }

    private isRequest(message: any): message is RPCRequest {
        return 'method' in message && 'id' in message;
    }

    private isResponse(message: any): message is RPCResponse {
        return ('result' in message || 'error' in message) && 'id' in message;
    }

    private isNotification(message: any): message is RPCNotification {
        return 'method' in message && !('id' in message);
    }

    private handleRequest(request: RPCRequest): void {
        // Handle incoming request
        // This should be implemented by the specific application
    }

    private handleResponse(response: RPCResponse): void {
        const pendingRequest = this.pendingRequests.get(response.id);
        if (pendingRequest) {
            if (response.error) {
                pendingRequest.reject(response.error);
            } else {
                pendingRequest.resolve(response.result);
            }
            this.pendingRequests.delete(response.id);
        }
    }

    private handleNotification(notification: RPCNotification): void {
        // Handle incoming notification
        // This should be implemented by the specific application
    }

    public sendRequest(ws: WebSocket, method: string, params?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const request = MCPProtocol.createRequest(method, params);
            this.pendingRequests.set(request.id, { resolve, reject });
            ws.send(JSON.stringify(request));
        });
    }

    public sendNotification(ws: WebSocket, method: string, params?: any): void {
        const notification = MCPProtocol.createNotification(method, params);
        ws.send(JSON.stringify(notification));
    }

    public sendResponse(ws: WebSocket, id: string | number | null, result?: any, error?: RPCError): void {
        const response = MCPProtocol.createResponse(id, result, error);
        ws.send(JSON.stringify(response));
    }
}

// Error Codes
export enum MCPErrorCode {
    ParseError = -32700,
    InvalidRequest = -32600,
    MethodNotFound = -32601,
    InvalidParams = -32602,
    InternalError = -32603,
    ServerError = -32000,
    Timeout = -32001,
    ConnectionError = -32002
} 