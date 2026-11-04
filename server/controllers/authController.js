const User = require('../models/User');
const Wallet = require('../models/Wallet');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Generate short-lived Access Token (15 mins)
const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET || 'supersecretkey123',
    { expiresIn: '15m' }
  );
};

// Generate Refresh Token (7 days)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'supersecretkey123',
    { expiresIn: '7d' }
  );
};

// Register Controller
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      passwordHash,
      role: 'user',
      fingerprints: [{ ip: clientIp, deviceId: req.headers['user-agent'] || 'browser' }]
    });

    await user.save();

    // Automatically provision a wallet with starting demo balance
    const wallet = new Wallet({ user: user._id, balance: 1000, held: 0 });
    await wallet.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: 'User registered successfully!',
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, riskScore: user.riskScore },
      wallet: { balance: wallet.balance, held: wallet.held }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    if (user.role === 'suspended') {
      return res.status(403).json({ message: 'Account is suspended due to fraud violations.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Record login IP fingerprint for fraud tracking
    const exists = user.fingerprints?.some(f => f.ip === clientIp);
    if (!exists) {
      user.fingerprints.push({ ip: clientIp, deviceId: req.headers['user-agent'] || 'browser' });
      await user.save();
    }

    let wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      wallet = await Wallet.create({ user: user._id, balance: 1000, held: 0 });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Send refresh token inside an httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Logged in successfully',
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, riskScore: user.riskScore },
      wallet: { balance: wallet.balance, held: wallet.held }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const wallet = await Wallet.findOne({ user: user._id });

    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, riskScore: user.riskScore },
      wallet: wallet ? { balance: wallet.balance, held: wallet.held } : { balance: 0, held: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user profile', error: error.message });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'supersecretkey123');
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const accessToken = generateAccessToken(user);
    res.json({ accessToken });
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

// Logout
exports.logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};
