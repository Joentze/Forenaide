export default function Confirmation({
  files,
  configFile,
}: {
  files: File[]
  configFile: File | null
}) {
  return (
    <div>
      <h3 className="mb-4 text-lg font-bold">Confirmation</h3>
      <p className="mb-4">Review the details below before proceeding:</p>
      <h4 className="font-semibold mb-2">Selected Files:</h4>
      <ul className="space-y-2">
        {files.map((file, index) => (
          <li key={index} className="bg-gray-100 p-2 rounded">
            {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </li>
        ))}
      </ul>
      {configFile && (
        <>
          <h4 className="font-semibold mt-4 mb-2">Configuration File:</h4>
          <div className="bg-gray-100 p-2 rounded">
            {configFile.name} ({(configFile.size / 1024).toFixed(2)} KB)
          </div>
        </>
      )}
    </div>
  )
}
