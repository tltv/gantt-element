var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement } from 'lit-element';
import { query } from 'lit-element/decorators.js';
import { GanttSubStepsBase } from './gantt-substeps-base';
import * as ElementUtil from 'tltv-timeline-element/dist/src/util/elementUtil.js';
import 'tltv-timeline-element/dist/src/timeline-element.js';
export class GanttStepsBase extends LitElement {
    constructor() {
        super(...arguments);
        this._steps = [];
    }
    getContentWidth() {
        return ElementUtil.getWidth(this.getContent());
    }
    getContentHeight() {
        return ElementUtil.getHeight(this.getContent());
    }
    getContent() {
        return this._content;
    }
    getOffsetTopContentElement(element) {
        if ((element instanceof GanttSubStepsBase && element.substep) || element.offsetParent === this._content) {
            return element.offsetTop;
        }
        else if (element.offsetParent === this) {
            // FireFox reports root element as offsetParent for slotted steps
            return element.offsetTop - this._container.offsetTop;
        }
        else {
            throw "element.offsetParent should be either content or gantt element";
        }
    }
    handleSlotchange(e) {
        let slot = e.target;
        this._steps = slot.assignedElements({ flatten: true }).map(element => element);
        this._steps.forEach((step, index) => step.position = index);
        console.log(`GanttElement.handleSlotchange ended with ${this._steps.length} step(s)`);
    }
    /**
    * Helper method to find Step element by given starting point and y-position
    * and delta-y. Starting point is there to optimize performance a bit as
    * there's no need to iterate through every single step element.
    *
    * @param startFromStep
    *            Starting point element
    * @param newY
    *            target y-axis position (relative to scroll container)
    * @param deltay
    *            delta-y relative to starting point element.
    * @return Step element at y-axis position. May be same element as given
    *         startFromBar element.
    */
    findStepElement(startFromStep, startTopY, startBottomY, newY, deltay) {
        let substep = startFromStep.substep;
        if (substep) {
            startFromStep = startFromStep.owner;
        }
        if (this.isBetween(newY, startTopY, startBottomY)) {
            console.log("findStepElement returns same: Y " + newY + " between " + startTopY + "-" + startBottomY);
            return startFromStep;
        }
        let startIndex = this._steps.indexOf(startFromStep);
        let stepCanditate;
        let i = startIndex;
        if (deltay > 0) {
            i++;
            for (; i < this._steps.length; i++) {
                stepCanditate = this._steps[i];
                if (this.isBetween(newY, this.getOffsetTopContentElement(stepCanditate), (this.getOffsetTopContentElement(stepCanditate) + stepCanditate.offsetHeight))) {
                    return stepCanditate;
                }
            }
        }
        else if (deltay < 0) {
            i--;
            for (; i >= 0; i--) {
                stepCanditate = this._steps[i];
                if (this.isBetween(newY, this.getOffsetTopContentElement(stepCanditate), (this.getOffsetTopContentElement(stepCanditate) + stepCanditate.offsetHeight))) {
                    return stepCanditate;
                }
            }
        }
        return startFromStep;
    }
    isBetween(v, min, max) {
        return v >= min && v <= max;
    }
    getSteps() {
        return this._steps;
    }
}
__decorate([
    query('#gantt-container')
], GanttStepsBase.prototype, "_ganttContainer", void 0);
__decorate([
    query('#container')
], GanttStepsBase.prototype, "_container", void 0);
__decorate([
    query('#content')
], GanttStepsBase.prototype, "_content", void 0);
//# sourceMappingURL=gantt-steps-base.js.map