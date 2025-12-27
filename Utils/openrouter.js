import "dotenv/config";

const getopenrouterResponse = async (message) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: "nex-agi/deepseek-v3.1-nex-n1:free",
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    }),
  };

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", options);
    const data = await response.json();
    //reply
   // console.log(data.choices[0].message.content);
    return data.choices[0].message.content;
  } catch (err) {
    console.log("Error:", err);
    res.status(500).send({ error: err.message });
  }
}

export default getopenrouterResponse;