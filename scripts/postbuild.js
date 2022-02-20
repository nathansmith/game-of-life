// =======
// Import.
// =======

const { execSync } = require('child_process');

// =========
// Commands.
// =========

let CLI_COMMAND_HTML = `
	html-minifier
	--input-dir ./html
	--output-dir ./html
	--file-ext html
	--collapse-whitespace
	--decode-entities
	--minify-css true
	--minify-js true
	--remove-comments
	--remove-redundant-attributes
	--remove-script-type-attributes
	--remove-style-link-type-attributes
	--use-short-doctype
`;

let CLI_COMMAND_CSS = `
	purgecss
	--config ./purgecss.config.js
	--output ./html/assets
`;

CLI_COMMAND_HTML = CLI_COMMAND_HTML.trim().replace(/\s+/g, ' ');
CLI_COMMAND_CSS = CLI_COMMAND_CSS.trim().replace(/\s+/g, ' ');

// =============
// Run commands.
// =============

global.console.log(CLI_COMMAND_HTML);
execSync(CLI_COMMAND_HTML);

global.console.log(CLI_COMMAND_CSS);
execSync(CLI_COMMAND_CSS);
