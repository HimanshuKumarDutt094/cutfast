import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

interface TooltipPreviewProps {
	content: string;
	position: { x: number; y: number };
	onClose: () => void;
}

function TooltipPreview({ content, position, onClose }: TooltipPreviewProps) {
	const tooltipRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
				onClose();
			}
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEscape);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
		};
	}, [onClose]);

	return (
		<div
			ref={tooltipRef}
			className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3 max-w-xs"
			style={{
				left: position.x,
				top: position.y,
				transform: "translate(-50%, -100%)",
			}}
		>
			<div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
				{content}
			</div>
			<div className="text-xs text-gray-500 mt-2 border-t pt-1">
				<span className="font-medium">Tab</span> to insert • <span className="font-medium">Esc</span> to cancel
			</div>
		</div>
	);
}

// Function to render tooltip in DOM
export function renderTooltipPreview(
	content: string,
	position: { x: number; y: number },
	onClose: () => void
): () => void {
	const container = document.createElement("div");
	container.id = "cutfast-tooltip-container";
	document.body.appendChild(container);

	const root = createRoot(container);
	root.render(<TooltipPreview content={content} position={position} onClose={onClose} />);

	// Return cleanup function
	return () => {
		root.unmount();
		if (container.parentNode) {
			container.parentNode.removeChild(container);
		}
	};
}
