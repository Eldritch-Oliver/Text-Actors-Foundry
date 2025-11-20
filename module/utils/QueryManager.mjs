/**
 * An object containing information about the current status for all users involved
 * with the data request.
 * @typedef {Record<string, "finished"|"waiting"|"cancelled"|"disconnected"|"unprompted">} UserStatus
 */

/**
 * @typedef QueryData
 * @property {string[]} users
 * @property {Function} resolve
 * @property {Record<string, object>} responses
 * @property {(() => Promise<void>)|null} onSubmit
 * @property {QueryStatus|null} app
 * @property {UserStatus} status
 * @property {object} request The data used to form the initial request
 * @property {object} config The data used to create the initial config
 */

import { filePath } from "../consts.mjs";
import { Logger } from "./Logger.mjs";
import { QueryStatus } from "../apps/QueryStatus.mjs";

async function sendBasicNotification(userID, answers) {
	const content = await foundry.applications.handlebars.renderTemplate(
		filePath(`templates/query-response.hbs`),
		{ answers },
	);

	QueryManager.notify(userID, content, { includeGM: false });
};

export class QueryManager {
	/** @type {Map<string, QueryData>} */
	static #queries = new Map();
	static #promises = new Map();

	static has(requestID) {
		return this.#queries.has(requestID);
	};

	/** @returns {Omit<QueryData, "resolve"|"onSubmit"|"app">} */
	static get(requestID) {
		if (!this.#queries.has(requestID)) { return null };
		const query = this.#queries.get(requestID);
		const cloned = foundry.utils.deepClone(query);

		delete cloned.onSubmit;
		delete cloned.resolve;
		delete cloned.app;

		return foundry.utils.deepFreeze(cloned);
	};

	static async query(
		request,
		{
			onSubmit = sendBasicNotification,
			users = null,
			showStatusApp = true,
			...config
		} = {},
	) {
		if (!request.id) {
			ui.notifications.error(game.i18n.localize(`taf.notifs.error.missing-id`));
			return;
		};

		game.socket.emit(`system.taf`, {
			event: `query.prompt`,
			payload: {
				id: request.id,
				users,
				request,
				config,
			},
		});

		if (this.#promises.has(request.id)) {
			return null;
		};

		users ??= game.users
			.filter(u => u.id !== game.user.id)
			.map(u => u.id);

		const promise = new Promise((resolve) => {

			/** @type {UserStatus} */
			const status = {};
			for (const user of users) {
				status[user] = game.users.get(user).active ? `waiting` : `unprompted`;
			};

			this.#queries.set(
				request.id,
				{
					users,
					request,
					config,
					responses: {},
					resolve,
					onSubmit,
					app: null,
					status,
				},
			);
		});

		if (showStatusApp) {
			const app = new QueryStatus({ requestID: request.id });
			app.render({ force: true });
			this.#queries.get(request.id).app = app;
		};

		return promise;
	};

	static async requery(requestID, users) {
		const query = this.#queries.get(requestID);
		if (!query) { return };

		game.socket.emit(`system.taf`, {
			event: `query.prompt`,
			payload: {
				id: requestID,
				users,
				request: query.request,
				config: query.config,
			},
		});

		for (const user of users) {
			query.status[user] = `waiting`;
		};
		query.app?.render({ parts: [ `users` ] });
	};

	static async addResponse(requestID, userID, answers) {
		const data = this.#queries.get(requestID);
		data.responses[userID] = answers;
		data.status[userID] = `finished`;

		await data.onSubmit?.(userID, answers);
		this.maybeResolve(requestID);
	};

	static async maybeResolve(requestID) {
		const data = this.#queries.get(requestID);

		// Determine how many users are considered "finished"
		let finishedUserCount = 0;
		for (const user of data.users) {
			const hasApp = data.app != null;

			switch (data.status[user]) {
				case `finished`: {
					finishedUserCount++;
					break;
				};
				case `cancelled`:
				case `disconnected`:
				case `unprompted`: {
					if (!hasApp) {
						finishedUserCount++;
					};
					break;
				};
			};
		};

		// Ensure that we have a finished response from everyone prompted
		if (data.users.length === finishedUserCount) {
			data.app?.close();
			data.resolve(data.responses);
		} else {
			data.app?.render({ parts: [ `users` ] });
		};
	};

	static async notify(userID, content, { includeGM = false } = {}) {
		game.socket.emit(`system.taf`, {
			event: `query.notify`,
			payload: {
				userID,
				content,
				includeGM,
			},
		});
	}

	static async cancel(requestID) {
		// prevent cancelling other people's queries
		if (!this.#queries.has(requestID)) { return };

		game.socket.emit(`system.taf`, {
			event: `query.cancel`,
			payload: { id: requestID },
		});
	};

	static async setApplication(requestID, app) {
		if (!this.#queries.has(requestID)) { return };
		if (!(app instanceof QueryStatus)) { return };
		const query = this.#queries.get(requestID);
		if (query.app) {
			Logger.error(`Cannot set an application for a query that has one already`);
			return;
		};
		query.app = app;
	};

	static async userActivity(userID, connected) {
		for (const [id, query] of this.#queries.entries()) {
			if (query.users.includes(userID)) {

				// Update the user's status to allow for the app to re-prompt them
				if (query.status[userID] !== `finished`) {
					if (connected) {
						query.status[userID] = `unprompted`;
					} else {
						query.status[userID] = `disconnected`;
					};
					this.maybeResolve(id);
				};

				query.app?.render({ parts: [ `users` ] });
			};
		};
	};
};
