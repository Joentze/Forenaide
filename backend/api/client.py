import dotenv
from supabase import create_client, Client

env = dotenv.dotenv_values()

url: str = env.get("SUPABASE_URL", False)
key: str = env.get("SUPABASE_KEY", False)

# Raise error if URL or Key is missing
if not url or not key:
    raise ValueError("Supabase URL and Key must be provided in the .env file")

supabase: Client = create_client(url, key)
