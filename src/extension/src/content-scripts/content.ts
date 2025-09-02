import browser from "webextension-polyfill";

// Content script for CutFast extension
// Handles pattern detection, DOM interactions, and text expansion

class CutFastContentScript {
	private currentInput: HTMLInputElement | HTMLTextAreaElement | null = null;
	private currentTrigger = "";
	private previewElement: HTMLElement | null = null;

	constructor() {
		this.init();
	}

	private init() {
		console.log("CutFast content script initialized");

		// Set up event listeners
		this.setupEventListeners();

		// Listen for messages from background script
		this.setupMessageListeners();
	}

	private setupEventListeners() {
		// Listen for input events on all input elements
		document.addEventListener("input", this.handleInput.bind(this), true);

		// Listen for keydown events for autocomplete trigger
		document.addEventListener("keydown", this.handleKeydown.bind(this), true);

		// Listen for focus events to track current input
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

		const input = target as HTMLInputElement | HTMLTextAreaElement;
		const value = input.value;
		const cursorPosition = input.selectionStart || 0;

		// Check for trigger pattern
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

		// Handle Tab key for autocomplete
		if (event.key === "Tab" && this.currentTrigger && this.previewElement) {
			event.preventDefault();
			this.applyAutocomplete(target as HTMLInputElement | HTMLTextAreaElement);
		}

		// Handle Escape key to dismiss preview
		if (event.key === "Escape" && this.previewElement) {
			this.removePreview();
		}
	}

	private detectTrigger(value: string, cursorPosition: number): { trigger: string; start: number; end: number } | null {
		// Look for pattern like "/shortcut" before cursor
		const beforeCursor = value.substring(0, cursorPosition);
		const triggerRegex = /(\/\w+)$/;
		const match = beforeCursor.match(triggerRegex);

		if (match) {
			const trigger = match[1];
			const start = match.index!;
			const end = start + trigger.length;

			return {
				trigger,
				start,
				end,
			};
		}

		return null;
	}

	private async queryShortcut(trigger: string) {
		try {
			const response = await browser.runtime.sendMessage({
				type: "QUERY_SHORTCUT",
				payload: { key: trigger.substring(1) }, // Remove the leading "/"
			});

			if (response.success && response.data) {
				console.log("Shortcut found:", response.data);
				// Update preview with actual content
				this.updatePreview(response.data.content);
			} else {
				console.log("Shortcut not found or error:", response.error);
				this.updatePreview("No shortcut found");
			}
		} catch (error) {
			console.error("Failed to query shortcut:", error);
			this.updatePreview("Error loading shortcut");
		}
	}

	private showPreview(input: HTMLInputElement | HTMLTextAreaElement, triggerMatch: { trigger: string; start: number; end: number }) {
		if (this.previewElement) {
			this.removePreview();
		}

		// Create preview element
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
		`;

		this.previewElement.textContent = "Loading...";

		// Position the preview
		this.positionPreview(input, triggerMatch);

		document.body.appendChild(this.previewElement);
	}

	private updatePreview(content: string) {
		if (this.previewElement) {
			this.previewElement.textContent = content;
		}
	}

	private positionPreview(input: HTMLInputElement | HTMLTextAreaElement, triggerMatch: { trigger: string; start: number; end: number }) {
		if (!this.previewElement) return;

		const inputRect = input.getBoundingClientRect();

		// Get cursor position (approximate)
		const textBeforeTrigger = input.value.substring(0, triggerMatch.start);
		const approximateCursorX = this.getTextWidth(textBeforeTrigger, input);

		this.previewElement.style.left = `${inputRect.left + approximateCursorX}px`;
		this.previewElement.style.top = `${inputRect.top - 40}px`; // Position above input
	}

	private getTextWidth(text: string, input: HTMLInputElement | HTMLTextAreaElement): number {
		// Create a temporary span to measure text width
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
		if (this.currentInput && this.currentTrigger) {
			await this.applyAutocomplete(this.currentInput);
		}
	}

	private async applyAutocomplete(input: HTMLInputElement | HTMLTextAreaElement) {
		try {
			// Get the expanded content
			const response = await browser.runtime.sendMessage({
				type: "QUERY_SHORTCUT",
				payload: { key: this.currentTrigger.substring(1) },
			});

			if (response.success && response.data) {
				const value = input.value;
				const cursorPosition = input.selectionStart || 0;

				// Replace the trigger with the expanded content
				const beforeTrigger = value.substring(0, cursorPosition - this.currentTrigger.length);
				const afterTrigger = value.substring(cursorPosition);
				const newValue = beforeTrigger + response.data.content + afterTrigger;

				input.value = newValue;

				// Update cursor position
				const newCursorPosition = beforeTrigger.length + response.data.content.length;
				input.setSelectionRange(newCursorPosition, newCursorPosition);

				// Trigger input event to notify other listeners
				input.dispatchEvent(new Event("input", { bubbles: true }));

				// Remove preview
				this.removePreview();
				this.currentTrigger = "";
			}
		} catch (error) {
			console.error("Failed to apply autocomplete:", error);
		}
	}

	private isTextInput(element: HTMLElement): boolean {
		return element.tagName === "INPUT" || element.tagName === "TEXTAREA" ||
			   element.contentEditable === "true";
	}
}

// Initialize the content script
const cutfastContentScript = new CutFastContentScript();

// Export for potential use
export default cutfastContentScript;
