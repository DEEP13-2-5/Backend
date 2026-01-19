import express from "express";
import mongoose from "mongoose";
import Thread from "../Model/thread.js";
import getopenrouterResponse from "../Utils/openrouter.js";
const router = express.Router();

//test
router.post("/test", async(req, res) => {
    try {
        const thread = new Thread({
            threadId: "xyz",
            title: "Testing New Thread3"
        });

        const response = await thread.save();
        res.send(response);
    } catch(err) {
        console.log(err);
        res.status(500).json({error: "Failed to save in DB"});
    }
});

//Get/thread - thread return all - and info sorted at updated time 
router.get("/thread", async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: "database not connected", threads: [] });
        }
        const threads = await Thread.find({}).sort({ UpdatedAt: -1 });
        res.json(threads);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch threads" });
    }
});


// Get/:thread/threadId - 1 specific thread all messages
router.get("/thread/:threadId", async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: "database not connected", messages: [] });
        }
        const { threadId } = req.params;
        const thread = await Thread.findOne({ threadId });
        if (!thread) {
            return res.status(404).json({ error: "thread not found" });
        }
        return res.json(thread.messages || []);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Failed to fetch thread" });
    }
});

// Delete/thread /threadID - delete chat
router.delete("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: "database not connected" });
        }
        const deleted = await Thread.findOneAndDelete({ threadId });
        if (!deleted) {
            return res.status(404).json({ error: "thread not found" });
        }
        return res.status(200).json({ success: "thread deleted successfully" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Failed to delete thread" });
    }
});

// post /chat - [message,reply]
//validate thread id - its existing /not existing
//if thread id is not DB - create new id
//save message as user in thread and get operrouter message
//store reply
router.post("/chat", async (req, res) => {
    const { threadId, message } = req.body;

    if (!threadId || !message) {
        return res.status(400).json({ error: "missing required fields" });
    }

    try {
        const dbUp = mongoose.connection.readyState === 1;
        let thread = null;

        if (dbUp) {
            thread = await Thread.findOne({ threadId });
            if (!thread) {
                thread = new Thread({
                    threadId,
                    title: message,
                    messages: [{ role: "user", content: message }],
                });
            } else {
                thread.messages.push({ role: "user", content: message });
            }
        }

        const assistantReply = await getopenrouterResponse(message);
        if (!assistantReply) {
            return res.status(502).json({ error: "assistant failed to respond" });
        }

        if (dbUp) {
            thread.messages.push({ role: "assistant", content: assistantReply });
            thread.UpdatedAt = new Date();
            await thread.save();
        }

        return res.json({ reply: assistantReply, persisted: dbUp });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "something went wrong" });
    }
});


export default router;