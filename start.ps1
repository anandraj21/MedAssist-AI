#!/usr/bin/env pwsh

# MedAssist AI - Start Script for PowerShell

Write-Host "`n========================================"
Write-Host "🏥 MedAssist AI - Development Server"
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if Node.js is installed
$nodeExists = $null -ne (Get-Command node -ErrorAction SilentlyContinue)
if (-not $nodeExists) {
    Write-Host "❌ Node.js is not installed. Please install Node.js v18+" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path "backend/.env")) {
    Write-Host "❌ backend/.env file not found!" -ForegroundColor Red
    Write-Host "Please follow the SETUP.md instructions to configure your environment."
    exit 1
}

Write-Host "Starting services...`n"

# Start backend
Write-Host "🚀 Starting Backend Server (port 5000)..." -ForegroundColor Yellow
$backendJob = Start-Job -Name "Backend" -ScriptBlock {
    Set-Location (Join-Path $using:PSScriptRoot "backend")
    npm run dev
}

# Wait a bit for backend to start
Start-Sleep -Seconds 2

# Start frontend
Write-Host "🚀 Starting Frontend Dev Server (port 5173)..." -ForegroundColor Yellow
$frontendJob = Start-Job -Name "Frontend" -ScriptBlock {
    Set-Location (Join-Path $using:PSScriptRoot "frontend")
    npm run dev
}

Write-Host "`n========================================"
Write-Host "✅ Services started!`n" -ForegroundColor Green
Write-Host "Backend:  http://localhost:5000"
Write-Host "Frontend: http://localhost:5173`n"
Write-Host "Press Ctrl+C to stop the services."
Write-Host "========================================`n"

# Keep script running and display job output
$jobs = @($backendJob, $frontendJob)
$jobs | Receive-Job -Wait
