# Start Supabase
Write-Host "Starting Supabase..."
npx supabase start

# Get the URL and key after Supabase has started
$supabaseStatus = npx supabase status --output json | ConvertFrom-Json
$api_url = $supabaseStatus.API_URL
$anon_key = $supabaseStatus.ANON_KEY

# Create/update .env file
Set-Content -Path "api\.env" -Value "SUPABASE_URL=$api_url"
Add-Content -Path "api\.env" -Value "SUPABASE_KEY=$anon_key"

Write-Host "Environment variables have been set:"
Write-Host "SUPABASE_URL: $api_url"
Write-Host "SUPABASE_KEY: $anon_key"

# Start the FastAPI server
Write-Host "Starting FastAPI server..."
fastapi dev api/app.py