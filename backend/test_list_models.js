require('dotenv').config();

async function test() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    if (data.models) {
      console.log(data.models.map(m => m.name).filter(n => n.includes('gemini')));
    } else {
      console.log(data);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
