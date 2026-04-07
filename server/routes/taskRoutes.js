const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// Get all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Add task
router.post("/", async (req, res) => {
  try {
    const payload = {
      title: req.body.title,
      subject: req.body.subject,
      deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
      priority: req.body.priority || "Low"
    };

    const newTask = new Task(payload);
    await newTask.save();
    res.json(newTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Mark complete
router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { completed: true },
      { new: true }
    );
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
