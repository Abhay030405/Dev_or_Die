# Quick Ollama Setup for Windows
# Run this in PowerShell

Write-Host "🦙 Ollama Setup for Doc-Sage" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Check if Ollama is installed
Write-Host "1. Checking Ollama installation..." -ForegroundColor Cyan
$ollamaPath = Get-Command ollama -ErrorAction SilentlyContinue

if (-not $ollamaPath) {
    Write-Host "❌ Ollama not found!" -ForegroundColor Red
    Write-Host "📥 Please download from: https://ollama.com/download" -ForegroundColor Yellow
    Write-Host "   After installation, run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Ollama is installed at: $($ollamaPath.Source)" -ForegroundColor Green
Write-Host ""

# Check if Ollama is running
Write-Host "2. Checking Ollama service..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Ollama is running" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Ollama is not running" -ForegroundColor Yellow
    Write-Host "🚀 Starting Ollama..." -ForegroundColor Cyan
    Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    Write-Host "✅ Ollama started" -ForegroundColor Green
}
Write-Host ""

# Check if model is installed
Write-Host "3. Checking for llama3.2:3b model..." -ForegroundColor Cyan
$models = ollama list 2>&1 | Out-String

if ($models -like "*llama3.2:3b*") {
    Write-Host "✅ Model llama3.2:3b is already installed" -ForegroundColor Green
} else {
    Write-Host "❌ Model not found" -ForegroundColor Red
    Write-Host "📥 Pulling llama3.2:3b (this may take a few minutes)..." -ForegroundColor Yellow
    ollama pull llama3.2:3b
    Write-Host "✅ Model downloaded" -ForegroundColor Green
}
Write-Host ""

# Test the model
Write-Host "4. Testing model..." -ForegroundColor Cyan
try {
    $testPrompt = @{
        model = "llama3.2:3b"
        prompt = "Say 'Hello from Ollama!' in one short sentence."
        stream = $false
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method Post -Body $testPrompt -ContentType "application/json" -TimeoutSec 30
    Write-Host "✅ Model test successful!" -ForegroundColor Green
    Write-Host "   Response: $($response.response)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Model test failed: $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "================================" -ForegroundColor Green
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure your .env has: AI_PROVIDER=ollama" -ForegroundColor White
Write-Host "2. Restart your backend: python -m uvicorn app.main:app --reload" -ForegroundColor White
Write-Host "3. Upload a document to test!" -ForegroundColor White
Write-Host ""
Write-Host "Benefits:" -ForegroundColor Cyan
Write-Host "✅ No API costs" -ForegroundColor White
Write-Host "✅ No rate limits" -ForegroundColor White
Write-Host "✅ Complete privacy" -ForegroundColor White
Write-Host "✅ Works offline" -ForegroundColor White
Write-Host ""
