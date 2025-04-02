create extension pgmq;

grant usage on schema "public" to anon;

grant usage on schema "pgmq" to anon;

select
from
    pgmq.create ('extraction');

-- reference here: https://supabase.com/docs/guides/api/using-custom-schemas
GRANT USAGE ON SCHEMA "pgmq" TO anon,
authenticated,
service_role;

GRANT ALL ON ALL TABLES IN SCHEMA "pgmq" TO anon,
authenticated,
service_role;

GRANT ALL ON ALL ROUTINES IN SCHEMA "pgmq" TO anon,
authenticated,
service_role;

GRANT ALL ON ALL SEQUENCES IN SCHEMA "pgmq" TO anon,
authenticated,
service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA "pgmq" GRANT ALL ON TABLES TO anon,
authenticated,
service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA "pgmq" GRANT ALL ON ROUTINES TO anon,
authenticated,
service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA "pgmq" GRANT ALL ON SEQUENCES TO anon,
authenticated,
service_role;