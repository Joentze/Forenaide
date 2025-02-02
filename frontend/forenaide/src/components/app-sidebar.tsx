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

// Menu items.
const items = [
	{
		title: "Home",
		url: "/",
		icon: Home,
	},
	{
		title: "Start New Run",
		url: "/pipeline",
		icon: FolderPlus,
	},
	{
		title: "Manage Config File",
		url: "/config",
		icon: FileSliders,
	},
];

export function AppSidebar() {
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
									<SidebarMenuButton asChild>
										<a href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</a>
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
