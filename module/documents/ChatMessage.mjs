import { filePath } from "../consts.mjs";

const { renderTemplate } = foundry.applications.handlebars;
const { parseHTML } = foundry.utils;

export class TAFChatMessage extends foundry.documents.ChatMessage {

	/**
	 * This override exists so that the main chat message rendering is
	 * still handled by the Core software, but when required the system
	 * adds in the chat buttons footer. This makes it so that the entire
	 * rendering pipeline for messages doesn't need to be duplicated in
	 * the system code.
	 */
	async renderHTML(opts) {
		if (this.type !== `base`) {
			return super.renderHTML(opts);
		};
		const html = await super.renderHTML(opts);
		if (this.system.buttons == null) return html;

		const buttons = this.system.visibleButtons ?? [];
		if (this.content.length && !buttons.length) return html;

		for (const btn of buttons) {
			btn.label = _loc(btn.label);
		};

		// Add my custom button rendering at the bottom of the template
		const ctx = { buttons, };
		const footerString = await renderTemplate(filePath(`templates/ChatMessage/base/buttons.hbs`), ctx);
		const footer = parseHTML(footerString);
		html.appendChild(footer);
		return html;
	};
};
