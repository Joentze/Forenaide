import asyncio
import functools
from typing import Annotated
from fastapi import Depends
from gotrue._async.gotrue_base_api import Callable
from pydantic_settings import BaseSettings
from supabase import create_async_client, AsyncClient
import dotenv

dotenv.load_dotenv()

class Environ(BaseSettings):
    """
    environ variables for api
    """
    rabbitmq_url: str
    supabase_url: str = ""
    supabase_key: str = ""


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
