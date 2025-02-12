"""
create dependencies
"""
from typing import Annotated
from fastapi import Depends
from classes.environ import Environ
from supabase import create_async_client, AsyncClient
import dotenv

dotenv.load_dotenv()


environ = Environ()

url: str = environ.supabase_url
key: str = environ.supabase_key

# Raise error if URL or Key is missing
if not url or not key:
    raise ValueError("Supabase URL and Key must be provided in the .env file")


async def provide_client():
    """
    supabase client dependencies
    """
    return await create_async_client(url, key)


SBaseDeps = Annotated[AsyncClient, Depends(provide_client)]
