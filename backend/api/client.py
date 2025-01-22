import dotenv
from supabase import create_client, Client

env = dotenv.dotenv_values()

url: str = env.get("SUPABASE_URL", "")
key: str = env.get("SUPABASE_KEY", "")
supabase: Client = create_client(url, key)
