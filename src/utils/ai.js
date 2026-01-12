const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const SITE_URL = 'http://localhost:5173';
const SITE_NAME = 'Endless D&D';

// I recommend switching back to Llama 3 for better instruction following
const MODEL = "nvidia/nemotron-3-nano-30b-a3b:free"; 

export async function getZMResponse(history, character) {
  if (!OPENROUTER_API_KEY) {
    return "⚠️ SYSTEM ERROR: No API Key found in .env file.";
  }

  // 1. Construct the System Prompt
  const systemPrompt = {
    role: "system",
    content: `
      You are the Dungeon Master (DM) for a Dungeons & Dragons 5e adventure.
      
      THE PLAYER:
      Name: ${character.name}
      Race: ${character.race}
      Class: ${character.class} (Level ${character.level})
      Stats: ${JSON.stringify(character.attributes)}
      Skills: ${character.skills.join(", ")}
      Backstory: ${character.backstory}

      GUIDELINES:
      1. Be descriptive and immersive.
      2. If the player attempts something risky, YOU MUST COMMAND A ROLL.
      3. COMMAND FORMAT: Do not ask "Roll for Perception". Instead, append this tag to the end of your message: [CHECK:SkillName].
        Example: "The shadows shift uneasily. [CHECK:Perception]"
      4. When the user replies with a dice result (e.g., "Result: 18"), narrate the outcome immediately.
      5. Keep responses concise (under 150 words).
    `
  };

  // --- THE FIX IS HERE ---
  // We map your app's "text" and "ai" keys to the API's "content" and "assistant" keys
  const formattedHistory = history.slice(-10).map(msg => ({
    role: msg.role === 'ai' ? 'assistant' : msg.role, // Turn 'ai' into 'assistant'
    content: msg.text // Turn 'text' into 'content'
  }));

  const messages = [systemPrompt, ...formattedHistory];

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": SITE_URL,
        "X-Title": SITE_NAME,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": MODEL,
        "messages": messages,
        "temperature": 0.8,
        "max_tokens": 500
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("OpenRouter Error:", data.error);
      return `(The Dungeon Master stumbles: ${data.error.message})`;
    }

    return data.choices[0].message.content;

  } catch (error) {
    console.error("Network Error:", error);
    return "(The connection to the ethereal plane was lost. Please check your internet.)";
  }
}