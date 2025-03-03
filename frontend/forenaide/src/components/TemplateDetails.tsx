import * as React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { SchemaItem } from "@/routes/templates";

interface TemplateDetailsProps {
	isOpen: boolean;
	onClose: () => void;
	name: string;
	fields: SchemaItem[];
}

export function TemplateDetails({
	isOpen,
	onClose,
	name,
	fields,
}: TemplateDetailsProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[700px]">
				<DialogHeader>
					<DialogTitle>Template Details: {name}</DialogTitle>
					<DialogDescription>
						Fields and properties defined in this template.
					</DialogDescription>
				</DialogHeader>

				<div className="mt-4">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Field Name</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Description</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{fields.map((field, index) => (
								<TableRow key={index}>
									<TableCell className="font-medium">{field.name}</TableCell>
									<TableCell>{field.type}</TableCell>
									<TableCell>{field.description}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</DialogContent>
		</Dialog>
	);
}
