import browser from "webextension-polyfill";

class CutFastContentScript {
	private currentInput: HTMLInputElement | HTMLTextAreaElement | HTMLElement | null = null;
	private currentTrigger = "";
	private previewElement: HTMLElement | null = null;
	private retryCount = 0;
	private maxRetries = 3;

	constructor() {
		this.init();
	}

	private async init() {
		console.log("CutFast content script initialized");

		this.setupEventListeners();
		this.setupMessageListeners();
	}

	private setupEventListeners() {
		document.addEventListener("input", this.handleInput.bind(this) as EventListener, true);
		document.addEventListener("keydown", this.handleKeydown.bind(this), true);
		document.addEventListener("focus", this.handleFocus.bind(this), true);
		document.addEventListener("blur", this.handleBlur.bind(this), true);
	}

	private setupMessageListeners() {
		browser.runtime.onMessage.addListener(
			async (message: any, sender: any) => {
				console.log("Content script received message:", message);

				switch (message.type) {
					case "TRIGGER_AUTOCOMPLETE":
						await this.triggerAutocomplete();
						break;
					default:
						console.warn("Unknown message type:", message.type);
				}
			}
		);
	}

	private handleFocus(event: FocusEvent) {
		const target = event.target as HTMLElement;

		if (this.isTextInput(target)) {
			this.currentInput = target;
			console.log("Focused on input element:", target);
		}
	}

	private handleBlur(event: FocusEvent) {
		const target = event.target as HTMLElement;

		if (target === this.currentInput) {
			this.currentInput = null;
			this.removePreview();
			console.log("Blurred from input element");
		}
	}

	private handleInput(event: InputEvent) {
		const target = event.target as HTMLElement;

		if (!this.isTextInput(target)) {
			return;
		}

		// Skip if on a LaTeX website
		if (this.isLaTeXWebsite()) {
			return;
		}

		let value: string;
		let cursorPosition: number;

		if (target.contentEditable === "true") {
			// Handle contenteditable elements
			value = target.textContent || "";
			const selection = window.getSelection();
			if (selection && selection.rangeCount > 0) {
				const range = selection.getRangeAt(0);
				cursorPosition = range.startOffset;
				// For contenteditable, we need to calculate the cursor position relative to the text content
				const preCursorRange = document.createRange();
				preCursorRange.selectNodeContents(target);
				preCursorRange.setEnd(range.startContainer, range.startOffset);
				cursorPosition = preCursorRange.toString().length;
			} else {
				cursorPosition = value.length;
			}
		} else {
			// Handle regular input/textarea elements
			const input = target as HTMLInputElement | HTMLTextAreaElement;
			value = input.value;
			cursorPosition = input.selectionStart || 0;
		}

		const triggerMatch = this.detectTrigger(value, cursorPosition);

		if (triggerMatch) {
			this.currentTrigger = triggerMatch.trigger;
			this.showPreview(target, triggerMatch);
			this.queryShortcut(triggerMatch.trigger);
		} else {
			this.currentTrigger = "";
			this.removePreview();
		}
	}

	private handleKeydown(event: KeyboardEvent) {
		const target = event.target as HTMLElement;

		if (!this.isTextInput(target)) {
			return;
		}

		if (event.ctrlKey && event.shiftKey && event.key === " " && this.currentTrigger && this.previewElement) {
			event.preventDefault();
			this.applyAutocomplete(target);
		}

		if (event.key === "Escape" && this.previewElement) {
			this.removePreview();
		}
	}

	private detectTrigger(value: string, cursorPosition: number): { trigger: string; start: number; end: number } | null {
		const beforeCursor = value.substring(0, cursorPosition);
		const triggerRegex = /(\/[\w-]+)$/;
		const match = beforeCursor.match(triggerRegex);

		if (match) {
			const trigger = match[1];
			const start = match.index!;
			const end = start + trigger.length;

			return { trigger, start, end };
		}

		return null;
	}

	private async queryShortcut(trigger: string) {
		await this.sendMessageWithRetry(
			{
				type: "QUERY_SHORTCUT",
				payload: { key: trigger }
			},
			(response) => {
				if (response && response.success && response.data) {
					console.log("Shortcut found:", response.data);
					this.updatePreview(response.data.content);
				} else {
					console.log("Shortcut not found");
					this.updatePreview("No shortcut found");
				}
			}
		);
	}

	private async sendMessageWithRetry(message: any, onSuccess: (response: any) => void, attempt: number = 1): Promise<void> {
		try {
			// Check extension context
			if (!browser.runtime?.id) {
				console.warn("Extension context invalidated");
				this.updatePreview("Extension disconnected");
				return;
			}

			const response = await browser.runtime.sendMessage(message);
			
			// Reset retry count on success
			this.retryCount = 0;
			onSuccess(response);
			
		} catch (error) {
			console.error(`Message attempt ${attempt} failed:`, error);
			
			// Handle extension context invalidation specifically
			if (error instanceof Error && error.message.includes("Extension context invalidated")) {
				if (attempt < this.maxRetries) {
					console.log(`Retrying message in ${attempt * 1000}ms... (attempt ${attempt + 1}/${this.maxRetries})`);
					this.updatePreview(`Reconnecting... (${attempt}/${this.maxRetries})`);
					
					setTimeout(() => {
						this.sendMessageWithRetry(message, onSuccess, attempt + 1);
					}, attempt * 1000); // Exponential backoff
				} else {
					console.error("Max retries exceeded. Extension needs reload.");
					this.updatePreview("Extension needs reload");
				}
			} else {
				this.updatePreview("Error loading shortcut");
			}
		}
	}

	private showPreview(input: HTMLElement, triggerMatch: { trigger: string; start: number; end: number }) {
		if (this.previewElement) {
			this.removePreview();
		}

		this.previewElement = document.createElement("div");
		this.previewElement.className = "cutfast-preview";
		this.previewElement.style.cssText = `
			position: absolute;
			background: #f8f9fa;
			border: 1px solid #dee2e6;
			border-radius: 4px;
			padding: 8px 12px;
			font-size: 14px;
			color: #6c757d;
			pointer-events: none;
			z-index: 10000;
			max-width: 300px;
			word-wrap: break-word;
			box-shadow: 0 2px 8px rgba(0,0,0,0.15);
		`;

		this.previewElement.textContent = "Loading...";
		this.positionPreview(input, triggerMatch);
		document.body.appendChild(this.previewElement);
	}

	private updatePreview(content: string) {
		if (this.previewElement) {
			let displayContent = content;
			if (content.length > 50) {
				displayContent = content.substring(0, 50) + "...";
			}
			if (content !== "No shortcut found" && !content.includes("Error") && !content.includes("Extension") && content !== "Loading..." && !content.includes("Reconnecting")) {
				displayContent += "\n\nPress Ctrl+Shift+Space to accept";
			}
			this.previewElement.textContent = displayContent;

			// Change styling based on content type
			if (content.includes("Error") || content.includes("Extension")) {
				this.previewElement.style.backgroundColor = "#fff3cd";
				this.previewElement.style.borderColor = "#ffeaa7";
				this.previewElement.style.color = "#856404";
			} else if (content === "Loading..." || content.includes("Reconnecting")) {
				this.previewElement.style.backgroundColor = "#e3f2fd";
				this.previewElement.style.borderColor = "#90caf9";
				this.previewElement.style.color = "#1565c0";
			} else {
				// Success styling
				this.previewElement.style.backgroundColor = "#f8f9fa";
				this.previewElement.style.borderColor = "#dee2e6";
				this.previewElement.style.color = "#6c757d";
			}
		}
	}

	private positionPreview(input: HTMLElement, triggerMatch: { trigger: string; start: number; end: number }) {
		if (!this.previewElement) return;

		const inputRect = input.getBoundingClientRect();
		let textBeforeTrigger: string;

		if (input.contentEditable === "true") {
			textBeforeTrigger = (input.textContent || "").substring(0, triggerMatch.start);
		} else {
			const inputElement = input as HTMLInputElement | HTMLTextAreaElement;
			textBeforeTrigger = inputElement.value.substring(0, triggerMatch.start);
		}

		const approximateCursorX = this.getTextWidth(textBeforeTrigger, input);

		this.previewElement.style.left = `${inputRect.left + approximateCursorX}px`;
		this.previewElement.style.top = `${inputRect.top - 40}px`;
	}

	private getTextWidth(text: string, input: HTMLElement): number {
		const span = document.createElement("span");
		span.style.cssText = `
			position: absolute;
			visibility: hidden;
			white-space: pre;
			font-family: ${getComputedStyle(input).fontFamily};
			font-size: ${getComputedStyle(input).fontSize};
			font-weight: ${getComputedStyle(input).fontWeight};
		`;
		span.textContent = text;

		document.body.appendChild(span);
		const width = span.getBoundingClientRect().width;
		document.body.removeChild(span);

		return width;
	}

	private removePreview() {
		if (this.previewElement) {
			document.body.removeChild(this.previewElement);
			this.previewElement = null;
		}
	}

	private setCursorPositionInContentEditable(element: HTMLElement, position: number) {
		const selection = window.getSelection();
		const range = document.createRange();

		// Find the text node and position within it
		let currentPos = 0;
		let targetNode: Node | null = null;
		let targetOffset = 0;

		const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

		let node = walker.nextNode();
		while (node) {
			const nodeLength = node.textContent?.length || 0;
			if (currentPos + nodeLength >= position) {
				targetNode = node;
				targetOffset = position - currentPos;
				break;
			}
			currentPos += nodeLength;
			node = walker.nextNode();
		}

		if (targetNode) {
			range.setStart(targetNode, targetOffset);
			range.setEnd(targetNode, targetOffset);
			selection?.removeAllRanges();
			selection?.addRange(range);
		}
	}

	private async triggerAutocomplete() {
		try {
			if (!browser.runtime?.id) {
				console.warn("Extension context invalidated during trigger");
				return;
			}

			if (this.currentInput && this.currentTrigger) {
				await this.applyAutocomplete(this.currentInput);
			}
		} catch (error) {
			console.error("Failed to trigger autocomplete:", error);
		}
	}

	private async applyAutocomplete(input: HTMLElement) {
		await this.sendMessageWithRetry(
			{
				type: "QUERY_SHORTCUT",
				payload: { key: this.currentTrigger }
			},
			(response) => {
				if (response && response.success && response.data) {
					const shortcut = response.data;

					if (input.contentEditable === "true") {
						// Handle contenteditable elements
						const value = input.textContent || "";
						const selection = window.getSelection();

						if (selection && selection.rangeCount > 0) {
							const range = selection.getRangeAt(0);
							let cursorPosition = 0;

							// Calculate cursor position relative to text content
							const preCursorRange = document.createRange();
							preCursorRange.selectNodeContents(input);
							preCursorRange.setEnd(range.startContainer, range.startOffset);
							cursorPosition = preCursorRange.toString().length;

							// Replace the trigger with the expanded content
							const beforeTrigger = value.substring(0, cursorPosition - this.currentTrigger.length);
							const afterTrigger = value.substring(cursorPosition);
							const newValue = beforeTrigger + shortcut.content + afterTrigger;

							input.textContent = newValue;

							// Update cursor position
							const newCursorPosition = beforeTrigger.length + shortcut.content.length;
							this.setCursorPositionInContentEditable(input, newCursorPosition);

							// Trigger input event
							input.dispatchEvent(new Event("input", { bubbles: true }));
						}
					} else {
						// Handle regular input/textarea elements
						const inputElement = input as HTMLInputElement | HTMLTextAreaElement;
						const value = inputElement.value;
						const cursorPosition = inputElement.selectionStart || 0;

						// Replace the trigger with the expanded content
						const beforeTrigger = value.substring(0, cursorPosition - this.currentTrigger.length);
						const afterTrigger = value.substring(cursorPosition);
						const newValue = beforeTrigger + shortcut.content + afterTrigger;

						inputElement.value = newValue;

						// Update cursor position
						const newCursorPosition = beforeTrigger.length + shortcut.content.length;
						inputElement.setSelectionRange(newCursorPosition, newCursorPosition);

						// Trigger input event
						inputElement.dispatchEvent(new Event("input", { bubbles: true }));
					}

					// Clean up
					this.removePreview();
					this.currentTrigger = "";
				}
			}
		);
	}

	private isTextInput(element: HTMLElement): boolean {
		return element.tagName === "INPUT" || element.tagName === "TEXTAREA" ||
			   element.contentEditable === "true";
	}

	private isLaTeXWebsite(): boolean {
		const hostname = window.location.hostname.toLowerCase();
		const latexSites = ['overleaf.com', 'latex.org', 'tex.stackexchange.com', 'sharelatex.com'];
		return latexSites.some(site => hostname.includes(site)) || document.querySelector('script[src*="mathjax"]') !== null;
	}
}

// Initialize the content script
const cutfastContentScript = new CutFastContentScript();

export default cutfastContentScript;
