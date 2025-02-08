import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Combobox } from "@/components/ui/combobox";
import { useCombobox } from "@/hooks/useCombobox";
import { useToast } from "@/hooks/use-toast"
import { useDropzone } from 'react-dropzone'
import { File as LRFile, Settings, CheckCircle, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/run/new')({
  component: PipelineComponent,
})

interface Step {
  label: string
  content: React.ReactNode
  icon: React.ReactNode
}

interface FileUploadProps {
  files: File[]
  setFiles: React.Dispatch<React.SetStateAction<File[]>>
}

function StageTracker({
  steps,
  currentStep,
}: {
  steps: Step[]
  currentStep: number
}) {
  return (
    <div className="flex items-center gap-4 mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex-1 flex flex-col items-center">
          <div
            className={`p-4 rounded-full ${
              index <= currentStep
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {step.icon}
          </div>
          <div
            className={`mt-2 text-center ${
              index === currentStep ? 'font-bold text-blue-500' : ''
            }`}
          >
            {step.label}
          </div>
          <div className="w-full h-1 bg-gray-200 mt-2 relative">
            <div
              className={`h-full absolute top-0 left-0 ${
                index < currentStep ? 'bg-blue-500' : 'bg-gray-200'
              }`}
              style={{
                width: `${currentStep >= index ? 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  )
}

function FileUpload({ files, setFiles }: FileUploadProps) {
  const onDrop = (acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles])
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': [], // Accept images
      'application/pdf': [], // Accept PDFs
    },
  })

  return (
    <div>
      <h3 className="mb-4 text-lg font-bold">
        Upload your files by dragging and dropping or clicking below:
      </h3>

      <div
        {...getRootProps()}
        className="border-2 border-dashed p-6 rounded cursor-pointer bg-gray-50 hover:bg-gray-100 text-center transition-all duration-200"
      >
        <input {...getInputProps()} />
        <p className="text-gray-500">
          Drag & drop files here, or click to select files
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Selected Files:</h4>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex justify-between items-center bg-gray-100 p-2 rounded"
              >
                <span>
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeFile(index)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}


const templatesPlaceholders = [
  { value: "template1", label: "template1" },
  { value: "template2", label: "template2" },
];
function ConfigUpload({
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

  const combobox = useCombobox("", (value: string) => {
    if (value == "") return
    setConfigFile(new File(["content"], value, ));
  });

  const { toast } = useToast()

  const [saveTemplateButtonActive, setSaveTemplateButtonActive] = React.useState<Boolean>(true)

  /**
   * Sends a POST request to templates endpoint to create a new template
   * @returns JSON response of request | null
   */
  const saveTemplate = async () => {
    if (!saveTemplateButtonActive) return null
    const create_template_url = "http://127.0.0.1:8000/templates"

    // Need to convert the file into json
    // ...

    let dataToReturn = null
    try {
      setSaveTemplateButtonActive(false)
      const response = await fetch(create_template_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Template C",
          description: "Description for Template C",
          extraction_schema: {
            fields: [
              { name: "field1", type: "string" },
              { name: "field2", type: "integer" },
            ],
          },
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      // Parse response JSON
      const data = await response.json(); 

      // Show success
      toast({
        title: "Success",
        description: "Template is saved!",
      })
      
      dataToReturn = data
    } catch (error) {
      console.error("Error creating template:", error);
    }

    // Reset button status
    setSaveTemplateButtonActive(true)
    return dataToReturn
  }

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

      <h4 className="font-semibold mt-4 mb-2">
        Or select a previously uploaded configuration file:
      </h4>
      <div>
        <Combobox options={templatesPlaceholders} comboboxState={combobox} />
        {/* <p className="mt-4">Selected: {selectedFramework || "None"}</p> */}
      </div>

      {configFile && (<Card className="card">
        <CardHeader className="card-header">
          <CardTitle className="card-title">
            <div className='flex justify-between items-center'>
              <p>
                Current Template
              </p>
              <div>
                <Button
                    size="sm"
                    className="btn-primary" onClick={saveTemplate}
                    disabled={!saveTemplateButtonActive}
                  >
                  {!saveTemplateButtonActive && (<Loader2 className="animate-spin" />)}
                  {saveTemplateButtonActive ? "Save Template" : "Please Wait"}
                </Button>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="card-content">
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Selected Configuration File:</h4>
            <div className="bg-gray-100 p-2 rounded flex justify-between items-center">
              <span>
                {configFile.name} ({(configFile.size / 1024).toFixed(2)} KB)
              </span>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  combobox.reset()
                  setConfigFile((prev) => null)
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>)}
    </div>
  )
}

function Confirmation({
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

function PipelineComponent() {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [files, setFiles] = React.useState<File[]>([])
  const [configFile, setConfigFile] = React.useState<File | null>(null)
  const [previousConfigs, setPreviousConfigs] = React.useState([
    { name: 'default.csv', size: 1024 },
    { name: 'default2.xlsx', size: 2048 },
  ])

  const steps: Step[] = [
    {
      label: 'File Upload',
      content: <FileUpload files={files} setFiles={setFiles} />,
      icon: <LRFile />,
    },
    {
      label: 'Configuration',
      content: (
        <ConfigUpload
          configFile={configFile}
          setConfigFile={setConfigFile}
          previousConfigs={previousConfigs}
        />
      ),
      icon: <Settings />,
    },
    {
      label: 'Confirmation',
      content: <Confirmation files={files} configFile={configFile} />,
      icon: <CheckCircle />,
    },
  ]

  const goToNextStep = () => {
    if (currentStep === 0 && files.length === 0) {
      alert('Please upload at least one file.')
      return
    }
    if (currentStep === 1 && !configFile) {
      alert('Please upload a configuration file.')
      return
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  return (
    <div className="p-8">
      <StageTracker steps={steps} currentStep={currentStep} />

      <Card className="card">
        <CardHeader className="card-header">
          <CardTitle className="card-title">
            {steps[currentStep].label}
          </CardTitle>
        </CardHeader>
        <CardContent className="card-content">
          {steps[currentStep].content}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-8">
        {currentStep > 0 ? (
          <Button className="btn-secondary" onClick={goToPreviousStep}>
            Back
          </Button>
        ) : (
          <div></div>
        )}
        {currentStep < steps.length - 1 ? (
          <Button className="btn-primary" onClick={goToNextStep}>
            Next
          </Button>
        ) : (
          <Button className="btn-primary" onClick={() => alert('Success!')}>
            Finish
          </Button>
        )}
      </div>
    </div>
  )
}
