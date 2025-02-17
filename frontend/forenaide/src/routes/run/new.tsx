import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FileUpload from "./-components/FileUpload";
// import ConfigUpload from './-components/ConfigUpload'
// import Confirmation from './-components/Confirmation'
import { Combobox } from "@/components/ui/Combobox";
import { useCombobox } from "@/hooks/useCombobox";
import { useToast } from "@/hooks/use-toast";
import { useDropzone } from "react-dropzone";
import {
	File as LRFile,
	Settings,
	CheckCircle,
	Loader2,
	Trash2,
	Trash,
} from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx";

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

function ConfigUpload({
	configFile,
	setConfigFile,
	previousConfigs,
}: {
	configFile: File | null;
	setConfigFile: React.Dispatch<React.SetStateAction<File | null>>;
	previousConfigs: { name: string; size: number }[];
}) {
	const onDrop = (acceptedFiles: File[]) => {
		const file = acceptedFiles[0];
		setConfigFile(file);
		extractExcelData(file);
	};

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		accept: {
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [], // Accept Excel files
		},
		maxFiles: 1, // Restrict to only one file
	});

	const combobox = useCombobox("", (value: string) => {
		if (value == "") return;
		setConfigFile(new File(["content"], value));
	});

	const { toast } = useToast();

	const [saveTemplateButtonActive, setSaveTemplateButtonActive] =
		React.useState<Boolean>(true);

	const [currentTemplates, setCurrentTemplates] = React.useState([]);

	React.useEffect(() => {
		// Get existing templates
		retrieveExistingTemplates().then((dbTemplates) => {
			// Update the combobox selection options
			const comboboxSelectionOptions = dbTemplates.map((item) => ({
				label: item.name,
				value: item.name,
			}));
			setCurrentTemplates(comboboxSelectionOptions);
		});
	}, []);

	/**
	 * Sends a GET request to templates endpoint to get all templates
	 * @returns JSON response of request | null
	 */
	const retrieveExistingTemplates = async () => {
		const get_template_url = "http://127.0.0.1:8000/templates";

		let dataToReturn = null;
		try {
			// Fetch
			const response = await fetch(get_template_url, {
				method: "GET",
			});

			if (!response.ok) {
				throw new Error(`Error: ${response.status} ${response.statusText}`);
			}
			// Parse response JSON
			const data = await response.json();

			// Assign data
			dataToReturn = data;
		} catch (error) {
			console.error("Error retrieving templates:", error);
		}

		return dataToReturn;
	};

	/**
	 * Sends a POST request to templates endpoint to create a new template
	 * @returns JSON response of request | null
	 */
	const saveTemplate = async () => {
		if (!saveTemplateButtonActive) return null;
		const create_template_url = "http://127.0.0.1:8000/templates";

		// Need to convert the file into json
		// ...

		let dataToReturn = null;
		try {
			setSaveTemplateButtonActive(false);
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
			});

			dataToReturn = data;
		} catch (error) {
			console.error("Error creating template:", error);
		}

		// Reset button status
		setSaveTemplateButtonActive(true);
		return dataToReturn;
	};

	const [templateFields, setTemplateFields] = useState([
		{ name: "", type: "", description: "" },
	]);

	function extractExcelData(file: File) {
		const reader = new FileReader();
		reader.onload = (e) => {
			const data = new Uint8Array(e.target?.result as ArrayBuffer);
			const workbook = XLSX.read(data, { type: "array" });
			const sheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[sheetName];
			const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });

			const extractedFields = [];
			for (let i = 1; i < rows.length; i++) {
				const row = rows[i];
				if (!row[0]) continue;
				extractedFields.push({
					name: row[0] || "",
					type: row[1] || "",
					description: row[2] || "",
				});
			}
			setTemplateFields(extractedFields);
		};
		reader.readAsArrayBuffer(file);
	}

	const updateTemplateField = (
		index: number,
		key: "name" | "type" | "description",
		value: string
	) => {
		const newFields = [...templateFields];
		newFields[index][key] = value;
		setTemplateFields(newFields);
	};

	const removeField = (index: number) => {
		setTemplateFields((prev) => prev.filter((_, i) => i !== index));
	};

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

			<h4 className="mb-2 mt-4 text-lg font-bold">
				Or select a previously uploaded configuration file:
			</h4>
			<div>
				<Combobox options={currentTemplates} comboboxState={combobox} />
				{/* <p className="mt-4">Selected: {selectedFramework || "None"}</p> */}
			</div>

			<div className="flex items-center justify-between mt-4">
				<h3 className="mb-2 text-lg font-bold">Or Define Template</h3>
				<Button
					size="sm"
					className="btn-secondary"
					onClick={() =>
						setTemplateFields((prev) => [
							...prev,
							{ name: "", type: "", description: "" },
						])
					}
				>
					New Fields
				</Button>
			</div>
			<div className="mt-4 p-4 border rounded bg-gray-50 space-y-4">
				{templateFields.map((field, index) => (
					<div key={index} className="flex gap-4 items-end">
						<div className="flex-1">
							<label className="block mb-1">Field Name:</label>
							<input
								type="text"
								className="w-full border rounded p-2"
								value={field.name}
								onChange={(e) =>
									updateTemplateField(index, "name", e.target.value)
								}
							/>
						</div>
						<div className="flex-1">
							<label className="block mb-1">Field Type:</label>
							<select
								className="w-full border rounded p-2"
								value={field.type}
								onChange={(e) =>
									updateTemplateField(index, "type", e.target.value)
								}
							>
								<option value="">Select type</option>
								<option value="string">String</option>
								<option value="integer">Integer</option>
								<option value="boolean">Boolean</option>
							</select>
						</div>
						<div className="flex-1">
							<label className="block mb-1">Field Description:</label>
							<input
								type="text"
								className="w-full border rounded p-2"
								value={field.description}
								onChange={(e) =>
									updateTemplateField(index, "description", e.target.value)
								}
							/>
						</div>
						{index > 0 ? (
							<Button
								size="sm"
								variant="destructive"
								onClick={() => removeField(index)}
								className="w-20"
							>
								<Trash />
							</Button>
						) : (
							<div className="w-20" />
						)}
					</div>
				))}
			</div>

			{configFile && (
				<Card className="card">
					<CardHeader className="card-header">
						<CardTitle className="card-title">
							<div className="flex justify-between items-center">
								<p>Current Template</p>
								<div>
									<Button
										size="sm"
										className="btn-primary"
										onClick={saveTemplate}
										disabled={!saveTemplateButtonActive}
									>
										{!saveTemplateButtonActive && (
											<Loader2 className="animate-spin" />
										)}
										{saveTemplateButtonActive ? "Save Template" : "Please Wait"}
									</Button>
								</div>
							</div>
						</CardTitle>
					</CardHeader>
					<CardContent className="card-content">
						<div className="mt-4">
							<h4 className="font-semibold mb-2">
								Selected Configuration File:
							</h4>
							<div className="bg-gray-100 p-2 rounded flex justify-between items-center">
								<span>
									{configFile.name} ({(configFile.size / 1024).toFixed(2)} KB)
								</span>
								<Button
									size="sm"
									variant="destructive"
									onClick={() => {
										combobox.reset();
										setConfigFile(null);
										setTemplateFields([
											{ name: "", type: "", description: "" },
										]);
									}}
								>
									Remove
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

function Confirmation({
	files,
	configFile,
}: {
	files: File[];
	configFile: File | null;
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
	);
}

function PipelineComponent() {
	const [currentStep, setCurrentStep] = React.useState(0);
	const [files, setFiles] = React.useState<File[]>([]);
	const [configFile, setConfigFile] = React.useState<File | null>(null);
	const [previousConfigs, setPreviousConfigs] = React.useState([
		{ name: "default.csv", size: 1024 },
		{ name: "default2.xlsx", size: 2048 },
	]);

	const steps: Step[] = [
		{
			label: "File Upload",
			content: <FileUpload files={files} setFiles={setFiles} />,
			icon: <LRFile />,
		},
		{
			label: "Configuration",
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
			label: "Confirmation",
			content: <Confirmation files={files} configFile={configFile} />,
			icon: <CheckCircle />,
		},
	];

	const goToNextStep = () => {
		if (currentStep === 0 && files.length === 0) {
			alert("Please upload at least one file.");
			return;
		}
		if (currentStep === 1 && !configFile) {
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
					<Button className="btn-secondary" onClick={goToPreviousStep}>
						Back
					</Button>
				) : (
					<div></div>
				)}
				{currentStep < steps.length - 1 ? (
					<Button
						className="btn-primary"
						onClick={goToNextStep}
						disabled={currentStep === 0 && files.length === 0}
					>
						Next
					</Button>
				) : (
					<Button className="btn-primary" onClick={() => alert("Success!")}>
						Finish
					</Button>
				)}
			</div>
		</div>
	);
}
