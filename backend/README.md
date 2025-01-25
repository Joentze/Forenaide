# Forenaide Backend

- FastAPI
- Supabase (PostgreSQL + Buckets)

## Supabase

- Clone this repository
- Install [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started#installing-the-supabase-cli)
- Navigate to `backend` directory
- Start Docker daemon
- Run `supabase start` or `npx supabase start`

### Additional Commands

- To refresh the database `supabase db reset`
- To stop, run `supabase stop`

## FastAPI

We are using FastAPI to build out our APIs.

- Run the FastAPI server with `fastapi dev api/app.py`
- Go to `http://127.0.0.1:8000/docs` or `http://127.0.0.1:8000/redoc` for the docs.

## Environments
- You can use `requirements.txt` within `backend/setup` to configure a new environment for this project
- With conda, run `conda create --name <env> --file <this file>` 
- Run `conda activate <env>` to swap environments
- `setup_env.sh` can be used to initialise supabase + fastapi together. It takes necessary secret values and stores them `.env` file (i made it cos im lazy)

