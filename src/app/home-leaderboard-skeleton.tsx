function SkeletonBlock({ className }: { className: string }) {
	return <div className={`animate-pulse bg-bg-surface rounded ${className}`} />;
}

export function HomeLeaderboardSkeleton() {
	return (
		<>
			{/* Skeleton Cards */}
			<div className="flex flex-col gap-5">
				{[0, 1, 2].map((i) => (
					<div key={i} className="flex flex-col border border-border-primary">
						{/* Meta Row Skeleton */}
						<div className="flex items-center justify-between h-12 px-5 border-b border-border-primary">
							<div className="flex items-center gap-4">
								<SkeletonBlock className="w-8 h-4" />
								<SkeletonBlock className="w-16 h-4" />
							</div>
							<div className="flex items-center gap-3">
								<SkeletonBlock className="w-16 h-3" />
								<SkeletonBlock className="w-12 h-3" />
							</div>
						</div>

						{/* Code Block Skeleton — 3 lines */}
						<div className="flex bg-bg-input">
							{/* Line Numbers Gutter */}
							<div className="flex flex-col gap-1.5 bg-bg-surface px-2.5 py-3.5 border-r border-border-primary w-10 shrink-0 items-end">
								<SkeletonBlock className="w-3 h-3" />
								<SkeletonBlock className="w-3 h-3" />
								<SkeletonBlock className="w-3 h-3" />
							</div>

							{/* Code Lines */}
							<div className="flex-1 py-3.5 px-4 flex flex-col gap-1.5">
								<SkeletonBlock className="w-3/4 h-3" />
								<SkeletonBlock className="w-1/2 h-3" />
								<SkeletonBlock className="w-2/3 h-3" />
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Fade Hint Skeleton */}
			<div className="flex justify-center py-4">
				<SkeletonBlock className="w-60 h-3" />
			</div>
		</>
	);
}
