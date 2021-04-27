// ======
// Types.
// ======

export type IGrid = number[][];

// ===========
// Interfaces.
// ===========

export interface IOptions {
	canvasContext: CanvasRenderingContext2D;
	canvasHeight: number;
	canvasWidth: number;
	genCountSpan: Element;
	gridCols: number;
	gridRows: number;
}

export interface IState {
	generation: number;
	isPlaying: boolean;
}
