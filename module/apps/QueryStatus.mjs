import { __ID__, filePath } from "../consts.mjs";
import { get as getQuery, requery } from "../utils/QueryManager.mjs";
import { Logger } from "../utils/Logger.mjs";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export class QueryStatus extends HandlebarsApplicationMixin(ApplicationV2) {
	// #region Options
	static DEFAULT_OPTIONS = {
		classes: [
			__ID__,
			`QueryStatus`,
		],
		position: {
			width: 300,
			height: `auto`,
		},
		window: {
			resizable: true,
		},
		actions: {
			promptUser: this.promptUser,
		},
	};

	static PARTS = {
		users: {
			template: filePath(`templates/QueryStatus/users.hbs`),
		},
		controls: {
			template: filePath(`templates/QueryStatus/controls.hbs`),
		},
	};
	// #endregion Options

	// #region Instance
	/** @type {string} */
	#requestID;

	constructor({
		requestID,
		...opts
	}) {
		if (!requestID) {
			Logger.error(`A requestID must be provided for QueryStatus applications`);
			return null;
		};
		super(opts);
		this.#requestID = requestID;
	};

	get requestID() {
		return this.#requestID;
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
		};

		return ctx;
	};

	async _prepareUsers(ctx) {
		const query = getQuery(this.#requestID);
		if (!query) { return };

		const users = [];
		for (const userID of query.users) {
			const user = game.users.get(userID);
			users.push({
				id: userID,
				name: user.name,
				active: user.active,
				answers: query.responses[userID] ?? null,
				status: query.status[userID],
			});
		};
		ctx.users = users;
	};
	// #endregion Lifecycle

	// #region Actions
	/** @this {QueryStatus} */
	static async promptUser($e, element) {
		const userID = element.closest(`[data-user-id]`)?.dataset.userId;
		if (!userID) { return };
		requery(this.#requestID, [ userID ]);
	};

	/** @this {QueryStatus} */
	static async cancelRequest() {};

	/** @this {QueryStatus} */
	static async finishEarly() {};
	// #endregion Actions
};
