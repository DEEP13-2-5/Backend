# Backend (OpenRouter demo)

1. Copy `.env.example` to `.env` and set your OpenRouter API key:

```bash
cp .env.example .env
# then edit .env and set OPENROUTER_API_KEY
```

2. Install dependencies and start the server:

```bash
cd Backend
npm install
npm install @openrouter/sdk
node server.js
```

3. Example request:

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is the meaning of life?"}'
```
