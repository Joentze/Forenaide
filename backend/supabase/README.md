### Supabase Edge-runtime Functions
In order to run the edge runtime functions, you have to run the functions using the `supabase/edge-runtime` image. The `Dockerfile` uses this existing image and copies the files into the container to be run.

Run the following Docker commands in the `./supabase` directory:

```bash
docker build -t extract-pdf-runtime .
docker run -p 9000:9000 extract-pdf-runtime
```