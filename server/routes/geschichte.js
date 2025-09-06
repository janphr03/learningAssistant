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
            .map(doc => doc.topic)
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

    // In der explain-Funktion den system-Prompt anpassen
    const response = await clientOpenAi.chat.completions.create({
        model: "gpt-5-nano",
        messages: [
            {role: "system", content: GLOBAL_PROMPT},
            {role: "system", content: "MODE:: explain"},
            {role: "system", content: "KONTEXT: Hier folgt eine Liste bisheriger Themen (nur Überschriften): " + context},
            {role: "system", content: "Wichtig: Wähle ein neues Thema, das nicht im Kontext vorkommt. Formatiere deine Antwort folgendermaßen: [TOPIC]: Titel des Themas\n\n[CONTENT]: Deine eigentliche Erklärung"},
            {role: "user", content: inputPrompt}
        ],
    });


    const fullAnswer = response.choices[0].message.content;
    console.log("neue Antwort: \n" + fullAnswer + "\n");
    console.log("\n");

    const topicMatch = fullAnswer.match(/\[TOPIC\]:\s*(.*?)(?=\n\n\[CONTENT\]:|\n\[CONTENT\]:)/s);

    const topic = topicMatch ? topicMatch[1].trim() : "Unbenanntes Thema";

    console.log("Topic:", topic);

    return { topic, fullAnswer };
}


// explain Methode für den Pfad Geschichte
router.post("/explain", async (req, res) => {
    const startTime = Date.now();

    try {

        console.log("1. Start Anfrage:", Date.now() - startTime, "ms");

        var inputPrompt = GESCHICHTE_PROMPT;
        console.log("2. Prompt vorbereitet:", Date.now() - startTime, "ms");

        var answerObj = await explain(inputPrompt);
        console.log("3. OpenAI-Antwort erhalten:", Date.now() - startTime, "ms");


        // Antwort senden - komplettes Objekt zurückgeben
        res.json({
            question: inputPrompt,
            topic: answerObj.topic,
            fullAnswer: answerObj.fullAnswer
        });
        console.log("4. Antwort gesendet:", Date.now() - startTime, "ms");


        // Danach DB-Operationen durchführen
        try {
            await dbManager.insertDocument("Geschichte", {
                question: inputPrompt,
                topic: answerObj.topic,
                fullAnswer: answerObj.fullAnswer,
            });

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