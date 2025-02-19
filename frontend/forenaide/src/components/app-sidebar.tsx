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
		url: "/run/new",
		icon: FolderPlus,
	},
	{
		title: "Manage Config File",
		url: "/config",
		icon: FileSliders,
	},
];

export function AppSidebar() {
	// Add active route detection.
	const currentPath =
		typeof window !== "undefined" ? window.location.pathname : "";

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
										<a
											href={item.url}
											style={
												item.url === currentPath
													? { background: "lightgrey" }
													: {}
											}
										>
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
