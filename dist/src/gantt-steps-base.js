var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement } from 'lit';
import { query } from 'lit-element/decorators.js';
import { GanttSubStepsBase } from './gantt-substeps-base';
import * as ElementUtil from 'tltv-timeline-element/dist/src/util/elementUtil.js';
import 'tltv-timeline-element/dist/src/timeline-element.js';
import { GanttScrollerMixin } from './gantt-scroller-mixin';
import { getElementHeightWithMargin } from "./util/ganttUtil";
export class GanttStepsBase extends GanttScrollerMixin(LitElement) {
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
    /** Returns offset top in pixels relative to content top edge. */
    getOffsetTopContentElement(element) {
        if (element instanceof GanttSubStepsBase && element.substep) {
            return this.getOffsetTop(element.owner);
        }
        return this.getOffsetTop(element);
    }
    getOffsetTop(element) {
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
    /** Returns offset left in pixels relative to content left edge. */
    getOffsetLeftContentElement(element) {
        if (element instanceof GanttSubStepsBase && element.substep) {
            return this.getOffsetLeft(element.owner);
        }
        return this.getOffsetLeft(element);
    }
    getOffsetLeft(element) {
        if ((element instanceof GanttSubStepsBase && element.substep) || element.offsetParent === this._content) {
            return element.offsetLeft;
        }
        else if (element.offsetParent === this) {
            // FireFox reports root element as offsetParent for slotted steps
            return element.offsetLeft - this._container.offsetLeft;
        }
        else {
            throw "element.offsetParent should be either content or gantt element";
        }
    }
    handleSlotchange(e) {
        let slot = e.target;
        this._steps = slot.assignedElements({ flatten: true }).map(element => element);
        this._steps.forEach((step, index) => step.position = index);
        this.initStepsYPosition();
        console.log(`GanttElement.handleSlotchange ended with ${this._steps.length} step(s)`);
    }
    findStepIndexAt(topY) {
        let step;
        for (let index = 0; index < this._steps.length; index++) {
            step = this._steps[index];
            if (this.isBetween(topY, this.getOffsetTop(step), (this.getOffsetTop(step) + step.offsetHeight))) {
                return index;
            }
        }
        ;
        return null;
    }
    /**
    * Helper method to find Step element by given starting point and y-position
    * and delta-y. Starting point is there to optimize performance a bit as
    * there's no need to iterate through every single step element.
    *
    * @param startFromStep
    *            Starting point element
    * @param startTopY
    * @param startBottomY
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
        let stepCandidate;
        let i = startIndex;
        if (deltay > 0) {
            i++;
            for (; i < this._steps.length; i++) {
                stepCandidate = this._steps[i];
                if (this.isBetween(newY, this.getOffsetTop(stepCandidate), (this.getOffsetTop(stepCandidate) + stepCandidate.offsetHeight))) {
                    return stepCandidate;
                }
            }
        }
        else if (deltay < 0) {
            i--;
            for (; i >= 0; i--) {
                stepCandidate = this._steps[i];
                if (this.isBetween(newY, this.getOffsetTop(stepCandidate), (this.getOffsetTop(stepCandidate) + stepCandidate.offsetHeight))) {
                    return stepCandidate;
                }
            }
        }
        return startFromStep;
    }
    isBetween(v, includeMin, includeMax) {
        return v >= includeMin && v <= includeMax;
    }
    getSteps() {
        return this._steps;
    }
    initStepsYPosition() {
        // set top positions for steps
        // do it in next event loop to make sure all steps are rendered at right positions, taking into account margins
        setTimeout(() => {
            let currentTopPosition = 0;
            this._steps.forEach((step) => {
                if (!step.substep) {
                    step.style.top = currentTopPosition + "px";
                    currentTopPosition += getElementHeightWithMargin(step);
                }
            });
        }, 0);
    }
}
__decorate([
    query('#gantt-container')
], GanttStepsBase.prototype, "_ganttContainer", void 0);
__decorate([
    query('#content')
], GanttStepsBase.prototype, "_content", void 0);
//# sourceMappingURL=gantt-steps-base.js.map