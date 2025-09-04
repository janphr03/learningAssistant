// server/server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import { getDb, closeDb } from "./Database/DatabaseOperations.js";

// Falls du schon eigene Routen hast (z.B. qaRoutes), hier einhängen:
// import qaRoutes from "./routes/qaRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health/Ping
app.get("/health", async (_req, res) => {
    try {
        const db = await getDb();
        await db.command({ ping: 1 });
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

// Beispiel: einfache Testroute (kannst du löschen, wenn du eigene Routen mountest)
app.get("/", (_req, res) => {
    res.send("Server läuft 🚀");
    console.log("Server läuft 🚀");
});

// Eigene Routen aktivieren (falls vorhanden):
// app.use("/api", qaRoutes);

app.listen(PORT, () => {
    console.log(`API läuft auf http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
    console.log("\nBeende Server …");
    await closeDb();
    process.exit(0);
});
