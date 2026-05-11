import { filePath } from "../../consts.mjs";

const { renderTemplate } = foundry.applications.handlebars;
const { Settings } = foundry.applications.sidebar.tabs;

export class TAFSettingsSidebar extends Settings {
	// #region Lifecycle
	async _onRender() {
		// remove the row from the HTML
		const systemRow = this.element.querySelector(`.info .system`);
		systemRow?.remove();

		// add the more customized system info into the sidebar
		const systemBlock = this.element.querySelector(`section.system`);
		if (!systemBlock) {
			const htmlString = await renderTemplate(
				filePath(`templates/settings-sidebar-addition.hbs`),
				{ system: game.system, },
			);

			const temp = document.createElement(`div`);
			temp.innerHTML = htmlString;
			const rendered = temp.firstChild;

			const info = this.element.querySelector(`section.info`);
			info.insertAdjacentElement(`afterend`, rendered);
		};
	};
	// #endregion Lifecycle
};
