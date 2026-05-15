import { createServer } from "http";
import next from "next";
import { initSocketServer } from "./src/lib/socket/index";
import { registerHandlers } from "./src/lib/socket/handlers/index";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME ?? "localhost";
const port = parseInt(process.env.PORT ?? "3000", 10);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    // Socket.IO attaches its own 'request' listener — skip Next.js for its path
    if (req.url?.startsWith("/socket.io")) return;
    handler(req, res);
  });

  const io = initSocketServer(httpServer);
  registerHandlers(io);

  httpServer.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port} [real-time enabled]`);
  });
});
