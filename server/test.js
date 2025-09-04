import OpenAI from "openai";

const client = new OpenAI({ apiKey: "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"});

async function runTest() {
    const response = await client.chat.completions.create({
        model: "gpt-5-mini",
        messages: [{ role: "user", content: "du bist ein Lehrer der erklären soll wie der erste WK zustande kam" }],
    });
    console.log(response.choices[0].message.content);
}

runTest();

