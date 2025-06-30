const db = require('../firebase');

const collection = db.collection('reports');

// Create a report if one doesn’t exist for the same date
exports.createReport = async (req, res) => {
  console.log('Incoming body:', req.body);
  try {
    const { date } = req.body;

    // Check if a log already exists for that date
    const snapshot = await collection.where('date', '==', date).get();
    if (!snapshot.empty) {
      return res.status(400).json({ error: 'Log already exists for this date.' });
    }

    const docRef = await collection.add(req.body);
    const newDoc = await docRef.get();
    res.status(201).json({ id: docRef.id, ...newDoc.data() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all reports
exports.getReports = async (req, res) => {
  try {
    const snapshot = await collection.get();
    const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update report status
exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await collection.doc(id).update({ status });
    const updatedDoc = await collection.doc(id).get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update the full report
exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    await collection.doc(id).update(req.body);
    const updatedDoc = await collection.doc(id).get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    await collection.doc(id).delete();
    res.status(200).json({ message: 'Report deleted successfully.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};