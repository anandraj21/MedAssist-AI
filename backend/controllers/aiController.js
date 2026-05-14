const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize with stable v1 API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = "gemini-1.5-flash";

// @desc  AI Symptom Checker
// @route POST /api/ai/symptom-check
const symptomCheck = async (req, res) => {
  try {
    const { symptoms, age, gender } = req.body;
    if (!symptoms) return res.status(400).json({ message: 'Symptoms required' });

    // Try a few different model names to find one that works for this account
    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
    let model = null;
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`🤖 Trying model: ${modelName}...`);
        const tempModel = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });
        
        const prompt = `You are a medical AI. Symptoms: ${symptoms}. Give 2 conditions and urgency.`;
        const result = await tempModel.generateContent(prompt);
        
        if (result) {
          model = tempModel;
          console.log(`✅ SUCCESS! Using model: ${modelName}`);
          return res.json({ result: result.response.text() });
        }
      } catch (e) {
        lastError = e;
        console.log(`❌ Model ${modelName} failed: ${e.message}`);
        continue;
      }
    }

    throw lastError || new Error("No available models found for this API key.");
  } catch (err) {
    console.error('❌ AI Symptom Check Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// @desc  AI Chat for consultation support
// @route POST /api/ai/chat
const aiChat = async (req, res) => {
  try {
    const { messages, systemContext } = req.body;
    
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const model = genAI.getGenerativeModel(
      { 
        model: MODEL_NAME,
        systemInstruction: systemContext || 'You are a helpful medical assistant supporting a consultation. Be professional, empathetic, and always recommend consulting the doctor for specific medical advice.'
      },
      { apiVersion: 'v1' }
    );

    let responseText = "";
    
    if (formattedMessages.length === 0) {
        return res.json({ reply: "" });
    }

    if (formattedMessages.length === 1) {
        const result = await model.generateContent(formattedMessages[0].parts[0].text);
        responseText = result.response.text();
    } else {
        const history = formattedMessages.slice(0, -1);
        const lastMessage = formattedMessages[formattedMessages.length - 1].parts[0].text;

        const chat = model.startChat({
          history: history
        });

        const result = await chat.sendMessage(lastMessage);
        responseText = result.response.text();
    }

    res.json({ reply: responseText });
  } catch (err) {
    console.error('❌ AI Chat Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// @desc  Generate consultation summary / prescription AI summary
// @route POST /api/ai/summarize
const summarizeConsultation = async (req, res) => {
  try {
    const { symptoms, diagnosis, medicines, doctorNotes } = req.body;

    const model = genAI.getGenerativeModel(
      { model: MODEL_NAME },
      { apiVersion: 'v1' }
    );

    const prompt = `Create a clear, patient-friendly summary of this medical consultation:

Symptoms reported: ${symptoms}
Diagnosis: ${diagnosis}
Doctor's notes: ${doctorNotes}
Prescribed medicines: ${JSON.stringify(medicines)}

Write a brief summary (3-4 sentences) the patient can easily understand, including:
- What was diagnosed
- What the medicines are for
- Key things to remember
Keep it simple and reassuring.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.json({ summary: responseText });
  } catch (err) {
    console.error('❌ AI Summarize Error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { symptomCheck, aiChat, summarizeConsultation };
