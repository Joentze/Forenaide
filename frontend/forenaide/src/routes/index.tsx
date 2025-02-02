import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Plus,
	File,
	Download,
	Redo2,
	Clock,
	CheckCircle,
	FileText,
	Calendar,
} from "lucide-react";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	const navigate = useNavigate();

	return (
		<div className="flex-1 flex flex-col gap-8 w-full h-full p-10">
			<div className="border p-8 flex flex-col items-center gap-8 w-full h-full">
				<Card className="w-full h-full">
					<Tabs defaultValue="results">
						<CardHeader>
							<CardTitle>Run Dashboard</CardTitle>
							<div className="flex items-center justify-between mt-4 gap-4">
								<TabsList>
									<TabsTrigger value="results">Runs</TabsTrigger>
									<TabsTrigger value="log">Activity Log</TabsTrigger>
									<TabsTrigger value="queue">Processing Queue</TabsTrigger>
								</TabsList>
								<Button onClick={() => navigate("/pipeline")}>
									<Plus />
									New Run
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<TabsContent value="results">
								<Card>
									<Tabs defaultValue="completed">
										<TabsList>
											<TabsTrigger value="completed">Completed</TabsTrigger>
											<TabsTrigger value="inprogress">In-Progress</TabsTrigger>
										</TabsList>
										<TabsContent value="completed">
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead className="w-[100px]">Run No.</TableHead>
														<TableHead className="w-[100px]">Files</TableHead>
														<TableHead className="w-[150px]">
															Config File
														</TableHead>
														<TableHead className="w-[100px]">
															Download
														</TableHead>
														<TableHead className="w-[100px]">Re-Run</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													<TableRow>
														<TableCell>1</TableCell>
														<TableCell>
															<File />
														</TableCell>
														<TableCell>
															<div className="flex items-center gap-2">
																<File />
																<span>default.csv</span>
															</div>
														</TableCell>
														<TableCell>
															<Button>
																<Download />
															</Button>
														</TableCell>
														<TableCell>
															<Button>
																<Redo2 />
															</Button>
														</TableCell>
													</TableRow>
												</TableBody>
											</Table>
										</TabsContent>
										<TabsContent value="inprogress">
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead className="w-[100px]">Run No.</TableHead>
														<TableHead className="w-[100px]">Files</TableHead>
														<TableHead className="w-[150px]">
															Config File
														</TableHead>
														<TableHead className="w-[100px]">
															Download
														</TableHead>
														<TableHead className="w-[200px]">
															Run Progress
														</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													<TableRow>
														<TableCell>2</TableCell>
														<TableCell>
															<File />
														</TableCell>
														<TableCell>
															<div className="flex items-center gap-2">
																<File />
																<span>default.csv</span>
															</div>
														</TableCell>
														<TableCell>
															<Button disabled>
																<Download />
															</Button>
														</TableCell>
														<TableCell>
															<Progress value={33} />
														</TableCell>
													</TableRow>
												</TableBody>
											</Table>
										</TabsContent>
									</Tabs>
								</Card>
							</TabsContent>
							<TabsContent value="log">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-[100px]">User</TableHead>
											<TableHead className="w-[150px]">Action</TableHead>
											<TableHead className="w-[150px]">Object</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										<TableRow>
											<TableCell className="font-medium">Marcus</TableCell>
											<TableCell>Download</TableCell>
											<TableCell>Run 1 Results</TableCell>
										</TableRow>
										<TableRow>
											<TableCell className="font-medium">Marcus</TableCell>
											<TableCell>Upload</TableCell>
											<TableCell>Attribute File</TableCell>
										</TableRow>
									</TableBody>
								</Table>
							</TabsContent>
							<TabsContent value="queue">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-[100px]">Run No.</TableHead>
											<TableHead className="w-[150px]">File Name</TableHead>
											<TableHead className="w-[200px]"></TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										<TableRow>
											<TableCell className="font-medium">Run 2</TableCell>
											<TableCell>PDF_Document_1.pdf</TableCell>
											<TableCell>
												<Progress value={33} />
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell className="font-medium">Run 2</TableCell>
											<TableCell>PDF_Document_2.pdf</TableCell>
											<TableCell>
												<Progress value={0} />
											</TableCell>
										</TableRow>
									</TableBody>
								</Table>
							</TabsContent>
						</CardContent>
					</Tabs>
				</Card>

				<Card className="w-full h-full">
					<CardHeader>
						<CardTitle>Most Recent Run</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col items-center">
								<p className="text-sm text-muted-foreground">Duration</p>
								<p className="text-lg font-semibold">2 Hours</p>
							</div>
							<div className="flex flex-col items-center">
								<p className="text-sm text-muted-foreground">Status</p>
								<p className="text-lg font-semibold text-green-500">Success</p>
							</div>
							<div className="flex flex-col items-center">
								<p className="text-sm text-muted-foreground">Files Processed</p>
								<p className="text-lg font-semibold">12</p>
							</div>
							<div className="flex flex-col items-center">
								<p className="text-sm text-muted-foreground">Started</p>
								<p className="text-lg font-semibold">3 hours ago</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
