var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { property } from 'lit/decorators.js';
export const BackgroundGridMixin = (base) => {
    class BackgroundGridMixin extends base {
        constructor() {
            super(...arguments);
            this.backgroundGridEnabled = true;
            this.useAlwaysPxSizeInBackground = false;
        }
        initGrid(container, content) {
            this._bgcontainer = container;
        }
        hideGrid() {
            this._bgcontainer.style.backgroundImage = "none";
        }
        showGrid() {
            this._bgcontainer.style.removeProperty("background-image");
        }
        setBackgroundSize(gridBlockWidth, gridBlockWidthPx, gridBlockHeightPx) {
            this._bgcontainer.style.setProperty("background-size", gridBlockWidth + " " + gridBlockHeightPx + "px");
        }
        setBackgroundPosition(offsetX, offsetY, posXPx, posYPx) {
            this._bgcontainer.style.setProperty("background-position", offsetX + " " + offsetY);
        }
    }
    __decorate([
        property()
    ], BackgroundGridMixin.prototype, "backgroundGridEnabled", void 0);
    __decorate([
        property()
    ], BackgroundGridMixin.prototype, "useAlwaysPxSizeInBackground", void 0);
    return BackgroundGridMixin;
};
//# sourceMappingURL=css-background-grid-mixin.js.map