#!/bin/sh

echo "Starting Supabase..."
# Run supabase start without capturing output
supabase start

# Get the URL and key after Supabase has started (using different grep pattern)
api_url=$(supabase status --output json | grep -o '"API_URL": *"[^"]*"' | sed 's/"API_URL": *"\([^"]*\)"/\1/')
anon_key=$(supabase status --output json | grep -o '"ANON_KEY": *"[^"]*"' | sed 's/"ANON_KEY": *"\([^"]*\)"/\1/')

# Create/update .env file
echo "SUPABASE_URL=$api_url" > api/.env
echo "SUPABASE_KEY=$anon_key" >> api/.env

echo "Environment variables have been set:"
echo "SUPABASE_URL: $api_url"
echo "SUPABASE_KEY: $anon_key"

echo "Starting FastAPI server..."
# Start the FastAPI server using fastapi command
fastapi dev api/app.py