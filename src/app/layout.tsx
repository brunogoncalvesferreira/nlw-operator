import type { Metadata } from "next";
import { IBM_Plex_Mono, JetBrains_Mono } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/client";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

const ibmPlexMono = IBM_Plex_Mono({
	subsets: ["latin"],
	weight: ["400", "500", "700"],
	variable: "--font-body",
});

export const metadata: Metadata = {
	title: "devroast",
	description: "paste your code. get roasted.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR">
			<body
				className={`${jetbrainsMono.variable} ${ibmPlexMono.variable} bg-bg-page text-text-primary antialiased`}
			>
				<nav className="flex items-center justify-between h-14 px-10 border-b border-border-primary bg-bg-page">
					<div className="flex items-center gap-2">
						<span className="font-mono text-xl font-bold text-accent-green">
							{">"}
						</span>
						<span className="font-mono text-lg font-medium text-text-primary">
							devroast
						</span>
					</div>
					<div className="flex items-center gap-6">
						<a
							href="/leaderboard"
							className="font-mono text-[13px] text-text-secondary hover:text-text-primary transition-colors"
						>
							leaderboard
						</a>
					</div>
				</nav>
				<TRPCReactProvider>{children}</TRPCReactProvider>
			</body>
		</html>
	);
}
