import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";

export const Route = createFileRoute("/config")({
	component: ConfigComponent,
});

function ConfigComponent() {
	const [configFile, setConfigFile] = React.useState<File | null>(null);
	const [previousConfigs, setPreviousConfigs] = React.useState([
		{ name: "default.csv", size: 1024 },
		{ name: "default2.xlsx", size: 2048 },
	]);
	const [showSuccess, setShowSuccess] = React.useState(false);

	const onDrop = (acceptedFiles: File[]) => {
		setConfigFile(acceptedFiles[0]);
		setShowSuccess(true);
	};

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		accept: {
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [], // Accept Excel files
		},
		maxFiles: 1, // Restrict to only one file
	});

	const downloadTemplate = () => {
		// To do
		alert("Downloading template...");
	};

	const deleteConfig = (index: number) => {
		setPreviousConfigs((prev) => prev.filter((_, i) => i !== index));
	};

	const downloadConfig = (configName: string) => {
		// To do
		alert(`Downloading ${configName}...`);
	};

	return (
		<div className="p-8 space-y-8">
			<div className="flex justify-start mb-8">
				<Button className="btn-primary" size="lg" onClick={downloadTemplate}>
					<Download className="mr-2" />
					Download Configuration File Template
				</Button>
			</div>

			<Card className="card">
				<CardHeader className="card-header">
					<CardTitle className="card-title">
						Upload Configuration File
					</CardTitle>
				</CardHeader>
				<CardContent className="card-content">
					<div
						{...getRootProps()}
						className="border-2 border-dashed p-6 rounded cursor-pointer bg-gray-50 hover:bg-gray-100 text-center transition-all duration-200"
					>
						<input {...getInputProps()} />
						<p className="text-gray-500">
							Drag & drop configuration file here, or click to select file
						</p>
					</div>

					{showSuccess && (
						<div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
							Configuration file uploaded successfully!
						</div>
					)}
				</CardContent>
			</Card>

			<Card className="card">
				<CardHeader className="card-header">
					<CardTitle className="card-title">
						Previously Used Configuration Files
					</CardTitle>
				</CardHeader>
				<CardContent className="card-content">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>File Name</TableHead>
								<TableHead>Size (KB)</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{previousConfigs.map((config, index) => (
								<TableRow key={index}>
									<TableCell>{config.name}</TableCell>
									<TableCell>{(config.size / 1024).toFixed(2)}</TableCell>
									<TableCell>
										<div className="flex gap-2">
											<Button
												className="btn-primary"
												size="sm"
												onClick={() => downloadConfig(config.name)}
											>
												Download
											</Button>
											<Button
												className="btn-secondary"
												size="sm"
												variant="destructive"
												onClick={() => deleteConfig(index)}
											>
												Delete
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
