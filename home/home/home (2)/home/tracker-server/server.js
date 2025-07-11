const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from React public folder
app.use(express.static(path.join(__dirname, "../home/public")));

// Correct service account
const serviceAccount = require("./serviceAccountKey.json");

// Firebase Admin initialization
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

console.log("🔥 Connected to Firebase Project:", serviceAccount.project_id);

const db = admin.firestore();
const collection = db.collection("trackers");

// ✅ GET all records
app.get("/api/data", async (req, res) => {
    try {
        const snapshot = await collection.get();
        let allEntries = [];
        snapshot.forEach(doc => {
            const email = doc.id;
            const { entries } = doc.data();
            if (entries && Array.isArray(entries)) {
                entries.forEach((entry, index) => {
                    allEntries.push({ _id: `${email}_${index}`, email, index, ...entry });
                });
            }
        });
        res.json(allEntries);
    } catch (err) {
        console.error("❌ GET Error:", err);
        res.status(500).send("Error fetching data");
    }
});

// ✅ POST a record
app.post("/api/data", async (req, res) => {
    const { email, ...entryData } = req.body;
    if (!email) return res.status(400).send("Email is required");

    try {
        const docRef = collection.doc(email);
        const doc = await docRef.get();
        if (doc.exists) {
            const existing = doc.data().entries || [];
            await docRef.update({
                entries: [...existing, entryData]
            });
        } else {
            await docRef.set({ entries: [entryData] });
        }
        res.status(200).json({ message: "✅ Data saved successfully" });
    } catch (err) {
        console.error("❌ POST Error:", err);
        res.status(500).send("Error saving data");
    }
});

// ✅ DELETE a record by email & index
app.delete("/api/data/:email/:index", async (req, res) => {
    const { email, index } = req.params;
    try {
        const docRef = collection.doc(email);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).send("Document not found");
        }
        const entries = doc.data().entries || [];
        entries.splice(index, 1);
        await docRef.update({ entries });
        res.sendStatus(200);
    } catch (err) {
        console.error("❌ DELETE Error:", err);
        res.status(500).send("Error deleting entry");
    }
});

// ✅ Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
