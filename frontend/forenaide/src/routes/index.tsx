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
  Table2,
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
import { useToast } from "@/hooks/use-toast";
import { CreatePipelineRequest } from "./run/-components/Confirmation";
import { FileListPreview, FilePreview, SchemaPreview } from "@/components/schema";

type PipelineInfo = CreatePipelineRequest & {
  id: string;
  status: string;
  started_at: string;
  completed_at: string;
}

enum Mode {
  IN_PROGRESS = "inprogress",
  COMPLETED = "completed",
  FAILED = "failed",
  NOT_STARTED = "not_started"
}

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [pipelineRuns, setPipelineRuns] = React.useState<PipelineInfo[]>([]);

  React.useEffect(() => {
    getPipelineRuns().then((pipelines) => {
      setPipelineRuns(pipelines);
    });
  }, [])

  const getPipelineRuns = async () => {
    try {
      const res = await fetch("http://localhost:8000/pipelines");
      if (!res.ok) {
        throw Error(res.statusText)
      }

      const pipelines: PipelineInfo[] = await res.json()
      console.log(pipelines)

      return pipelines.sort((a, b) => -a.started_at.localeCompare(b.started_at));
    }

    catch (e) {
      if (e instanceof Error) {
        console.error(e.message)
      }
      return [];
    }
  }

  return (
    <div className="flex-1 flex flex-col gap-8 w-full h-full p-10">
      <div className="p-8 flex flex-col items-center gap-8 w-full h-full">
        <Card className="w-full h-full">
          <Tabs defaultValue="results">
            <CardHeader>
              <CardTitle>Run Dashboard</CardTitle>
              <div className="flex items-center justify-between mt-4 gap-4">
                <TabsList>
                  <TabsTrigger value="results">Runs</TabsTrigger>
                  <TabsTrigger value="log">Activity Log</TabsTrigger>
                </TabsList>
                <Button onClick={() => navigate({ to: "/run/new" })}>
                  <Plus />
                  New Run
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <TabsContent value="results">
                <Card className="p-3 shadow-none">
                  <Tabs defaultValue="completed">
                    <TabsList>
                      <TabsTrigger value="completed">Completed</TabsTrigger>
                      <TabsTrigger value="inprogress">In-Progress</TabsTrigger>
                      <TabsTrigger value="failed">Failed</TabsTrigger>
                    </TabsList>
                    <TabsContent value="completed">
                      <CompletedRuns pipelines={pipelineRuns.filter(p => p.status == Mode.COMPLETED)} />
                    </TabsContent>
                    <TabsContent value="inprogress">
                      <IncompleteRuns pipelines={pipelineRuns.filter(p => p.status == Mode.IN_PROGRESS || Mode.NOT_STARTED)} mode={Mode.IN_PROGRESS} />
                    </TabsContent>
                    <TabsContent value="failed">
                      <IncompleteRuns pipelines={pipelineRuns.filter(p => p.status == Mode.FAILED)} mode={Mode.FAILED} />
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
            </CardContent>
          </Tabs>
        </Card>

        {/* <Card className="w-full h-full">
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
        </Card> */}
      </div>
    </div>
  );
}

function CompletedRuns({ pipelines }: { pipelines: PipelineInfo[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[400px]">Run No.</TableHead>
          <TableHead className="w-[200px]">Started</TableHead>
          <TableHead className="w-[600px]">Files</TableHead>
          <TableHead className="w-[250px]">Template</TableHead>
          <TableHead className="">Download Output</TableHead>
          <TableHead className="">Re-Run</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pipelines.map(pipeline => (
          <TableRow key={pipeline.id}>
            <TableCell>
              <section className="flex flex-col">
                <span className="font-semibold">{pipeline.name}</span>
                <span className="text-gray-500 text-xs">{pipeline.id}</span>
              </section>
            </TableCell>

            <TableCell>
              <p>{new Date(pipeline.started_at).toLocaleString()}</p>
            </TableCell>

            <TableCell>
              <FilePreview files={pipeline.file_paths} trigger={
                <Button variant="ghost" className="px-0 m-0">
                  <FileListPreview files={pipeline.file_paths}/>
                </Button>
              } />
            </TableCell>

            <TableCell>
              <SchemaPreview schema={pipeline.extraction_schema.extraction_config.schema}
                trigger={
                  <Button variant="ghost" className="px-0">
                    <Table2 />
                    Hover to see schema
                  </Button>
                } />
            </TableCell>
            <TableCell>
              <Button><Download /></Button>
            </TableCell>
            <TableCell>
              <Button><Redo2 /></Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function IncompleteRuns({ pipelines, mode = Mode.IN_PROGRESS }: { pipelines: PipelineInfo[], mode: Mode }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[400px]">Run No.</TableHead>
          <TableHead className="w-[200px]">Started</TableHead>
          <TableHead className="w-[600px]">Files</TableHead>
          <TableHead className="w-[250px]">Template</TableHead>
          <TableHead className="">Percentage</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pipelines.map(pipeline => (
          <TableRow key={pipeline.id}>
            <TableCell>
              <section className="flex flex-col">
                <span className="font-semibold">{pipeline.name}</span>
                <span className="text-gray-500 text-xs">{pipeline.id}</span>
              </section>
            </TableCell>

            <TableCell>
              <p>{new Date(pipeline.started_at).toLocaleString()}</p>
            </TableCell>

            <TableCell>
              <FilePreview files={pipeline.file_paths} trigger={
                <Button variant="ghost" className="px-0 m-0">
                  <FileListPreview files={pipeline.file_paths}/>
                </Button>
              } />
            </TableCell>

            <TableCell>
              <SchemaPreview schema={pipeline.extraction_schema.extraction_config.schema}
                trigger={
                  <Button variant="ghost" className="px-0">
                    <Table2 />
                    Hover to see schema
                  </Button>
                } />
            </TableCell>
            <TableCell>
              {mode == Mode.IN_PROGRESS && <Progress value={33} />}
              {mode == Mode.FAILED && <CheckCircle />}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
