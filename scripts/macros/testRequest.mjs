const rolls = {};

const response = await taf.QueryManager.query(
	{
		id: `test-data-request`,
		question: `Test Data`,
		inputs: [
			{
				type: `input`,
				inputType: `number`,
				key: `statBase`,
				label: `Stat Base`,
			}
		],
	},
	{
		onSubmit: async (userID, answers) => {

			rolls[userID] = [];

			const diceHTML = [];
			for (let i = 0; i < answers.statBase; i++) {
				const rolled = Math.floor(Math.random() * 6) + 1;
				rolls[userID].push(rolled);
				diceHTML.push(`<li class="roll dice d6">${rolled}</li>`);
			};

			const content = `Rolls:<div class="dice-tooltip"><ol class="dice-rolls">${diceHTML.join(`\n`)}</ol></div>`;

			await taf.QueryManager.notify(userID, content);
		},
	}
);
console.log({ response, rolls });
