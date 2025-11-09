import { __ID__, filePath } from "../consts.mjs";
import { QueryManager } from "../utils/QueryManager.mjs";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export class QueryStatus extends HandlebarsApplicationMixin(ApplicationV2) {
	// #region Options
	static DEFAULT_OPTIONS = {
		classes: [
			__ID__,
			`QueryStatus`,
		],
	};

	static PARTS = {
		users: {
			template: filePath(`templates/QueryStatus/users.hbs`),
		},
		// controls: {
		// 	template: filePath(`templates/QueryStatus/controls.hbs`),
		// },
	};
	// #endregion Options

	// #region Instance
	constructor({
		requestID,
		...opts
	}) {
		super(opts);
		this.requestID = requestID;
	};
	// #endregion Instance

	// #region Lifecycle
	async _preparePartContext(partID) {
		const ctx = {};

		switch (partID) {
			case `users`: {
				this._prepareUsers(ctx);
				break;
			};
			case `controls`: {
				this._prepareControls(ctx);
				break;
			};
		};

		return ctx;
	};

	async _prepareUsers(ctx) {
		const query = QueryManager.get(this.requestID);
		if (!query) { return };

		const users = [];
		for (const userID of query.users) {
			const user = game.users.get(userID);
			users.push({
				id: userID,
				name: user.name,
				colour: user.color,
				answers: query.responses[userID] ?? null,
			});
		};
		ctx.users = users;
	};

	async _prepareControls(ctx) {};
	// #endregion Lifecycle

	// #region Actions
	// #endregion Actions
};
