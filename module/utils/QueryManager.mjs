/**
 * @typedef QueryData
 * @property {string[]} users
 * @property {Function} resolve
 * @property {Record<string, object>} responses
 * @property {(() => Promise<void>)|null} onSubmit
 */

import { filePath } from "../consts.mjs";

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

	static get(requestID) {
		if (!this.#queries.has(requestID)) { return null };
		const query = this.#queries.get(requestID);
		const cloned = foundry.utils.deepClone(query);

		delete cloned.onSubmit;
		delete cloned.resolve;

		return cloned;
	};

	static async query(
		request,
		{
			onSubmit = sendBasicNotification,
			users = null,
			config = undefined,
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

		const promise = new Promise((resolve) => {
			this.#queries.set(
				request.id,
				{
					users: users ?? game.users.filter(u => u.id !== game.user.id),
					resolve,
					responses: {},
					onSubmit,
				},
			);
		});
		return promise;
	};

	static async addResponse(requestID, userID, answers) {
		const data = this.#queries.get(requestID);
		data.responses[userID] = answers;

		await data.onSubmit?.(userID, answers);

		// Validate for responses from everyone
		if (data.users.length === Object.keys(data.responses).length) {
			data.resolve(data.responses);
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
};
