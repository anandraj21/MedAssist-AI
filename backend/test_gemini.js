require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  try {
    console.log("Key:", process.env.GEMINI_API_KEY ? "Loaded" : "Missing");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say 'hello world'");
    console.log("Result:", result.response.text());
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
