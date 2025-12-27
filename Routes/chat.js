import express from "express";
import Thread from "../Model/thread.js";
import getopenrouterResponse from "../Utils/openrouter.js"
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
router.get("/thread",async(req,res) =>{
    try{
        //desending order in updated time
        const threads = await Thread.find({}).sort({updatedAt:-1});
        res.json(threads)
    }catch(err){
        console.log(err);
        res.status(500).json({error: "Failed to save in threads"});
    }
})


// Get/:thread/threadId - 1 specific thread all messages
router.get("/thread/:threadId",async(req,res) =>{
    const {threadId} = req.params;

    const thread = await Thread.findOne({threadId})
    if(!thread){
        res.status(404).json({error:"message not found"})
    }
    res.json(thread.messages);
})

// Delete/thread /threadID - delete chat
router.delete("/thread/:threadId",async(req,res) =>{
    const {threadId} = req.params
    try{
        const deletethread = await Thread.findOneAndDelete(threadId)
        if(!deletethread){
            res.status(500).json({error:"thread not found"})
        }
        res.status(200).json({sucess:"thread delete successfully"})
    }catch(err){
        console.log(err);
        res.status(500).json({error: "Failed !"}); 
    }
})

// post /chat - [message,reply]
//validate thread id - its existing /not existing
//if thread id is not DB - create new id
//save message as user in thread and get operrouter message
//store reply
router.post("/chat", async(req, res) => {
    const {threadId, message} = req.body;

    if(!threadId || !message) {
        res.status(400).json({error: "missing required fields"});
    }

    try {
        let thread = await Thread.findOne({threadId});

        if(!thread) {
            //create a new thread in Db
            thread = new Thread({
                threadId,
                title: message,
                messages: [{role: "user", content: message}]
            });
        } else {
            thread.messages.push({role: "user", content: message});
        }

        const assistantReply = await getopenrouterResponse(message);

        thread.messages.push({role: "assistant", content: assistantReply});
        thread.UpdatedAt = new Date();

        await thread.save();
        res.json({reply: assistantReply});
    } catch(err) {
        console.log(err);
        res.status(500).json({error: "something went wrong"});
    }
});


export default router;