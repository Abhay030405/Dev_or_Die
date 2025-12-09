# 🦙 Setting Up Ollama with Llama 3.2 (3B) for Doc-Sage

## Why Ollama?

✅ **100% FREE** - No API costs, no quotas  
✅ **Runs Locally** - Your data never leaves your machine  
✅ **Fast** - 3B model is lightweight and quick  
✅ **Privacy** - Complete data privacy  
✅ **No Rate Limits** - Use as much as you want  

---

## Step 1: Install Ollama

### Windows
1. Download from: https://ollama.com/download
2. Run the installer
3. Ollama will start automatically

### Mac
```bash
brew install ollama
```

### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

---

## Step 2: Start Ollama Server

The Ollama server should start automatically. If not:

```bash
ollama serve
```

Keep this terminal open.

---

## Step 3: Pull Llama 3.2 Model

Open a **new terminal** and run:

```bash
# Pull the 3B model (recommended - balanced speed and quality)
ollama pull llama3.2:3b
```

**Other model options:**
```bash
# Smaller, faster (1B parameters)
ollama pull llama3.2:1b

# Larger, more accurate (8B parameters) - requires more RAM
ollama pull llama3.2:8b
```

Download progress will be shown. This may take a few minutes depending on your internet speed.

---

## Step 4: Test Ollama

```bash
ollama run llama3.2:3b
```

You should see a chat interface. Type something to test:
```
>>> Hello!
```

Press `Ctrl+D` or type `/bye` to exit.

---

## Step 5: Verify Ollama API

```bash
curl http://localhost:11434/api/tags
```

You should see a JSON response listing your installed models.

---

## Step 6: Update Backend Configuration

Your `.env` file is already configured! Just verify:

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
```

---

## Step 7: Restart Backend

```bash
cd backend
python -m uvicorn app.main:app --reload
```

You should see:
```
✅ Initialized AI Processor with Ollama (llama3.2:3b)
```

---

## Step 8: Test Document Upload

Upload a document and it should process successfully:

```bash
curl -X POST http://localhost:8000/api/docsage/upload \
  -F "file=@test.txt" \
  -F "uploaded_by=admin@sentinelops.com"
```

---

## 🎯 Model Comparison

| Model | Size | RAM Required | Speed | Quality |
|-------|------|--------------|-------|---------|
| llama3.2:1b | 1.3 GB | 4 GB | Very Fast | Good |
| llama3.2:3b | 2.0 GB | 8 GB | Fast | Very Good ⭐ |
| llama3.2:8b | 4.7 GB | 16 GB | Moderate | Excellent |

**Recommended:** `llama3.2:3b` for best balance

---

## 🔧 Troubleshooting

### "Cannot connect to Ollama"

**Solution:**
1. Check if Ollama is running: `ollama list`
2. Start Ollama: `ollama serve`
3. Verify API: `curl http://localhost:11434/api/tags`

### "Model not found"

**Solution:**
```bash
ollama pull llama3.2:3b
```

### "Out of memory"

**Solution:**
- Use smaller model: `ollama pull llama3.2:1b`
- Update .env: `OLLAMA_MODEL=llama3.2:1b`

### Ollama uses wrong port

**Solution:**
Check Ollama logs for actual port and update `.env`:
```env
OLLAMA_BASE_URL=http://localhost:YOUR_PORT
```

---

## 🚀 Performance Tips

### 1. Keep Ollama Running
Don't stop the `ollama serve` process for better response times.

### 2. Preload Model
```bash
ollama run llama3.2:3b
# Press Ctrl+D to exit
```
This keeps the model in memory for faster responses.

### 3. Adjust Concurrency
Edit Ollama config if needed (advanced):
```bash
# Set max concurrent requests
export OLLAMA_MAX_LOADED_MODELS=1
export OLLAMA_NUM_PARALLEL=2
```

---

## 🔄 Note About Gemini

This project now exclusively uses Ollama (llama3.2:3b) for all AI operations.
Gemini support has been completely removed from the codebase.

---

## 📊 What Works with Ollama

✅ Document summarization (short & long)  
✅ Keyword extraction  
✅ Tag suggestions  
✅ Document insights  
✅ AI chat with documents  
✅ Chat history  
✅ Context-aware responses  

---

## 💡 Benefits of Local AI

1. **No Costs** - Zero API fees
2. **No Quotas** - Unlimited usage
3. **Privacy** - Data stays local
4. **Speed** - No network latency
5. **Offline** - Works without internet
6. **Control** - Full control over model

---

## 🎉 You're Ready!

Ollama is now powering your Doc-Sage AI features with zero API costs!

Test it out by uploading documents and chatting with them. Enjoy unlimited AI processing! 🦙
