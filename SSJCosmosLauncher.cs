using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Windows.Forms;
using Microsoft.Win32;

namespace SSJCosmosGame
{
    static class Program
    {
        private static HttpListener _listener;
        private static string _webRoot;
        private static readonly string MainHtmlName = "SSJ_COSMOS.html";

        [STAThread]
        static void Main(string[] args)
        {
            try
            {
                // 1. Locate Game Root Directory
                _webRoot = FindGameDirectory();
                if (string.IsNullOrEmpty(_webRoot))
                {
                    MessageBox.Show(
                        "Could not locate the SSJ COSMOS game files (" + MainHtmlName + ").\n\n" +
                        "Please place this executable inside your game folder (e.g. D:\\Game).",
                        "SSJ COSMOS - Game Not Found",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                    return;
                }

                // 2. Select an Available Local Port
                int port = GetAvailablePort(6789);

                // 3. Start Local HTTP Server
                _listener = new HttpListener();
                _listener.Prefixes.Add("http://127.0.0.1:" + port + "/");
                _listener.Prefixes.Add("http://localhost:" + port + "/");
                _listener.Start();

                Thread serverThread = new Thread(ServerLoop);
                serverThread.IsBackground = true;
                serverThread.Start();

                // 4. Locate Chromium Browser (Edge or Chrome)
                string browserPath = FindChromiumBrowser();
                string gameUrl = "http://127.0.0.1:" + port + "/";
                string profileDir = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "SSJCosmosGame",
                    "Profile"
                );

                Process gameProcess = null;
                if (!string.IsNullOrEmpty(browserPath))
                {
                    string browserArgs = string.Format(
                        "--app=\"{0}\" " +
                        "--start-maximized " +
                        "--window-size=1920,1080 " +
                        "--user-data-dir=\"{1}\" " +
                        "--autoplay-policy=no-user-gesture-required " +
                        "--enable-gpu-rasterization " +
                        "--enable-zero-copy " +
                        "--ignore-gpu-blocklist " +
                        "--disable-features=Translate,InterestFeedContentSuggestions,CalculateNativeWinOcclusion " +
                        "--no-first-run " +
                        "--no-default-browser-check",
                        gameUrl, profileDir
                    );

                    ProcessStartInfo psi = new ProcessStartInfo
                    {
                        FileName = browserPath,
                        Arguments = browserArgs,
                        UseShellExecute = false
                    };
                    gameProcess = Process.Start(psi);
                }
                else
                {
                    // Fallback to default browser
                    gameProcess = Process.Start(new ProcessStartInfo(gameUrl) { UseShellExecute = true });
                }

                if (gameProcess != null)
                {
                    gameProcess.WaitForExit();
                }
                else
                {
                    Thread.Sleep(5000);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error starting SSJ COSMOS:\n" + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally
            {
                StopServer();
            }
        }

        private static string FindGameDirectory()
        {
            string exeDir = AppDomain.CurrentDomain.BaseDirectory;
            if (File.Exists(Path.Combine(exeDir, MainHtmlName))) return exeDir;
            if (File.Exists(Path.Combine(@"D:\Game", MainHtmlName))) return @"D:\Game";
            return null;
        }

        private static int GetAvailablePort(int startingPort)
        {
            for (int port = startingPort; port < startingPort + 100; port++)
            {
                try
                {
                    TcpListener listener = new TcpListener(IPAddress.Loopback, port);
                    listener.Start();
                    listener.Stop();
                    return port;
                }
                catch { }
            }
            return 6789;
        }

        private static void ServerLoop()
        {
            while (_listener != null && _listener.IsListening)
            {
                try
                {
                    HttpListenerContext context = _listener.GetContext();
                    ThreadPool.QueueUserWorkItem(ProcessRequest, context);
                }
                catch { break; }
            }
        }

        private static void ProcessRequest(object state)
        {
            HttpListenerContext context = (HttpListenerContext)state;
            try
            {
                string rawUrl = context.Request.Url.AbsolutePath;
                string relPath = rawUrl.TrimStart('/');
                if (string.IsNullOrEmpty(relPath) || relPath == "index.html")
                {
                    relPath = MainHtmlName;
                }

                string filePath = Path.Combine(_webRoot, relPath);
                if (File.Exists(filePath))
                {
                    byte[] bytes = File.ReadAllBytes(filePath);
                    context.Response.ContentType = GetMimeType(Path.GetExtension(filePath));
                    context.Response.ContentLength64 = bytes.Length;
                    context.Response.AddHeader("Access-Control-Allow-Origin", "*");
                    context.Response.OutputStream.Write(bytes, 0, bytes.Length);
                }
                else
                {
                    context.Response.StatusCode = 404;
                }
            }
            catch { }
            finally
            {
                try { context.Response.Close(); } catch { }
            }
        }

        private static string GetMimeType(string ext)
        {
            switch (ext.ToLower())
            {
                case ".html": return "text/html; charset=utf-8";
                case ".js": return "application/javascript; charset=utf-8";
                case ".css": return "text/css; charset=utf-8";
                case ".png": return "image/png";
                case ".jpg":
                case ".jpeg": return "image/jpeg";
                case ".glb": return "model/gltf-binary";
                case ".gltf": return "model/gltf+json";
                default: return "application/octet-stream";
            }
        }

        private static string FindChromiumBrowser()
        {
            string edge = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe");
            if (File.Exists(edge)) return edge;
            string chrome = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe");
            if (File.Exists(chrome)) return chrome;
            return null;
        }

        private static void StopServer()
        {
            try
            {
                if (_listener != null && _listener.IsListening)
                {
                    _listener.Stop();
                    _listener.Close();
                }
            }
            catch { }
        }
    }
}
