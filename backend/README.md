# Forenaide Backend

- FastAPI
- Supabase (PostgreSQL + Buckets)

## Supabase

- Clone this repository
- Install [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started#installing-the-supabase-cli)
- Navigate to `backend` directory
- Start Docker daemon
- Run `supabase start` or `npx supabase start`
- Copy over values of `API URL` and `anon key` over to a `.env` file under /backend

### Additional Commands

- To refresh the database `supabase db reset`
- To stop, run `supabase stop`

## FastAPI

- Run the FastAPI server with `fastapi dev api/app.py`
- Go to [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) or [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) for the docs.

## Environments

- You can use `requirements.txt` within `backend/setup` to configure a new environment for this project
- With conda, run `conda create --name <env> --file <this file>`
- Run `conda activate <env>` to swap environments

## Helper Scripts

We've provided helper scripts to help bootstrap all aforementioned setup, making it easier to setup and run both Supabase and FastAPI via a single script

### MacOS

- `setup_env.sh` can be used to initialise supabase + fastapi together. It takes necessary secret values and stores them `.env` file
- Run `./setup/setup_env.sh` from the `backend` directory

### Windows

- `setup_env.ps1` functions exactly the same as `setup_env.sh` but for Windows
- Run `./setup/setup_env.ps1` from the `backend` directory
