import OpenAI from "openai";
import { GLOBAL_PROMPT, GESCHICHTE_PROMPT } from "./../config/globalPrompts.js";
import { Router } from "express";
import dbManager from "../Database/databaseOperations.js";
import "dotenv/config";

const clientOpenAi = new OpenAI({ apiKey: process.env.OPENAI_API_KEY});
const router = Router();


// Kontext aus allen bisherigen Antworten einer Collection zusammenstellen
async function getContext(collectionName) {
    try {
        const documents = await dbManager.getAllDocuments(collectionName);

        if (!documents || documents.length === 0) {
            console.log(`Keine Dokumente in Collection '${collectionName}' gefunden.`);
            return "Noch keine vorherigen Erklärungen vorhanden.";
        }

        // Alle Antworten aneinanderreihen mit Trennzeichen
        const combinedContext = documents
            .map(doc => doc.answer)
            .join("\n\n--- VORHERIGE ERKLÄRUNG ---\n\n");

        console.log(`Kontext aus ${documents.length} Dokumenten erstellt`);
        return combinedContext;
    } catch (error) {
        console.error("Fehler beim Abrufen des Kontexts:", error);
        return "Fehler beim Laden des Kontexts.";
    }
}

// allgemeine Funktion für Erklärungen
async function explain(inputPrompt) {

    const context = await getContext("Geschichte");

    console.log("context:", context);
    console.log();

    const response = await clientOpenAi.chat.completions.create({
        model: "gpt-5-nano",
        messages: [
            {role: "system", content: GLOBAL_PROMPT},
            { role: "system", content: "MODE:: explain" },
            {role: "system", content: context},
            {role: "system", content: "Wichtig: Wähle ein neues Thema, das nicht im Kontext vorkommt." },
            {role: "user", content: inputPrompt }],

    });


    const answer = response.choices[0].message.content;
    console.log("neue Antwort: \n" + answer + "\n");
    console.log("\n");

    return answer;
}



// explain Methode für den Pfad Geschichte
router.post("/explain", async (req, res) => {
    try {
        var inputPrompt = GESCHICHTE_PROMPT;
        var answer = await explain(inputPrompt);

        // Antwort senden
        res.json({ question: inputPrompt, answer: answer });

        // Danach DB-Operationen durchführen
        try {
            await dbManager.insertDocument("Geschichte", { question: inputPrompt, answer: answer });
            const allDocs = await dbManager.getAllDocuments("Geschichte");
            console.log("Anzahl Dokumente in Geschichte:", allDocs.length);
        } catch (dbError) {
            console.error("DB-Fehler:", dbError);
        }

    } catch (e) {
        console.error("Fehler bei explain:", e);
        res.status(500).json({ error: "explain_failed", message: e.message });
    }
});



export default router;