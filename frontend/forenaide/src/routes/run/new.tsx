import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FileUpload, {
	FileStatus,
	useFileStore,
} from "./-components/FileUpload";
// import ConfigUpload from './-components/ConfigUpload'
import Confirmation, { CreatePipelineRequest } from './-components/Confirmation'
import { useToast } from "@/hooks/use-toast";
import {
	File as LRFile,
	Settings,
	CheckCircle,
} from "lucide-react";
import TemplateConfig, { SchemaItem } from "./-components/TemplateConfig";

export const Route = createFileRoute("/run/new")({
	component: PipelineComponent,
});

interface Step {
	label: string;
	content: React.ReactNode;
	icon: React.ReactNode;
}

function StageTracker({
	steps,
	currentStep,
}: {
	steps: Step[];
	currentStep: number;
}) {
	return (
		<div className="flex items-center gap-4 mb-8">
			{steps.map((step, index) => (
				<div key={index} className="flex-1 flex flex-col items-center">
					<div
						className={`p-4 rounded-full ${
							index <= currentStep
								? "bg-blue-500 text-white"
								: "bg-gray-200 text-gray-600"
						}`}
					>
						{step.icon}
					</div>
					<div
						className={`mt-2 text-center ${
							index === currentStep ? "font-bold text-blue-500" : ""
						}`}
					>
						{step.label}
					</div>
					<div className="w-full h-1 bg-gray-200 mt-2 relative">
						<div
							className={`h-full absolute top-0 left-0 ${
								index < currentStep ? "bg-blue-500" : "bg-gray-200"
							}`}
							style={{
								width: `${currentStep >= index ? 100 : 0}%`,
							}}
						></div>
					</div>
				</div>
			))}
		</div>
	);
}


function PipelineComponent() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = React.useState(0);
	const [configFile, setConfigFile] = React.useState<File | null>(null);
	const [previousConfigs, setPreviousConfigs] = React.useState([
		{ name: "default.csv", size: 1024 },
		{ name: "default2.xlsx", size: 2048 },
	]);

	const files = useFileStore((state) => state.files);
	const clearFiles = useFileStore((state) => state.clearFiles);
	const uploadedFiles = React.useMemo(() => files.filter(
		(file) => file.status === FileStatus.UPLOADED
	), [files]);

  const [pipelineRequest, setPipelineRequest] = React.useState<CreatePipelineRequest | null>(null);
  const [isPipelineCreated, setPipelineCreated] = React.useState<boolean>(false);

  const [templateFields, setTemplateFields] = React.useState<SchemaItem[]>([{name: "", type: "string", description: ""}])
  const formRef = React.useRef<HTMLFormElement>(null);

	async function submitPipeline(pipelineRequest: CreatePipelineRequest | null): Promise<void> {
    if (!pipelineRequest || typeof pipelineRequest !== "object") {
      toast({
				description: "Invalid pipeline",
				variant: "destructive"
			})
      return;
    }

    const res = await fetch("http://localhost:8000/pipelines", {
  		method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(pipelineRequest)
		})

		if (!res.ok) {
		  toast({
				description: "Something went wrong creating the pipeline",
				variant: "destructive"
			})
			setPipelineCreated(false);
      return;
		}
		setPipelineCreated(true);
    clearFiles();
		toast({description: "Pipeline created successfully!"})
	}

	const validateTemplate = React.useCallback(() => {
    if (templateFields.length === 0)
      return false;
  	for (const item of templateFields) {
      if (!["string", "integer", "boolean"].includes(item.type))
        return false;

      if (item.description === undefined || item.name == undefined || item.type === undefined)
        return false

      if (item.description === "" || item.name === "" || item.type === "")
        return false
    }

    return true;
	}, [templateFields])

	const steps: Step[] = [
		{
			label: "File Upload",
			content: <FileUpload useFileStore={useFileStore} />,
			icon: <LRFile />,
		},
		{
			label: "Configuration",
			content: (
				<TemplateConfig
					configFile={configFile}
					setConfigFile={setConfigFile}
					previousConfigs={previousConfigs}
					templateFields={templateFields}
					setTemplateFields={setTemplateFields}
				/>
			),
			icon: <Settings />,
		},
		{
			label: "Confirmation",
      content: <Confirmation
                  files={uploadedFiles}
                  configFile={configFile}
                  templateFields={templateFields}
                  pipelineRequest={pipelineRequest}
                  setPipelineRequest={setPipelineRequest}
                  formRef={formRef}
                  isPipelineCreated={isPipelineCreated} />,
			icon: <CheckCircle />,
		},
	];

	const goToNextStep = () => {
		if (currentStep === 0 && files.length === 0) {
			alert("Please upload at least one file.");
			return;
		}
		if (currentStep === 1 && templateFields.length == 0) {
			alert("Please upload a configuration file.");
			return;
		}
		if (currentStep < steps.length - 1) {
			setCurrentStep((prev) => prev + 1);
		}
	};

	const goToPreviousStep = () => {
		if (currentStep > 0) {
			setCurrentStep((prev) => prev - 1);
		}
	};

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
					<Button className="btn-secondary" onClick={goToPreviousStep} disabled={isPipelineCreated}>
						Back
					</Button>
				) : (
					<div></div>
				)}
				{currentStep < steps.length - 1 ? (
					//
					<Button
						className="btn-primary"
						onClick={goToNextStep}
						// show next button only if all files are uploaded
						disabled={
							(currentStep === 0 &&
								(files.length === 0 ||
									files.length !== uploadedFiles.length)) ||

							(currentStep === 1 && !validateTemplate())
						}
					>
						Next
					</Button>
				) : (
            <Button className="btn-primary"
                    disabled={isPipelineCreated}
                    onClick={(e) => {
                      formRef.current?.reportValidity();
                      if (formRef.current?.checkValidity()) {
                        submitPipeline(pipelineRequest)
                      }
            }}>
						Finish
					</Button>
				)}
			</div>
		</div>
	);
}
