// ==========
// App state.
// ==========

const appState = {
	isPlaying: true,
};

// ==========
// Constants.
// ==========

const COLOR_LIVE = '#000';
const COLOR_DEAD = '#fff';

const CLICK = 'click';
const CONTEXT_2D = '2d';
const HEIGHT = 'height';
const WIDTH = 'width';

const CANVAS_SELECTOR = '.gol-canvas';
const DATA_RESOLUTION = 'data-gol-resolution';
const DATA_RESTART_SELECTOR = '[data-gol-button="restart"]';
const DATA_STOP_SELECTOR = '[data-gol-button="stop"]';

// =====================
// Get first generation.
// =====================

const getFirstGen = (options = {}) => {
	// Options.
	const { gridCols, gridRows } = options;

	// Build rows.
	const gridLayout = new Array(gridRows).fill(null).map(() => {
		// Build columns.
		return new Array(gridCols).fill(null).map(() => {
			// 1 or 0.
			return Math.floor(Math.random() * 2);
		});
	});

	// Expose array.
	return gridLayout;
};

// ====================
// Get next generation.
// ====================

const getNextGen = (currentGen = [], options = {}) => {
	// Options.
	const { gridCols, gridRows } = options;

	// Copy list.
	const nextGen = currentGen.map((row = []) => {
		return [].concat(row);
	});

	// Loop through rows.
	for (let rowIndex = 0; rowIndex < currentGen.length; rowIndex++) {
		// Get row.
		const cols = currentGen[rowIndex];

		// Loop through columns.
		for (let colIndex = 0; colIndex < cols.length; colIndex++) {
			// Get current cell
			const currentCell = currentGen[rowIndex][colIndex];

			// Neighbor total.
			let livingCellsNearby = 0;

			// Loop through "3x3" grid.
			for (let miniRowIndex = -1; miniRowIndex < 2; miniRowIndex++) {
				for (let miniColIndex = -1; miniColIndex < 2; miniColIndex++) {
					// Current item, early exit.
					if (miniRowIndex === 0 && miniColIndex === 0) {
						continue;
					}

					// Get offsets.
					const x = colIndex + miniColIndex;
					const y = rowIndex + miniRowIndex;

					// Account for edges.
					if (x >= 0 && y >= 0 && x < gridCols && y < gridRows) {
						// Get current neighbor.
						const currentNeighbor = currentGen[y][x];

						// Add to total.
						livingCellsNearby += currentNeighbor;
					}
				}
			}

			// Determine live/dead.
			if (currentCell === 1 && livingCellsNearby < 2) {
				nextGen[rowIndex][colIndex] = 0;
			} else if (currentCell === 1 && 3 < livingCellsNearby) {
				nextGen[rowIndex][colIndex] = 0;
			} else if (currentCell === 0 && livingCellsNearby === 3) {
				nextGen[rowIndex][colIndex] = 1;
			}
		}
	}

	// Expose array.
	return nextGen;
};

// ============
// Render grid.
// ============

const renderGrid = (currentGen = [], options = {}) => {
	// Options.
	const { canvasContext, canvasResolution, gridCols, gridRows } = options;

	// Loop through rows.
	for (let rowIndex = 0; rowIndex < gridRows; rowIndex++) {
		// Loop through cols.
		for (let colIndex = 0; colIndex < gridCols; colIndex++) {
			const cellValue = currentGen[rowIndex][colIndex];

			// Start path.
			canvasContext.beginPath();

			// Create rectangle.
			canvasContext.rect(
				rowIndex * canvasResolution,
				colIndex * canvasResolution,
				canvasResolution,
				canvasResolution
			);

			// Add fill.
			canvasContext.fillStyle = cellValue ? COLOR_LIVE : COLOR_DEAD;
			canvasContext.fill();
		}
	}
};

// =============
// Call updates.
// =============

const renderNextGen = (currentGen = [], options = {}) => {
	// Get next gen.
	const nextGen = getNextGen(currentGen, options);

	// Render grid.
	renderGrid(nextGen, options);

	// Keep going?
	if (appState.isPlaying) {
		window.requestAnimationFrame(() => {
			renderNextGen(nextGen, options);
		});
	}
};

// ===========
// Start game.
// ===========

const startGame = () => {
	// Get canvas.
	const canvas = document.querySelector(CANVAS_SELECTOR);

	// Get context.
	const canvasContext = canvas.getContext(CONTEXT_2D);

	// Get width.
	let canvasWidth = canvas.getAttribute(WIDTH);
	canvasWidth = parseFloat(canvasWidth);

	// Get height.
	let canvasHeight = canvas.getAttribute(HEIGHT);
	canvasHeight = parseFloat(canvasHeight);

	// Get resolution.
	let canvasResolution = canvas.getAttribute(DATA_RESOLUTION);
	canvasResolution = parseFloat(canvasResolution);

	// Calculate columns and rows.
	const gridCols = Math.floor(canvasWidth / canvasResolution);
	const gridRows = Math.floor(canvasHeight / canvasResolution);

	// Bundle options.
	const options = {
		canvasContext,
		canvasHeight,
		canvasResolution,
		canvasWidth,
		gridCols,
		gridRows,
	};

	// Get first gen.
	const firstGen = getFirstGen(options);

	// Start render.
	renderNextGen(firstGen, options);
};

// ============
// Event: stop.
// ============

const handleClickStop = () => {
	appState.isPlaying = false;
};

// ===============
// Event: restart.
// ===============

const handleClickRestart = () => {
	// Stop.
	appState.isPlaying = false;

	// Restart.
	window.requestAnimationFrame(() => {
		appState.isPlaying = true;
		startGame();
	});
};

// ============
// Bind events.
// ============

const bindEvents = () => {
	// Get buttons.
	const buttonRestart = document.querySelector(DATA_RESTART_SELECTOR);
	const buttonStop = document.querySelector(DATA_STOP_SELECTOR);

	// Prevent doubles.
	buttonRestart.removeEventListener(CLICK, handleClickRestart);
	buttonStop.removeEventListener(CLICK, handleClickStop);

	// Add events.
	buttonRestart.addEventListener(CLICK, handleClickRestart);
	buttonStop.addEventListener(CLICK, handleClickStop);
};

// ========
// Kickoff.
// ========

const init = () => {
	// Bind events.
	bindEvents();

	// Start game.
	startGame();
};

// =======
// Bundle.
// =======

const gameOfLife = { init };

// =======
// Export.
// =======

export { gameOfLife };
