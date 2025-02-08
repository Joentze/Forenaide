import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { File as FileIcon, Settings, CheckCircle } from 'lucide-react'
import FileUpload from './-components/FileUpload'
import ConfigUpload from './-components/ConfigUpload'
import Confirmation from './-components/Confirmation'

export const Route = createFileRoute('/run/new')({
  component: PipelineComponent,
})

interface Step {
  label: string
  content: React.ReactNode
  icon: React.ReactNode
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
            className={`p-4 rounded-full ${index <= currentStep
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-600'
              }`}
          >
            {step.icon}
          </div>
          <div
            className={`mt-2 text-center ${index === currentStep ? 'font-bold text-blue-500' : ''
              }`}
          >
            {step.label}
          </div>
          <div className="w-full h-1 bg-gray-200 mt-2 relative">
            <div
              className={`h-full absolute top-0 left-0 ${index < currentStep ? 'bg-blue-500' : 'bg-gray-200'
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
      icon: <FileIcon />,
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
          <Button className="btn-primary" onClick={goToNextStep} disabled={currentStep === 0 && files.length === 0}>
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
