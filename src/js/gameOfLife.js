// ==========
// App state.
// ==========

const appState = {
	generation: 0,
	isPlaying: true,
};

// ==========
// Constants.
// ==========

const CANVAS_RESOLUTION = 10;
const MAX_GENERATIONS = 1000;

const COLOR_LIVE = '#00f';
const COLOR_DEAD = '#fff';

const CLICK = 'click';
const CONTEXT_2D = '2d';
const RESIZE = 'resize';

const CANVAS_SELECTOR = '.gol-canvas';
const COUNTER_SELECTOR = '.gol-counter';
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
	// Increment counter.
	appState.generation++;

	// Options.
	const { genCounter, gridCols, gridRows } = options;

	// Update counter.
	genCounter.textContent = appState.generation;

	// Copy list.
	const nextGen = currentGen.map((row = []) => {
		// Faster than "..." spread.
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
			let livingNeighbors = 0;

			// Loop through "3x3" grid.
			for (let rowOffset = -1; rowOffset < 2; rowOffset++) {
				for (let colOffset = -1; colOffset < 2; colOffset++) {
					// Current item, early exit.
					if (rowOffset === 0 && colOffset === 0) {
						continue;
					}

					// Get offsets.
					const x = colIndex + colOffset;
					const y = rowIndex + rowOffset;

					// Account for edges.
					if (x >= 0 && y >= 0 && x < gridCols && y < gridRows) {
						// Get current neighbor.
						const currentNeighbor = currentGen[y][x];

						// Add to total.
						livingNeighbors += currentNeighbor;
					}
				}
			}

			// Determine live/dead.
			if (currentCell === 1 && livingNeighbors < 2) {
				nextGen[rowIndex][colIndex] = 0;
			} else if (currentCell === 1 && 3 < livingNeighbors) {
				nextGen[rowIndex][colIndex] = 0;
			} else if (currentCell === 0 && livingNeighbors === 3) {
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
	const { canvasContext, gridCols, gridRows } = options;

	// Loop through rows.
	for (let rowIndex = 0; rowIndex < gridRows; rowIndex++) {
		// Loop through cols.
		for (let colIndex = 0; colIndex < gridCols; colIndex++) {
			const cellValue = currentGen[rowIndex][colIndex];

			// Start path.
			canvasContext.beginPath();

			// Create rectangle.
			canvasContext.rect(
				colIndex * CANVAS_RESOLUTION,
				rowIndex * CANVAS_RESOLUTION,
				CANVAS_RESOLUTION,
				CANVAS_RESOLUTION
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
	if (appState.isPlaying && appState.generation < MAX_GENERATIONS) {
		window.requestAnimationFrame(() => {
			renderNextGen(nextGen, options);
		});
	}
};

// ===========
// Start game.
// ===========

const startGame = () => {
	// Get counter.
	const genCounter = document.querySelector(COUNTER_SELECTOR);

	// Get canvas.
	const canvas = document.querySelector(CANVAS_SELECTOR);

	// Get context.
	const canvasContext = canvas.getContext(CONTEXT_2D);

	// Get computed style.
	const pageStyle = window.getComputedStyle(document.documentElement);

	// Get width.
	const canvasWidth = parseFloat(pageStyle.width);

	// Get height.
	const canvasHeight = parseFloat(pageStyle.height);

	// Calculate columns and rows.
	const gridCols = Math.floor(canvasWidth / CANVAS_RESOLUTION);
	const gridRows = Math.floor(canvasHeight / CANVAS_RESOLUTION);

	// Bundle options.
	const options = {
		canvasContext,
		canvasHeight,
		canvasWidth,
		genCounter,
		gridCols,
		gridRows,
	};

	// Set canvas dimensions.
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;

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

	// Non-blocking.
	window.requestAnimationFrame(() => {
		// Reset.
		appState.generation = 0;
		appState.isPlaying = true;

		// Restart.
		startGame();
	});
};

// ==============
// Event: resize.
// ==============

const handleResize = () => {
	// Stop.
	handleClickStop();
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
	window.removeEventListener(RESIZE, handleResize);

	// Add events.
	buttonRestart.addEventListener(CLICK, handleClickRestart);
	buttonStop.addEventListener(CLICK, handleClickStop);
	window.addEventListener(RESIZE, handleResize);
};

// ========
// Kickoff.
// ========

const init = () => {
	// Bind events.
	bindEvents();

	// Start game.
	window.requestAnimationFrame(() => {
		startGame();
	});
};

// =======
// Bundle.
// =======

const gameOfLife = { init };

// =======
// Export.
// =======

export { gameOfLife };
