import {
	Calendar,
	Home,
	Inbox,
	Search,
	Settings,
	FileUp,
	FileDown,
	FolderPlus,
	FileSliders,
} from "lucide-react";

import logo from "../assets/KPMG_logo.svg";
import {
	Sidebar,
	SidebarHeader,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useRouter } from "@tanstack/react-router";

// Menu items.
const items = [
	{
		title: "Home",
		url: "/",
		icon: Home,
	},
	{
		title: "Start New Run",
		url: "/run/new",
		icon: FolderPlus,
	},
	{
		title: "Manage Templates",
		url: "/templates",
		icon: FileSliders,
	},
];

export function AppSidebar() {
	// Add active route detection.
	const router = useRouter();

	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarHeader>
						<img src={logo} width={150} alt="KPMG logo" />
						<span className="text-xl font-bold">ForenAIDE Platform</span>
					</SidebarHeader>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										className="font-sans text-lg font-semibold m-1 pt-5 pb-5"
									>
										<Link
											to={item.url}
											activeProps={{
												style: {
													background: "lightgray",
												}
											}}
										>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
