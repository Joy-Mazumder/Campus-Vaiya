const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const disposableDomains = require('disposable-email-domains');
const dns = require('dns').promises; // built-in, install লাগবে না

const TYPO_DOMAINS = {
  'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com',
  'gmil.com': 'gmail.com', 'gmaill.com': 'gmail.com',
  'gmail.co': 'gmail.com', 'yahooo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com', 'hotmai.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com', 'outlok.com': 'outlook.com',
};

function normalizeEmail(email) {
  let [local, domain] = email.split('@');
  if (domain === 'gmail.com') {
    local = local.split('+')[0].replace(/\./g, '');
  }
  return `${local}@${domain}`;
}

const emailCheckLimiter = rateLimit({
  windowMs: 60 * 1000, max: 10,
  message: { valid: false, message: 'Too many requests, please try again later.' },
});

router.post('/check-email', emailCheckLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ valid: false, message: 'Email is required' });

    // ১. Uppercase check (trim করার আগে)
    const raw = email.trim();
    if (raw !== raw.toLowerCase()) {
      return res.status(400).json({
        valid: false,
        reason: 'Email must be in lowercase',
        suggestion: `Did you mean ${raw.toLowerCase()}?`,
      });
    }

    const trimmed = raw.toLowerCase();

    // ২. Format check
    if (!validator.isEmail(trimmed)) {
      return res.status(400).json({ valid: false, reason: 'Invalid email format' });
    }

    const domain = trimmed.split('@')[1];

    // ৩. Typo check
    if (TYPO_DOMAINS[domain]) {
      return res.status(400).json({
        valid: false,
        reason: 'Possible typo in domain',
        suggestion: `Did you mean ${trimmed.split('@')[0]}@${TYPO_DOMAINS[domain]}?`,
      });
    }

    // ৪. Disposable check
    if (disposableDomains.includes(domain)) {
      return res.status(400).json({
        valid: false,
        reason: 'Disposable or temporary emails are not allowed',
      });
    }

    // ৫. MX Record check (DNS built-in — reliable)
    try {
      const mxRecords = await dns.resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        return res.status(400).json({ valid: false, reason: 'Email domain does not exist' });
      }
    } catch {
      return res.status(400).json({ valid: false, reason: 'Email domain does not exist' });
    }

    const normalized = normalizeEmail(trimmed);
    return res.json({ valid: true, normalizedEmail: normalized });

  } catch (error) {
    console.error('Email Validation Error:', error);
    return res.status(500).json({
      valid: false,
      message: 'Validation service temporarily unavailable. Please try again.',
    });
  }
});

router.post('/register', register);
router.post('/login', login);

module.exports = router;