// ======
// Types.
// ======

export type IGrid = Array<Array<number>>;

// ===========
// Interfaces.
// ===========

export interface IOptions {
	canvasContext: CanvasRenderingContext2D;
	canvasHeight: number;
	canvasWidth: number;
	genCounter: Element;
	gridCols: number;
	gridRows: number;
}

export interface IState {
	generation: number;
	isPlaying: boolean;
}
