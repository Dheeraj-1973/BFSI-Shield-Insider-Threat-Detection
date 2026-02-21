const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --- MONGODB CONNECTION ---
const MONGO_URI = "mongodb+srv://admin:admin123@bfsitargetcluster.qpfnkkr.mongodb.net/bfsi_threats?appName=BFSITargetCluster";

mongoose.connect(MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB!'))
  .catch((err) => console.error('MongoDB connection error:', err));

// --- DATABASE SCHEMAS ---
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const alertSchema = new mongoose.Schema({
  employee: String,
  department: String,
  snippet: String,
  risk: String,
  date: { type: String, default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
});

const User = mongoose.model('User', userSchema);
const Alert = mongoose.model('Alert', alertSchema);

// --- AUTHENTICATION API ROUTES ---

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: "Admin already exists." });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "Admin registered successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: "Admin not found." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials." });

        res.status(200).json({ message: "Login successful", username: user.username });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- THREAT DETECTION API ROUTES ---
app.get('/api/alerts', async (req, res) => {
    try {
        const alerts = await Alert.find().sort({ _id: -1 });
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/alerts', async (req, res) => {
    const { employee, department, snippet } = req.body;
    const lowerSnippet = snippet.toLowerCase();
    let assignedRisk = "Low";

    const highRiskWords = ['unreleased', 'quit', 'steal', 'confidential', 'ssn', 'credit card', 'hack', 'leak'];
    const mediumRiskWords = ['download', 'personal drive', 'usb', 'bypass', 'external'];

    if (highRiskWords.some(word => lowerSnippet.includes(word))) assignedRisk = "High";
    else if (mediumRiskWords.some(word => lowerSnippet.includes(word))) assignedRisk = "Medium";

    const newAlert = new Alert({ employee, department, snippet, risk: assignedRisk });

    try {
        await newAlert.save();
        const updatedAlerts = await Alert.find().sort({ _id: -1 });
        res.json(updatedAlerts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- NEW ROUTE: DELETE (ISOLATE) THREAT ---
app.delete('/api/alerts/:id', async (req, res) => {
    try {
        await Alert.findByIdAndDelete(req.params.id); // Deletes from MongoDB
        const updatedAlerts = await Alert.find().sort({ _id: -1 }); // Fetches the new list
        res.json(updatedAlerts); // Sends updated list to React
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => console.log(`Secure server running on http://localhost:${PORT}`));