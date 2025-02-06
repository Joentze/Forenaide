import subprocess
import shlex
import pytest
from app import app
from fastapi.testclient import TestClient


@pytest.fixture(scope="session")
def api_client():
    """
    creates test fastapi client
    """
    subprocess.call(shlex.split("supabase start"))
    with TestClient(app) as client:
        yield client
    subprocess.call(shlex.split("supabase stop"))
