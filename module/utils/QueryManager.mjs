/**
 * @typedef Apple
 * @property {string[]} users
 * @property {Function} resolve
 * @property {Record<string, object>} responses
 */

const { randomID } = foundry.utils;

export class QueryManager {
	static #queries = new Map();
	static #promises = new Map();

	static has(requestID) {
		return this.#queries.has(requestID);
	};

	static async query(request, users = null, config = undefined) {
		request.id ??= randomID();

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
				},
			);
		});
		return promise;
	};

	static async submit(requestID, answers) {
		game.socket.emit(`system.taf`, {
			event: `query.submit`,
			payload: {
				id: requestID,
				answers,
			},
		});
	};

	static async addResponse(requestID, userID, answers) {
		const data = this.#queries.get(requestID);
		data.responses[userID] = answers;

		// Validate for responses from everyone
		if (data.users.length === Object.keys(data.responses).length) {
			data.resolve(data.responses);
		};
	};

	static async cancel(requestID) {
		// prevent cancelling other people's queries
		if (!this.#queries.has(requestID)) { return };

		game.socket.emit(`system.taf`, {
			event: `query.cancel`,
			payload: { id: requestID },
		});
	};
};
