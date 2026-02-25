const { GoogleGenerativeAI } = require("@google/generative-ai");

const getRoadmapFromAI = async (goal, currentSemester) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `I am a student in ${currentSemester} semester. My goal is to become a ${goal}. 
    Provide a step-by-step technical roadmap including subjects to focus on and skills to learn. 
    Keep it concise and formatted for a student.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
};

module.exports = getRoadmapFromAI;