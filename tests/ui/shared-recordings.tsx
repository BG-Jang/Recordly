import { createRoot } from "react-dom/client";
import { SharedRecordings } from "@/components/video-editor/cloud/SharedRecordings";
import "@/index.css";

// Local fixture: no account, recording, network request, or real deletion.
let recordings = [
	{
		code: "demo1",
		title: "Product walkthrough",
		createdAt: new Date().toISOString(),
		size: 42 * 1024 * 1024,
		ready: true,
		url: "https://example.test/s/demo1",
	},
	{
		code: "demo2",
		title: "An interrupted upload",
		createdAt: new Date().toISOString(),
		size: 120 * 1024 * 1024,
		ready: false,
		url: "https://example.test/s/demo2",
	},
];
window.electronAPI = {
	openExternalUrl: async (url: string) => {
		document.getElementById("fixture-result")!.textContent = `Opened ${url}`;
		return { success: true };
	},
	cloudShareManage: async (input: { action: string; shareCode?: string }) => {
		if (input.action === "delete")
			recordings = recordings.filter((video) => video.code !== input.shareCode);
		return { success: true, videos: recordings };
	},
} as unknown as typeof window.electronAPI;
createRoot(document.getElementById("root")!).render(
	<main className="dashboard-surface mx-auto mt-3 max-w-6xl rounded-2xl bg-background px-7 pb-10 lg:px-10">
		<SharedRecordings
			token="fixture"
			endpoint="https://example.test/api/upload"
			standalone
			accountLabel="Demo creator"
		/>
		<p id="fixture-result" role="status" />
	</main>,
);
