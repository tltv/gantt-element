import { LitElement, property } from 'lit-element';

type Constructor<T = object> = {
    new(...args: any[]): T;
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

export const BackgroundGridMixin = <T extends Constructor<LitElement>>(
    base: T
): T & Constructor<BackgroundGridInterface> => {
    class BackgroundGridMixin extends base implements BackgroundGridInterface {

        @property() backgroundGridEnabled = true;
        @property() useAlwaysPxSizeInBackground = false;

        _bgcontainer: HTMLElement;

        initGrid(container: HTMLElement, content: HTMLElement) {
            this._bgcontainer = container;
        }

        hideGrid() {
            this._bgcontainer.style.backgroundImage = "none";
        }

        showGrid() {
            this._bgcontainer.style.removeProperty("background-image");
        }

        setBackgroundSize(gridBlockWidth: string, gridBlockWidthPx: number, gridBlockHeightPx: number) {
            this._bgcontainer.style.setProperty("background-size", gridBlockWidth + " " + gridBlockHeightPx + "px");
        }

        setBackgroundPosition(offsetX: string, offsetY: string, posXPx: number, posYPx: number) {
            this._bgcontainer.style.setProperty("background-position", offsetX + " " + offsetY);
        }
    }
    return BackgroundGridMixin;
};