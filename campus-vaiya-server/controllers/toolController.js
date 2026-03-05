const GPA = require('../models/GPA');
const User = require('../models/User');
const PDFDocument = require('pdfkit');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ১. Lab Report PDF Generator
exports.generateLabReport = async (req, res) => {
  try {
    const { experimentName, date, studentName, studentId, department, objective, procedure, observation, conclusion } = req.body;

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Lab_Report_${experimentName}.pdf`);
    doc.pipe(res);

    // Header (Institution Branding)
    doc.fontSize(20).text(req.user.institution?.name || 'CAMPUSVAIYA ACADEMICS', { align: 'center', underline: true });
    doc.moveDown();
    doc.fontSize(16).text('LABORATORY REPORT', { align: 'center' });
    doc.moveDown();

    // Student Info Table Style
    doc.fontSize(12).text(`Experiment: ${experimentName}`);
    doc.text(`Date: ${date}`);
    doc.text(`Student: ${studentName} (${studentId})`);
    doc.text(`Department: ${department}`);
    doc.moveDown();

    // Content Sections
    const sections = [
      { label: 'OBJECTIVE', content: objective },
      { label: 'PROCEDURE', content: procedure },
      { label: 'OBSERVATION', content: observation },
      { label: 'CONCLUSION', content: conclusion }
    ];

    sections.forEach(s => {
      doc.fontSize(14).fillColor('blue').text(s.label);
      doc.fontSize(11).fillColor('black').text(s.content, { align: 'justify' });
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: "PDF Generation Failed" });
  }
};

// ২. AI Roadmap Generator (Gemini API)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateAiRoadmap = async (req, res) => {
  try {
    const { targetGoal } = req.body;
    
    // ১. ইউজারের ডাটাবেজ থেকে তথ্য নেওয়া (GPA History এবং Skills)
    const user = await User.findById(req.user._id);
    const gpaData = await GPA.find({ user: req.user._id });
    
    const currentCGPA = gpaData.length > 0 
      ? (gpaData.reduce((s, i) => s + (i.gpa * i.totalCredits), 0) / gpaData.reduce((s, i) => s + i.totalCredits, 0)).toFixed(2)
      : "No data";

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // ২. শক্তিশালী প্রম্পট ইঞ্জিনিয়ারিং
    const prompt = `
      As an expert academic advisor, create a personalized roadmap for a student.
      STUDENT PROFILE:
      - Name: ${user.fullName}
      - Current Education: ${user.educationLevel} (Class/Year: ${user.currentClass})
      - Current CGPA: ${currentCGPA}
      - Skills: ${user.skills?.join(", ") || "Beginner"}
      - Target Goal: ${targetGoal}

      REQUIREMENTS:
      1. Analyze their current CGPA. If it's low, suggest how to improve it based on the goal.
      2. Recommend specific skills to add based on their current skill set.
      3. Provide a Phase-wise (Phase 1 to 4) action plan.
      4. Mention a "Pro Tip" for their specific career path.
      
      Keep the tone motivating and professional.
    `;

    const result = await model.generateContent(prompt);
    res.json({ roadmap: result.response.text() });
  } catch (error) {
    res.status(500).json({ message: "AI analysis failed" });
  }
};

// রেজাল্ট সেভ করা
exports.saveGPA = async (req, res) => {
  try {
    const { semesterOrClass, gpa, totalCredits, subjects } = req.body;
    
    const newRecord = await GPA.create({
      user: req.user._id,
      semesterOrClass,
      gpa,
      totalCredits,
      subjects
    });

    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// হিস্ট্রি এবং কিউমুলেটিভ সিজিপিএ পাওয়া
exports.getGPAHistory = async (req, res) => {
  try {
    const history = await GPA.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    let totalPoints = 0;
    let totalCredits = 0;

    history.forEach(item => {
      totalPoints += (item.gpa * item.totalCredits);
      totalCredits += item.totalCredits;
    });

    const cumulativeCGPA = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";

    res.json({ history, cumulativeCGPA, totalCredits });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};