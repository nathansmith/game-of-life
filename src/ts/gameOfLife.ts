// ======
// Types.
// ======

import { IGrid, IOptions, IState } from './_types';

// ==========
// App state.
// ==========

const appState: IState = {
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
const HEIGHT = 'height';
const RESIZE = 'resize';
const WIDTH = 'width';

const CANVAS_SELECTOR = '.gol-canvas';
const COUNTER_SELECTOR = '.gol-counter';
const DATA_RESTART_SELECTOR = '[data-gol-button="restart"]';
const DATA_STOP_SELECTOR = '[data-gol-button="stop"]';

// =====================
// Get first generation.
// =====================

const getFirstGen = (options: IOptions): IGrid => {
	// Options.
	const { gridCols, gridRows } = options;

	// Build rows.
	const firstGen: IGrid = new Array(gridRows).fill(null).map((): number[] => {
		// Build columns.
		return new Array(gridCols).fill(null).map((): number => {
			// 1 or 0.
			return Math.floor(Math.random() * 2);
		});
	});

	// Expose array.
	return firstGen;
};

// ====================
// Get next generation.
// ====================

const getNextGen = (currentGen: IGrid, options: IOptions): IGrid => {
	// Increment counter.
	appState.generation++;

	// Options.
	const { genCountSpan, gridCols, gridRows } = options;

	// Update counter.
	genCountSpan.textContent = String(appState.generation);

	// Copy list.
	const nextGen: IGrid = currentGen.map((row: number[]): number[] => {
		/*
			Using `.concat()` is faster than `...` spread.

			From a practical standpoint, it doesn't matter.

			- https://twitter.com/wesbos/status/1356324828249280517
		*/
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
					const colPointer = colIndex + colOffset;
					const rowPointer = rowIndex + rowOffset;

					// Account for edges.
					if (
						colPointer >= 0 &&
						rowPointer >= 0 &&
						colPointer < gridCols &&
						rowPointer < gridRows
					) {
						// Get current neighbor.
						const currentNeighbor = currentGen[rowPointer][colPointer];

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

const renderGrid = (currentGen: IGrid, options: IOptions): void => {
	// Options.
	const { canvasContext, gridCols, gridRows } = options;

	// Loop through rows.
	for (let rowIndex = 0; rowIndex < gridRows; rowIndex++) {
		// Loop through cols.
		for (let colIndex = 0; colIndex < gridCols; colIndex++) {
			// Get cell value.
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

const renderNextGen = (currentGen: IGrid, options: IOptions): void => {
	// Get next gen.
	const nextGen: IGrid = getNextGen(currentGen, options);

	// Render grid.
	renderGrid(nextGen, options);

	// Keep going?
	if (appState.isPlaying && appState.generation < MAX_GENERATIONS) {
		window.requestAnimationFrame((): void => {
			renderNextGen(nextGen, options);
		});
	}
};

// ===========
// Start game.
// ===========

const startGame = (): void => {
	// Get counter.
	const genCountSpan: Element = document.querySelector(COUNTER_SELECTOR);

	// Get canvas.
	const canvas: HTMLCanvasElement = document.querySelector(CANVAS_SELECTOR);

	// Get context.
	const canvasContext: CanvasRenderingContext2D = canvas.getContext(CONTEXT_2D);

	// Get computed style.
	const pageStyle: CSSStyleDeclaration = window.getComputedStyle(document.documentElement);

	// Get width.
	const canvasWidth = parseFloat(pageStyle.width);

	// Get height.
	const canvasHeight = parseFloat(pageStyle.height);

	// Calculate columns and rows.
	const gridCols = Math.floor(canvasWidth / CANVAS_RESOLUTION);
	const gridRows = Math.floor(canvasHeight / CANVAS_RESOLUTION);

	// Bundle options.
	const options: IOptions = {
		canvasContext,
		canvasHeight,
		canvasWidth,
		genCountSpan,
		gridCols,
		gridRows,
	};

	// Set canvas dimensions.
	canvas.setAttribute(WIDTH, String(canvasWidth));
	canvas.setAttribute(HEIGHT, String(canvasHeight));

	// Get first gen.
	const firstGen: IGrid = getFirstGen(options);

	// Start render.
	renderNextGen(firstGen, options);
};

// ============
// Event: stop.
// ============

const handleClickStop = (): void => {
	appState.isPlaying = false;
};

// ===============
// Event: restart.
// ===============

const handleClickRestart = (): void => {
	// Stop.
	appState.isPlaying = false;

	// Non-blocking.
	window.requestAnimationFrame((): void => {
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

const handleResize = (): void => {
	/*
		Android triggeres "resize" when clicking
		a link from another app. This allows the
		animation to at least *start* correctly.
	*/
	if (1 < appState.generation) {
		handleClickStop();
	}
};

// ============
// Bind events.
// ============

const bindEvents = (): void => {
	// Get buttons.
	const buttonRestart: Element = document.querySelector(DATA_RESTART_SELECTOR);
	const buttonStop: Element = document.querySelector(DATA_STOP_SELECTOR);

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

const init = (): void => {
	// Bind events.
	bindEvents();

	// Start game.
	window.requestAnimationFrame((): void => {
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
