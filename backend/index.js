import express, { urlencoded, json } from "express";
import usersRouter from "./routes/users.routes.js";
import { initPools, closePools } from "./config/connect.js";
import "dotenv/config";

const app = express();

const startServer = async () => {
  try {
    await initPools();

    console.log("Databases initialized.");

    app.use(json());
    app.use(urlencoded({ extended: true }));

    app.use("/api/users", usersRouter); // changed this from /users

    // Internal debug endpoint — receives JSON from frontend (proxied) and logs it to backend terminal
    app.post("/internal/log", (req, res) => {
      try {
        console.log('\n[BACKEND INTERNAL LOG] Received debug POST');
        console.log('[BACKEND INTERNAL LOG] Headers:', JSON.stringify(req.headers || {}, null, 2));
        console.log('[BACKEND INTERNAL LOG] Body:', JSON.stringify(req.body, null, 2));
        res.status(200).json({ success: true });
      } catch (err) {
        console.error('Error in /internal/log:', err);
        res.status(500).json({ success: false });
      }
    });

    app.get("/", (req, res) => {
      res.status(200).json({
        status: "Ok",
        message: "STADVDB MCO2 app is running.",
      });
    });

    const server = app.listen(process.env.PORT || 3000, () => {
      console.log(`Server running on port: ${process.env.PORT}`);
    });

    const shutdown = async () => {
      console.log("Shutting down...");

      server.close();

      try {
        await closePools();

        console.log("All connections closed.");
        process.exit(0);
      } catch (err) {
        console.log("Error on shutdown: ", err);
        process.exit(1);
      }
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (err) {
    console.error("Server startup error: ", err);
    process.exit(1);
  }
};

startServer().catch((err) => {
  console.error("Error during server initialization: ", err);
  process.exit(1);
});

export default app;