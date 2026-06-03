import { filePath } from "../../consts.mjs";
import { getLatestVersion } from "../../utils/ReleaseChannels.mjs";

const { isNewerVersion } = foundry.utils;
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
			const latest = await getLatestVersion();
			const latestVersion = latest.tag_name.slice(1);
			const htmlString = await renderTemplate(
				filePath(`templates/settings-sidebar-addition.hbs`),
				{
					system: game.system,
					hasNewVersion: isNewerVersion(latestVersion, game.system.version),
					newVersion: latest.tag_name,
				},
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
