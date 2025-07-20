
export interface GeminiAPIConfig {
  apiKey: string;
}

export const generateQuizFromText = async (text: string, title: string, apiKey: string) => {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Gemini API key is required');
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Create a 50-question multiple choice quiz based on this text. Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, just the JSON):
{
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation here"
    }
  ]
}

Text to analyze: ${text}`
          }]
        }],
        generationConfig: {
          temperature: 0.5,
          topK: 50,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API Error:', errorData);
      throw new Error(`Gemini API request failed: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('Gemini API Response:', data);
    
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No content generated from Gemini API');
    }

    // Clean the response and extract JSON
    let cleanedText = generatedText.trim();
    
    // Remove markdown code blocks if present
    cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Find JSON object
    const jsonStart = cleanedText.indexOf('{');
    const jsonEnd = cleanedText.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No valid JSON found in Gemini response');
    }
    
    const jsonString = cleanedText.substring(jsonStart, jsonEnd);
    console.log('Extracted JSON:', jsonString);
    
    const quizData = JSON.parse(jsonString);
    
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error('Invalid quiz format received from Gemini API');
    }
    
    return {
      id: Date.now().toString(),
      title: title || 'AI Generated Quiz',
      questions: quizData.questions.map((q: any, index: number) => ({
        id: `q_${index}`,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      })),
      createdAt: new Date()
    };
  } catch (error) {
    console.error('Error generating quiz with Gemini:', error);
    throw error;
  }
};

export const generateFlashcardsFromText = async (text: string, apiKey: string) => {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Gemini API key is required');
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Create flashcards from this text. Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, just the JSON):
{
  "flashcards": [
    {
      "front": "Question or term",
      "back": "Answer or definition"
    }
  ]
}

Text to analyze: ${text}`
          }]
        }],
        generationConfig: {
          temperature: 0.5,
          topK: 50,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API Error:', errorData);
      throw new Error(`Gemini API request failed: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No content generated from Gemini API');
    }

    // Clean and extract JSON
    let cleanedText = generatedText.trim();
    cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    const jsonStart = cleanedText.indexOf('{');
    const jsonEnd = cleanedText.lastIndexOf('}') + 1;
    
    const jsonString = cleanedText.substring(jsonStart, jsonEnd);
    const flashcardData = JSON.parse(jsonString);
    
    return flashcardData.flashcards || [];
  } catch (error) {
    console.error('Error generating flashcards with Gemini:', error);
    throw error;
  }
};
