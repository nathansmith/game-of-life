// =======
// Import.
// =======

const { execSync } = require('child_process');

// =========
// Commands.
// =========

const CLI_COMMAND = 'rimraf ./html';

// =============
// Run commands.
// =============

global.console.log(CLI_COMMAND);
execSync(CLI_COMMAND);
