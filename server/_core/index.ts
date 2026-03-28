import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import cookieParser from "cookie-parser";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Parse cookies
  app.use(cookieParser());
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // Local login route - salva cookie HTTP
  app.post("/api/local-login", express.json(), async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }
      
      // Usuários pré-configurados (em produção, isso viria de um banco de dados)
      const USERS_DB = [
        { id: "1", username: "admin", password: "admin", role: "admin", name: "Administrador" },
        { id: "2", username: "manager", password: "manager", role: "manager", name: "Gerenciador" },
        { id: "3", username: "partner", password: "partner", role: "partner", name: "Parceiro" },
        { id: "4", username: "user", password: "user", role: "user", name: "Usuário" },
      ];
      
      const user = USERS_DB.find(u => u.username === username && u.password === password);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const userData = {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        loginTime: new Date().toISOString(),
      };
      
      // Salvar cookie HTTP com SameSite=Lax para permitir requisições cross-site
      res.cookie("app_session_id", JSON.stringify(userData), {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 365 * 24 * 60 * 60 * 1000,
        path: "/",
      });
      
      res.json({ success: true, user: userData });
    } catch (error) {
      console.error("[Login Error]", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
