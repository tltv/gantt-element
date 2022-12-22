import { LitElement } from 'lit';
type Constructor<T = object> = {
    new (...args: any[]): T;
    prototype: T;
};
export interface BackgroundGridInterface {
    backgroundGridEnabled: boolean;
    useAlwaysPxSizeInBackground: boolean;
    initGrid(container: HTMLElement, content: HTMLElement): void;
    hideGrid(): void;
    showGrid(): void;
    setBackgroundSize(gridBlockWidth: string, gridBlockWidthPx: number, gridBlockHeightPx: number): void;
    setBackgroundPosition(offsetX: string, offsetY: string, posXPx: number, posYPx: number): void;
}
export declare const BackgroundGridMixin: <T extends Constructor<LitElement>>(base: T) => T & Constructor<BackgroundGridInterface>;
export {};
