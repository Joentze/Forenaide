import { Button } from "@/components/ui/button";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { TemplateResponseType } from "@/types/template-field";
import { Edit, Eye, Table, Trash2 } from "lucide-react";

interface ITemplateListTable {
  templates: TemplateResponseType[];
  handleViewTemplate: (index: number) => void;
  handleEditTemplate: (index: number) => void;
  handleDeleteClicked: (index: number) => void;
}

function TemplateListTable({
  templates,
  handleEditTemplate,
  handleViewTemplate,
  handleDeleteClicked,
}: ITemplateListTable) {
  return (
    <Table className="">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Fields</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Edited At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.map((template, index) => (
          <TableRow key={template.id}>
            <TableCell>{template.name}</TableCell>
            <TableCell>{template.description}</TableCell>
            <TableCell>{template.schema.fields.length} fields</TableCell>
            <TableCell>
              {new Date(template.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              {template.last_updated_at
                ? new Date(template.last_updated_at).toLocaleDateString()
                : "-"}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewTemplate(index)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button
                  className="btn-primary"
                  size="sm"
                  onClick={() => handleEditTemplate(index)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  className="btn-secondary"
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteClicked(index)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
export default TemplateListTable;
