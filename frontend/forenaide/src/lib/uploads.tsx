export type FileUploadResponse = {
  message: string
  file_path: string
  download_link: string
}
// , { name: "fileStorage" }))
export async function uploadFile(file: File): Promise<never | FileUploadResponse> {
  const res = await fetch("http://localhost:8000/data_sources/upload", {
    method: "POST",
    // add file to body
    body: (() => {
      const data = new FormData();
      data.append("file", file);
      return data;
    })()
  });

  const resBody = await res.json();

  if (!res.ok) throw new Error(`${res.status} ${resBody?.detail ?? ""}`);

  return resBody as FileUploadResponse;
}
