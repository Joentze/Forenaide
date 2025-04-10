# Forenaide Setup Script (PowerShell)

# Color codes for better output visibility
$Colors = @{
    Green = @{ForegroundColor = 'Green'}
    Blue = @{ForegroundColor = 'Blue'}
    Yellow = @{ForegroundColor = 'Yellow'}
    Red = @{ForegroundColor = 'Red'}
}

# API KEY VARIABLES
param(
    [Parameter(Mandatory=$true)]
    [string]$OPENAI_API_KEY,
    [Parameter(Mandatory=$true)]
    [string]$CLAUDE_API_KEY,
    [Parameter(Mandatory=$true)]
    [string]$GOOGLE_GENERATIVE_AI_API_KEY
)

$RABBITMQ_HOST = "rabbitmq"
$RABBITMQ_PORT = 5672

Write-Host "=== Forenaide Setup Script ===" @Colors.Blue
Write-Host "This script will set up and run both the frontend and backend of Forenaide." @Colors.Blue
Write-Host "============================" @Colors.Blue

# Check if required tools are installed
function Check-Command {
    param([string]$cmdName)
    if (!(Get-Command $cmdName -ErrorAction SilentlyContinue)) {
        Write-Host "Error: $cmdName is not installed." @Colors.Red
        Write-Host "Please follow the instructions in README-SETUP.md to install the required tools."
        exit 1
    }
}

# Check for required tools
Write-Host "Checking for required tools..." @Colors.Yellow
@("docker", "npm", "python", "pip", "pnpm", "supabase", "fastapi") | ForEach-Object {
    Check-Command $_
}

# Make sure Docker is running
Write-Host "Ensuring Docker is running..." @Colors.Yellow
try {
    docker info | Out-Null
} catch {
    Write-Host "Docker is not running. Please start Docker and try again." @Colors.Red
    exit 1
}

# Setup Python environment
Write-Host "Setting up Python environment..." @Colors.Yellow
Set-Location backend
pip install -r setup/requirements.txt

# Start Supabase
Write-Host "Starting Supabase..." @Colors.Yellow
supabase start

# Get Supabase URL and key
$supabaseStatus = supabase status --output json | ConvertFrom-Json
$api_url = $supabaseStatus.API_URL
$anon_key = $supabaseStatus.ANON_KEY

# Create/update .env file
Write-Host "Creating environment variables..." @Colors.Yellow
@"
SUPABASE_URL=$api_url
SUPABASE_KEY=$anon_key
OPENAI_API_KEY=$OPENAI_API_KEY
CLAUDE_API_KEY=$CLAUDE_API_KEY
GOOGLE_GENERATIVE_AI_API_KEY=$GOOGLE_GENERATIVE_AI_API_KEY
RABBITMQ_HOST=$RABBITMQ_HOST
RABBITMQ_PORT=$RABBITMQ_PORT
"@ | Set-Content .env

Write-Host "Environment variables have been set:" @Colors.Green
Write-Host "SUPABASE_URL: $api_url"
Write-Host "SUPABASE_KEY: $anon_key"
Write-Host "OPENAI_API_KEY: $OPENAI_API_KEY"
Write-Host "CLAUDE_API_KEY: $CLAUDE_API_KEY"
Write-Host "GOOGLE_GENERATIVE_AI_API_KEY: $GOOGLE_GENERATIVE_AI_API_KEY"
Write-Host "RABBITMQ_HOST: $RABBITMQ_HOST"
Write-Host "RABBITMQ_PORT: $RABBITMQ_PORT"

# Start Supabase functions
Start-Process -NoNewWindow supabase -ArgumentList "functions serve --env-file .env"

# Setup frontend
Write-Host "Setting up frontend..." @Colors.Yellow
Set-Location frontend/forenaide
pnpm install

# Function to handle cleanup
function Cleanup {
    Write-Host "`nShutting down services..." @Colors.Yellow
    Get-Process -Name "node", "python" -ErrorAction SilentlyContinue | Stop-Process
    Set-Location ../../../backend
    supabase stop
    Write-Host "Shutdown complete." @Colors.Green
    exit 0
}

# Register cleanup for Ctrl+C
$null = Register-ObjectEvent -InputObject ([Console]) -EventName CancelKeyPress -Action { Cleanup }

# Start frontend
Set-Location ../frontend/forenaide
Write-Host "Starting frontend server on port 3001..." @Colors.Green
Start-Process -NoNewWindow npm -ArgumentList "run dev"

# Start backend
Set-Location ../../backend
Write-Host "Starting backend server..." @Colors.Green
Start-Process -NoNewWindow fastapi -ArgumentList "dev api/app.py"

Write-Host "`nAll services are running!" @Colors.Green
Write-Host "Frontend is available at: http://localhost:3001" @Colors.Blue
Write-Host "Backend API is available at: http://localhost:8000" @Colors.Blue
Write-Host "API Documentation: http://localhost:8000/docs" @Colors.Blue
Write-Host "`nPress Ctrl+C to stop all services" @Colors.Yellow

# Keep the script running
while ($true) { Start-Sleep -Seconds 1 } 