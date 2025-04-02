select
  cron.schedule(
    'invoke-extraction-worker-every-10-seconds',
    '10 seconds',
    $$
    select
      net.http_post(
          url:='http://kong:8000/functions/v1/extract-structure-from-pdf',
          headers:=jsonb_build_object('Content-Type','application/json'),
          body:=jsonb_build_object('time', now() ),
          timeout_milliseconds:=5000
      ) as request_id;
    $$
  );
