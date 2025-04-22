using UnityEngine;
using System;
using System.Net;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Collections.Generic;
using UniRx;
using System.Linq;

namespace FF.MCPCursor.Runtime
{
    public class MCPServer : MonoBehaviour
    {
        [SerializeField] private int port = 8090;
        [SerializeField] private float connectionTimeout = 30f;
        
        private HttpListener httpListener;
        private List<WebSocket> clients = new List<WebSocket>();
        private CancellationTokenSource cancellationTokenSource;
        private bool isRunning = false;
        private Dictionary<string, Func<JsonRpcRequest, Task<JsonRpcResponse>>> commandHandlers;
        private Subject<JsonRpcNotification> eventSubject = new Subject<JsonRpcNotification>();

        private void Start()
        {
            InitializeCommandHandlers();
            StartServer();
        }

        private void InitializeCommandHandlers()
        {
            commandHandlers = new Dictionary<string, Func<JsonRpcRequest, Task<JsonRpcResponse>>>
            {
                { "unity.getSceneInfo", HandleGetSceneInfo },
                { "unity.getGameObjectInfo", HandleGetGameObjectInfo },
                { "unity.executeCommand", HandleExecuteCommand },
                { "unity.subscribeToEvent", HandleSubscribeToEvent },
                { "unity.unsubscribeFromEvent", HandleUnsubscribeFromEvent }
            };
        }

        private void OnDestroy()
        {
            StopServer();
            eventSubject.Dispose();
        }

        public async void StartServer()
        {
            if (isRunning) return;

            cancellationTokenSource = new CancellationTokenSource();
            isRunning = true;

            httpListener = new HttpListener();
            httpListener.Prefixes.Add($"http://localhost:{port}/");
            httpListener.Start();

            Debug.Log($"MCP Server started on port {port}");

            try
            {
                while (!cancellationTokenSource.Token.IsCancellationRequested)
                {
                    var context = await httpListener.GetContextAsync();
                    if (context.Request.IsWebSocketRequest)
                    {
                        ProcessWebSocketRequest(context);
                    }
                    else
                    {
                        context.Response.StatusCode = 400;
                        context.Response.Close();
                    }
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"Server error: {e.Message}");
            }
        }

        private async void ProcessWebSocketRequest(HttpListenerContext context)
        {
            var webSocketContext = await context.AcceptWebSocketAsync(null);
            var webSocket = webSocketContext.WebSocket;
            clients.Add(webSocket);

            Debug.Log("New client connected");

            try
            {
                await HandleWebSocketConnection(webSocket);
            }
            catch (Exception e)
            {
                Debug.LogError($"WebSocket error: {e.Message}");
            }
            finally
            {
                clients.Remove(webSocket);
                webSocket.Dispose();
            }
        }

        private async Task HandleWebSocketConnection(WebSocket webSocket)
        {
            var buffer = new byte[4096];
            var receiveBuffer = new ArraySegment<byte>(buffer);

            while (webSocket.State == WebSocketState.Open)
            {
                var result = await webSocket.ReceiveAsync(receiveBuffer, cancellationTokenSource.Token);
                
                if (result.MessageType == WebSocketMessageType.Text)
                {
                    var message = System.Text.Encoding.UTF8.GetString(buffer, 0, result.Count);
                    if (JsonRpc2.IsValidMessage(message))
                    {
                        await HandleMessage(webSocket, message);
                    }
                    else
                    {
                        var error = JsonRpc2.CreateError(JsonRpcErrorCodes.ParseError, "Invalid JSON-RPC message");
                        var response = JsonRpc2.CreateResponse(null, null, error);
                        await SendResponse(webSocket, response);
                    }
                }
                else if (result.MessageType == WebSocketMessageType.Close)
                {
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Client closed", CancellationToken.None);
                    break;
                }
            }
        }

        private async Task HandleMessage(WebSocket webSocket, string message)
        {
            try
            {
                var jsonRpcMessage = JsonRpc2.ParseMessage(message);
                
                if (jsonRpcMessage.method != null && jsonRpcMessage.id != null)
                {
                    // Handle request
                    var request = new JsonRpcRequest
                    {
                        jsonrpc = jsonRpcMessage.jsonrpc,
                        method = jsonRpcMessage.method,
                        @params = jsonRpcMessage.@params,
                        id = jsonRpcMessage.id
                    };

                    var response = await ProcessRequest(request);
                    await SendResponse(webSocket, response);
                }
                else if (jsonRpcMessage.method != null)
                {
                    // Handle notification
                    var notification = new JsonRpcNotification
                    {
                        jsonrpc = jsonRpcMessage.jsonrpc,
                        method = jsonRpcMessage.method,
                        @params = jsonRpcMessage.@params
                    };

                    await ProcessNotification(notification);
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"Error processing message: {e.Message}");
                var error = JsonRpc2.CreateError(JsonRpcErrorCodes.InternalError, e.Message);
                var response = JsonRpc2.CreateResponse(null, null, error);
                await SendResponse(webSocket, response);
            }
        }

        private async Task<JsonRpcResponse> ProcessRequest(JsonRpcRequest request)
        {
            if (commandHandlers.TryGetValue(request.method, out var handler))
            {
                return await handler(request);
            }

            return JsonRpc2.CreateResponse(
                request.id,
                null,
                JsonRpc2.CreateError(JsonRpcErrorCodes.MethodNotFound, $"Method not found: {request.method}")
            );
        }

        private async Task ProcessNotification(JsonRpcNotification notification)
        {
            if (notification.method == "unity.event")
            {
                eventSubject.OnNext(notification);
            }
        }

        private async Task SendResponse(WebSocket webSocket, JsonRpcResponse response)
        {
            var responseJson = JsonRpc2.SerializeMessage(response);
            var responseBytes = System.Text.Encoding.UTF8.GetBytes(responseJson);
            await webSocket.SendAsync(new ArraySegment<byte>(responseBytes), WebSocketMessageType.Text, true, CancellationToken.None);
        }

        // Command Handlers
        private async Task<JsonRpcResponse> HandleGetSceneInfo(JsonRpcRequest request)
        {
            var scene = UnityEngine.SceneManagement.SceneManager.GetActiveScene();
            var rootObjects = scene.GetRootGameObjects();
            
            return JsonRpc2.CreateResponse(request.id, new
            {
                name = scene.name,
                path = scene.path,
                rootObjects = rootObjects.Select(go => new
                {
                    name = go.name,
                    instanceId = go.GetInstanceID()
                }).ToArray()
            });
        }

        private async Task<JsonRpcResponse> HandleGetGameObjectInfo(JsonRpcRequest request)
        {
            var instanceId = (int)request.@params;
            var go = FindObjectByInstanceID(instanceId);
            
            if (go == null)
            {
                return JsonRpc2.CreateResponse(
                    request.id,
                    null,
                    JsonRpc2.CreateError(JsonRpcErrorCodes.InvalidParams, $"GameObject with instance ID {instanceId} not found")
                );
            }

            return JsonRpc2.CreateResponse(request.id, new
            {
                name = go.name,
                instanceId = go.GetInstanceID(),
                components = go.GetComponents<Component>().Select(c => c.GetType().Name).ToArray(),
                children = go.transform.childCount,
                active = go.activeSelf
            });
        }

        private async Task<JsonRpcResponse> HandleExecuteCommand(JsonRpcRequest request)
        {
            var command = JsonConvert.DeserializeObject<MCPCommand>(JsonConvert.SerializeObject(request.@params));
            
            try
            {
                await UniRx.Observable.Start(() =>
                {
                    switch (command.payload.command)
                    {
                        case "setActive":
                            var go = FindObjectByInstanceID((int)command.payload.args[0]);
                            if (go != null) go.SetActive((bool)command.payload.args[1]);
                            break;
                        case "destroy":
                            var obj = FindObjectByInstanceID((int)command.payload.args[0]);
                            if (obj != null) Destroy(obj);
                            break;
                    }
                }, Scheduler.MainThread);

                return JsonRpc2.CreateResponse(request.id, new { success = true });
            }
            catch (Exception e)
            {
                return JsonRpc2.CreateResponse(
                    request.id,
                    null,
                    JsonRpc2.CreateError(JsonRpcErrorCodes.InternalError, $"Error executing command: {e.Message}")
                );
            }
        }

        private async Task<JsonRpcResponse> HandleSubscribeToEvent(JsonRpcRequest request)
        {
            var eventName = (string)request.@params;
            
            var subscription = eventSubject
                .Where(n => n.method == eventName)
                .Subscribe(async notification =>
                {
                    var notificationJson = JsonRpc2.SerializeMessage(notification);
                    var notificationBytes = System.Text.Encoding.UTF8.GetBytes(notificationJson);
                    
                    foreach (var client in clients)
                    {
                        if (client.State == WebSocketState.Open)
                        {
                            await client.SendAsync(new ArraySegment<byte>(notificationBytes), WebSocketMessageType.Text, true, CancellationToken.None);
                        }
                    }
                });

            return JsonRpc2.CreateResponse(request.id, new { success = true });
        }

        private async Task<JsonRpcResponse> HandleUnsubscribeFromEvent(JsonRpcRequest request)
        {
            var eventName = (string)request.@params;
            // Implementation for unsubscribing from events
            return JsonRpc2.CreateResponse(request.id, new { success = true });
        }

        private GameObject FindObjectByInstanceID(int instanceId)
        {
            return FindObjectsOfType<GameObject>().FirstOrDefault(go => go.GetInstanceID() == instanceId);
        }

        public void StopServer()
        {
            if (!isRunning) return;

            cancellationTokenSource?.Cancel();
            httpListener?.Stop();
            
            foreach (var client in clients)
            {
                client.Dispose();
            }
            clients.Clear();

            isRunning = false;
            Debug.Log("MCP Server stopped");
        }
    }

    public class MCPCommand
    {
        public string type { get; set; }
        public CommandPayload payload { get; set; }
    }

    public class CommandPayload
    {
        public string command { get; set; }
        public object[] args { get; set; }
    }
} 
} 