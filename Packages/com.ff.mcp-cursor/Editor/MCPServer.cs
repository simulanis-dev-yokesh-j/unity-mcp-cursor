using UnityEngine;
using System;
using System.Net;
using System.Net.Sockets;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Collections.Generic;

namespace FF.MCPCursor
{
    public class MCPServer : MonoBehaviour
    {
        private TcpListener server;
        private List<TcpClient> clients = new List<TcpClient>();
        private bool isRunning = false;
        private Thread serverThread;
        private int port = 8090;

        private void Start()
        {
            StartServer();
        }

        private void OnDestroy()
        {
            StopServer();
        }

        public void StartServer()
        {
            if (isRunning) return;

            serverThread = new Thread(ServerThread);
            serverThread.Start();
            isRunning = true;
            Debug.Log($"MCP Server started on port {port}");
        }

        public void StopServer()
        {
            if (!isRunning) return;

            isRunning = false;
            server?.Stop();
            foreach (var client in clients)
            {
                client.Close();
            }
            clients.Clear();
            Debug.Log("MCP Server stopped");
        }

        private void ServerThread()
        {
            try
            {
                server = new TcpListener(IPAddress.Any, port);
                server.Start();

                while (isRunning)
                {
                    if (server.Pending())
                    {
                        TcpClient client = server.AcceptTcpClient();
                        clients.Add(client);
                        Task.Run(() => HandleClient(client));
                    }
                    Thread.Sleep(100);
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"MCP Server error: {e.Message}");
            }
        }

        private async Task HandleClient(TcpClient client)
        {
            try
            {
                NetworkStream stream = client.GetStream();
                byte[] buffer = new byte[4096];
                int bytesRead;

                while (isRunning && client.Connected)
                {
                    if (stream.DataAvailable)
                    {
                        bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length);
                        if (bytesRead > 0)
                        {
                            string message = System.Text.Encoding.UTF8.GetString(buffer, 0, bytesRead);
                            HandleMessage(message, client);
                        }
                    }
                    await Task.Delay(100);
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"Client handling error: {e.Message}");
            }
            finally
            {
                clients.Remove(client);
                client.Close();
            }
        }

        private void HandleMessage(string message, TcpClient client)
        {
            try
            {
                // Parse MCP message
                var mcpMessage = JsonConvert.DeserializeObject<MCPMessage>(message);
                
                // Handle different message types
                switch (mcpMessage.type)
                {
                    case "command":
                        HandleCommand(mcpMessage, client);
                        break;
                    case "query":
                        HandleQuery(mcpMessage, client);
                        break;
                    default:
                        Debug.LogWarning($"Unknown message type: {mcpMessage.type}");
                        break;
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"Message handling error: {e.Message}");
            }
        }

        private void HandleCommand(MCPMessage message, TcpClient client)
        {
            // Implement command handling logic
            Debug.Log($"Received command: {message.command}");
            // Send response back to client
            SendResponse(client, new MCPResponse { success = true });
        }

        private void HandleQuery(MCPMessage message, TcpClient client)
        {
            // Implement query handling logic
            Debug.Log($"Received query: {message.query}");
            // Send response back to client
            SendResponse(client, new MCPResponse { success = true });
        }

        private void SendResponse(TcpClient client, MCPResponse response)
        {
            try
            {
                string jsonResponse = JsonConvert.SerializeObject(response);
                byte[] data = System.Text.Encoding.UTF8.GetBytes(jsonResponse);
                client.GetStream().Write(data, 0, data.Length);
            }
            catch (Exception e)
            {
                Debug.LogError($"Error sending response: {e.Message}");
            }
        }
    }

    [Serializable]
    public class MCPMessage
    {
        public string type;
        public string command;
        public string query;
        public Dictionary<string, object> parameters;
    }

    [Serializable]
    public class MCPResponse
    {
        public bool success;
        public string message;
        public object data;
    }
} 