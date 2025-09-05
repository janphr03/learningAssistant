import OpenAI from "openai";
import { GLOBAL_PROMPT } from "./config/globalPrompts.js";
import {MongoClient, mongoClient} from "mongodb";
import {db} from "./Database/databaseOperations.js";
import "dotenv/config";


MONGO_DB_URI: "mongodb+srv://janpppherrmann:XaTo1ON9ac0ZsGHp@learningassistant.q6w19va.mongodb.net/?retryWrites=true&w=majority&appName=learningAssistant";

const clientOpenAi = new OpenAI({ apiKey: "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"});
const clientMongoDb = new MongoClient(MONGO_DB_URI);

async function runTest() {
    const response = await clientOpenAi.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
            {role: "system", content: GLOBAL_PROMPT},
            { role: "system", content: "MODE:: explain" },
            {role: "user", content: "erkläre die Grundlagen des 2ten Weltkrieges" }],
    });
    console.log(response.choices[0].message.content);
}

runTest();

