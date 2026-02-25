const puppeteer = require('puppeteer');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ১. Lab Report Generator Logic
exports.generateLabReport = async (req, res) => {
    try {
        const { experimentName, date, apparatus, procedure, observation, conclusion } = req.body;
        const user = req.user; // AuthMiddleware থেকে পাবো

        // HTML Template for PDF
        const htmlContent = `
        <html>
            <head>
                <style>
                    body { font-family: 'Arial', sans-serif; padding: 40px; line-height: 1.6; }
                    .header { text-align: center; border-bottom: 2px solid #333; margin-bottom: 20px; }
                    .university-name { font-size: 24px; font-weight: bold; text-transform: uppercase; }
                    .report-title { font-size: 20px; text-decoration: underline; margin: 20px 0; }
                    .section { margin-bottom: 15px; }
                    .label { font-weight: bold; font-size: 16px; }
                    .footer { margin-top: 50px; display: flex; justify-content: space-between; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="university-name">${user.universityId?.name || 'CampusVaiya Portal'}</div>
                    <p>Department of Science & Technology</p>
                </div>
                <div style="text-align: center;">
                    <h2 class="report-title">Lab Experiment Report</h2>
                </div>
                <div class="section"><span class="label">Experiment Name:</span> ${experimentName}</div>
                <div class="section"><span class="label">Date:</span> ${date}</div>
                <div class="section"><span class="label">Student Name:</span> ${user.fullName}</div>
                <hr>
                <div class="section"><span class="label">Apparatus:</span><p>${apparatus}</p></div>
                <div class="section"><span class="label">Procedure:</span><p>${procedure}</p></div>
                <div class="section"><span class="label">Observation:</span><p>${observation}</p></div>
                <div class="section"><span class="label">Conclusion:</span><p>${conclusion}</p></div>
                
                <div class="footer">
                    <div>___________________<br>Student Signature</div>
                    <div>___________________<br>Teacher Signature</div>
                </div>
            </body>
        </html>`;

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlContent);
        const pdfBuffer = await page.pdf({ format: 'A4' });
        await browser.close();

        res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdfBuffer.length });
        res.send(pdfBuffer);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ২. AI Roadmap Generator Logic
exports.generateRoadmap = async (req, res) => {
    try {
        const { goal, currentSemester } = req.body;
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        // const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `I am a student in ${currentSemester} semester. My goal is to become a ${goal}. 
        Provide a step-by-step technical roadmap including subjects to focus on and skills to learn. 
        Keep it concise and formatted for a student.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ roadmap: text });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const generatePDF = require('../utils/pdfGenerator');
const getRoadmapFromAI = require('../utils/aiHelper');

exports.generateLabReport = async (req, res) => {
    try {
        const { experimentName, date, apparatus, procedure, observation, conclusion } = req.body;
        const user = req.user;

        const htmlContent = `
            <h1>${user.universityId?.name || 'Lab Report'}</h1>
            <p><strong>Experiment:</strong> ${experimentName}</p>
            <p><strong>Student:</strong> ${user.fullName}</p>
            <hr>
            <p>${procedure}</p>
            <!-- বাকি HTML এখানে আগের মতোই থাকবে -->
        `;

        const pdfBuffer = await generatePDF(htmlContent);

        res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdfBuffer.length });
        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.generateRoadmap = async (req, res) => {
    try {
        const { goal, currentSemester } = req.body;
        const roadmap = await getRoadmapFromAI(goal, currentSemester);
        res.json({ roadmap });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};