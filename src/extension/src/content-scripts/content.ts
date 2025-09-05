import browser from "webextension-polyfill";

class CutFastContentScript {
	private currentInput: HTMLInputElement | HTMLTextAreaElement | null = null;
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
			this.currentInput = target as HTMLInputElement | HTMLTextAreaElement;
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

		const input = target as HTMLInputElement | HTMLTextAreaElement;
		const value = input.value;
		const cursorPosition = input.selectionStart || 0;

		const triggerMatch = this.detectTrigger(value, cursorPosition);

		if (triggerMatch) {
			this.currentTrigger = triggerMatch.trigger;
			this.showPreview(input, triggerMatch);
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

		if (event.key === "Tab" && this.currentTrigger && this.previewElement) {
			event.preventDefault();
			this.applyAutocomplete(target as HTMLInputElement | HTMLTextAreaElement);
		}

		if (event.key === "Escape" && this.previewElement) {
			this.removePreview();
		}
	}

	private detectTrigger(value: string, cursorPosition: number): { trigger: string; start: number; end: number } | null {
		const beforeCursor = value.substring(0, cursorPosition);
		const triggerRegex = /(\/\w+)$/;
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

	private showPreview(input: HTMLInputElement | HTMLTextAreaElement, triggerMatch: { trigger: string; start: number; end: number }) {
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
			this.previewElement.textContent = content;
			
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

	private positionPreview(input: HTMLInputElement | HTMLTextAreaElement, triggerMatch: { trigger: string; start: number; end: number }) {
		if (!this.previewElement) return;

		const inputRect = input.getBoundingClientRect();
		const textBeforeTrigger = input.value.substring(0, triggerMatch.start);
		const approximateCursorX = this.getTextWidth(textBeforeTrigger, input);

		this.previewElement.style.left = `${inputRect.left + approximateCursorX}px`;
		this.previewElement.style.top = `${inputRect.top - 40}px`;
	}

	private getTextWidth(text: string, input: HTMLInputElement | HTMLTextAreaElement): number {
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

	private async applyAutocomplete(input: HTMLInputElement | HTMLTextAreaElement) {
		await this.sendMessageWithRetry(
			{
				type: "QUERY_SHORTCUT",
				payload: { key: this.currentTrigger }
			},
			(response) => {
				if (response && response.success && response.data) {
					const shortcut = response.data;
					const value = input.value;
					const cursorPosition = input.selectionStart || 0;

					// Replace the trigger with the expanded content
					const beforeTrigger = value.substring(0, cursorPosition - this.currentTrigger.length);
					const afterTrigger = value.substring(cursorPosition);
					const newValue = beforeTrigger + shortcut.content + afterTrigger;

					input.value = newValue;

					// Update cursor position
					const newCursorPosition = beforeTrigger.length + shortcut.content.length;
					input.setSelectionRange(newCursorPosition, newCursorPosition);

					// Trigger input event
					input.dispatchEvent(new Event("input", { bubbles: true }));

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
}

// Initialize the content script
const cutfastContentScript = new CutFastContentScript();

export default cutfastContentScript;
