// server/server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import geschichteRouter from "./routes/geschichte.js";
import dbManager from "./Database/databaseOperations.js";
// Falls du schon eigene Routen hast (z.B. qaRoutes), hier einhängen:
// import qaRoutes from "./routes/qaRoutes.js";


// technische Formulierung kurz und bündig für meine App als Prompt Anweisung nicht politisch

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health/Ping
app.get("/health", async (_req, res) => {
    try {
        const db = await dbManager.getDb();
        await db.command({ ping: 1 });
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

// Eigene Router hier mounten:
app.use("/api/geschichte", geschichteRouter);



// Beispiel: einfache Testroute (kannst du löschen, wenn du eigene Routen mountest)
app.get("/", (_req, res) => {
    res.send("Server läuft 🚀");
    console.log("Server läuft 🚀");
});

// Eigene Routen aktivieren (falls vorhanden):
// app.use("/api", qaRoutes);

app.listen(PORT, async () => {
    await dbManager.connect();
    console.log(`API läuft auf http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
    console.log("\nBeende Server …");
    await dbManager.close();
    process.exit(0);
});
