from pydantic_settings import BaseSettings
from supabase import create_client, Client


class Environ(BaseSettings):
    supabase_url: str = None
    supabase_key: str = None


environ = Environ()

url: str = environ.supabase_url
key: str = environ.supabase_key

# Raise error if URL or Key is missing
if not url or not key:
    raise ValueError("Supabase URL and Key must be provided in the .env file")

supabase: Client = create_client(url, key)
