import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<div className="flex w-full h-full">
				<AppSidebar />
				<main className="flex-1 flex flex-col w-full h-full justify-center">
					{children}
				</main>
			</div>
		</SidebarProvider>
	);
}
