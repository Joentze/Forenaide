import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";

export default function ConfigUpload({
  configFile,
  setConfigFile,
  previousConfigs,
}: {
  configFile: File | null
  setConfigFile: React.Dispatch<React.SetStateAction<File | null>>
  previousConfigs: { name: string; size: number }[]
}) {
  const onDrop = (acceptedFiles: File[]) => {
    setConfigFile(acceptedFiles[0])
  }

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [], // Accept Excel files
    },
    maxFiles: 1, // Restrict to only one file
  })

  return (
    <div>
      <h3 className="mb-4 text-lg font-bold">Upload your configuration file</h3>
      <div
        {...getRootProps()}
        className="border-2 border-dashed p-6 rounded cursor-pointer bg-gray-50 hover:bg-gray-100 text-center transition-all duration-200"
      >
        <input {...getInputProps()} />
        <p className="text-gray-500">
          Drag & drop configuration file here, or click to select file
        </p>
      </div>

      {configFile && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Selected Configuration File:</h4>
          <div className="bg-gray-100 p-2 rounded flex justify-between items-center">
            <span>
              {configFile.name} ({(configFile.size / 1024).toFixed(2)} KB)
            </span>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setConfigFile(null)}
            >
              Remove
            </Button>
          </div>
        </div>
      )}

      <h4 className="font-semibold mt-4 mb-2">
        Or select a previously uploaded configuration file:
      </h4>
      <ul className="space-y-2">
        {previousConfigs.map((config, index) => (
          <li
            key={index}
            className="flex justify-between items-center bg-gray-100 p-2 rounded cursor-pointer"
            onClick={() => setConfigFile(new File([], config.name))}
          >
            <span>
              {config.name} ({(config.size / 1024).toFixed(2)} KB)
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
