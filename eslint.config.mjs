import globals from "globals";
import pluginJs from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";

export default [
	// Tell eslint to ignore files that I don't mind being formatted slightly differently
	{ ignores: [ `scripts/`, `foundry/*` ] },
	{
		languageOptions: {
			globals: globals.browser,
		},
	},
	pluginJs.configs.recommended,
	// MARK: Foundry Globals
	{
		languageOptions: {
			globals: {
				CONFIG: `writable`,
				game: `readonly`,
				Handlebars: `readonly`,
				Hooks: `readonly`,
				ui: `readonly`,
				ActorSheet: `readonly`,
				ItemSheet: `readonly`,
				foundry: `readonly`,
				ChatMessage: `readonly`,
				ActiveEffect: `readonly`,
				Dialog: `readonly`,
				renderTemplate: `readonly`,
				fromUuid: `readonly`,
				fromUuidSync: `readonly`,
			},
		},
	},
	// MARK: Project Specific
	{
		plugins: {
			"@stylistic": stylistic,
		},
		languageOptions: {
			globals: {
				Logger: `readonly`,
				taf: `readonly`,
			},
		},
		rules: {
			"curly": `error`,
			"func-names": [`warn`, `as-needed`],
			"grouped-accessor-pairs": `error`,
			"no-alert": `error`,
			"no-empty": [`error`, { allowEmptyCatch: true }],
			"no-implied-eval": `error`,
			"no-invalid-this": `error`,
			"no-lonely-if": `error`,
			"no-unneeded-ternary": `error`,
			"no-nested-ternary": `error`,
			"no-var": `error`,
			"no-unused-vars": [
				`error`,
				{
					"vars": `local`,
					"args": `after-used`,
					"varsIgnorePattern": `^_`,
					"argsIgnorePattern": `^_`,
				},
			],
			"sort-imports": [`warn`, { "ignoreCase": true, "allowSeparatedGroups": true }],
			"@stylistic/semi": [`warn`, `always`, { "omitLastInOneLineBlock": true }],
			"@stylistic/no-trailing-spaces": `warn`,
			"@stylistic/space-before-blocks": [`warn`, `always`],
			"@stylistic/space-infix-ops": `warn`,
			"@stylistic/eol-last": `warn`,
			"@stylistic/operator-linebreak": [`warn`, `before`],
			"@stylistic/indent": [`warn`, `tab`],
			"@stylistic/brace-style": [`warn`, `1tbs`, { "allowSingleLine": true }],
			"@stylistic/quotes": [`warn`, `backtick`, { "avoidEscape": true }],
			"@stylistic/comma-dangle": [`warn`, { arrays: `always-multiline`, objects: `always-multiline`, imports: `always-multiline`, exports: `always-multiline`, functions: `always-multiline` }],
			"@stylistic/comma-style": [`warn`, `last`],
			"@stylistic/dot-location": [`error`, `property`],
			"@stylistic/no-confusing-arrow": `error`,
			"@stylistic/no-whitespace-before-property": `error`,
			"@stylistic/nonblock-statement-body-position": [
				`error`,
				`beside`,
				{ "overrides": { "while": `below` } },
			],
		},
	},
];
