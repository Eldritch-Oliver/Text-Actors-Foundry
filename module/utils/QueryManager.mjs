import { filePath } from "../consts.mjs";
import { Logger } from "./Logger.mjs";
import { QueryStatus } from "../apps/QueryStatus.mjs";

/**
 * An object containing information about the current status for all
 * users involved with the data request.
 * @typedef {Record<
 *   string,
 *   "finished" | "waiting" | "disconnected" | "unprompted"
 * >} UserStatus
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

/**
 * This internal data store is used in order to prevent the query.notify
 * event from being fired off in situations where the user hasn't
 * responded, wasn't part of the query, or has already been notified.
 * @type {Set<string>}
 */
export const respondedToQueries = new Set();

/** @type {Map<string, QueryData>} */
const queries = new Map();

/** @type {Map<string, Promise>} */
const promises = new Map();

async function sendBasicNotification(requestID, userID, answers) {
	const content = await foundry.applications.handlebars.renderTemplate(
		filePath(`templates/query-response.hbs`),
		{ answers },
	);

	await notify(requestID, userID, content, { includeGM: false });
};

export function has(requestID) {
	return queries.has(requestID);
};

/** @returns {Omit<QueryData, "resolve"|"onSubmit"|"app">} */
export function get(requestID) {
	if (!queries.has(requestID)) { return null };
	const query = queries.get(requestID);
	const cloned = foundry.utils.deepClone(query);

	delete cloned.onSubmit;
	delete cloned.resolve;
	delete cloned.app;

	return foundry.utils.deepFreeze(cloned);
};

export async function query(
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

	if (promises.has(request.id)) {

		// Render / bring to front if the query has an app associated with it
		const query = queries.get(request.id);
		if (query?.app) {
			if (query.app.rendered) {
				query?.app?.bringToFront();
			} else {
				query.app.render({ force: true });
			};
		};

		return null;
	};

	users ??= game.users
		.filter(u => u.id !== game.user.id && u.active)
		.map(u => u.id);

	const promise = new Promise((resolve) => {

		/** @type {UserStatus} */
		const status = {};
		for (const user of users) {
			status[user] = game.users.get(user).active ? `waiting` : `disconnected`;
		};

		queries.set(
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
		queries.get(request.id).app = app;
	};

	return promise;
};

export async function requery(requestID, users) {
	const query = queries.get(requestID);
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

export async function addResponse(requestID, userID, answers) {
	if (!queries.has(requestID)) { return };
	const query = queries.get(requestID);

	// User closed the popup manually
	if (answers == null) {
		query.status[userID] = `unprompted`;
	}

	// User submitted the answers as expected
	else {
		query.responses[userID] = answers;
		query.status[userID] = `finished`;
		await query.onSubmit?.(requestID, userID, answers);
	};

	await maybeResolve(requestID);
};

async function maybeResolve(requestID) {
	const query = queries.get(requestID);
	const hasApp = query.app != null;

	// Determine how many users are considered "finished"
	let finishedUserCount = 0;
	for (const user of query.users) {
		switch (query.status[user]) {
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
	if (query.users.length === finishedUserCount) {
		query.app?.close();
		query.resolve(query.responses);
		queries.delete(requestID);
		promises.delete(requestID);
	} else {
		query.app?.render({ parts: [ `users` ] });
	};
};

export async function notify(requestID, userID, content, { includeGM = false } = {}) {
	// Prevent sending notifications for not-your queries
	if (!queries.has(requestID)) { return };

	game.socket.emit(`system.taf`, {
		event: `query.notify`,
		payload: {
			id: requestID,
			userID,
			content,
			includeGM,
		},
	});
};

export async function finish(requestID) {
	// prevent finishing other people's queries
	if (!queries.has(requestID)) { return };

	const query = queries.get(requestID);
	query.app?.close();
	query.resolve(query.responses);
	queries.delete(requestID);
	promises.delete(requestID);

	game.socket.emit(`system.taf`, {
		event: `query.cancel`,
		payload: { id: requestID },
	});
};

export async function cancel(requestID) {
	// prevent cancelling other people's queries
	if (!queries.has(requestID)) { return };

	const query = queries.get(requestID);
	query.app?.close();
	query.resolve(null);
	queries.delete(requestID);
	promises.delete(requestID);

	game.socket.emit(`system.taf`, {
		event: `query.cancel`,
		payload: { id: requestID },
	});
};

export async function setApplication(requestID, app) {
	if (!queries.has(requestID)) { return };
	if (!(app instanceof QueryStatus)) { return };
	const query = queries.get(requestID);
	if (query.app) {
		Logger.error(`Cannot set an application for a query that has one already`);
		return;
	};
	query.app = app;
};

export async function userActivity(userID, connected) {
	for (const [id, query] of queries.entries()) {
		if (query.users.includes(userID)) {

			// Update the user's status to allow for the app to re-prompt them
			if (query.status[userID] !== `finished`) {
				if (connected) {
					query.status[userID] = `unprompted`;
				} else {
					query.status[userID] = `disconnected`;
				};
				maybeResolve(id);
			};

			query.app?.render({ parts: [ `users` ] });
		};
	};
};

export const QueryManager = {
	has, get,
	query, requery,
	notify,
	finish, cancel,
	setApplication,
};
