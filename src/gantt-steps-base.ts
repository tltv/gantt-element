import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { query } from 'lit-element/decorators.js';
import { GanttStepElement } from './gantt-step-element';
import { GanttSubStepsBase } from './gantt-substeps-base';
import * as ElementUtil from 'tltv-timeline-element/dist/src/util/elementUtil.js';
import 'tltv-timeline-element/dist/src/timeline-element.js';
import { GanttScrollerMixin } from './gantt-scroller-mixin';

export interface GanttStepsInterface {
    _steps: Array<GanttStepElement>;
    _ganttContainer: HTMLDivElement;
    _content: HTMLDivElement;
    getContentWidth(): number;
    getContent(): HTMLDivElement;
    handleSlotchange(e: Event): void;
    findStepElement(startFromStep: GanttStepElement, startTopY: number, startBottomY: number, newY: number, deltay: number): GanttStepElement;
}

export class GanttStepsBase extends GanttScrollerMixin(LitElement) implements GanttStepsInterface {

    _steps: Array<GanttStepElement> = [];
    
    @query('#gantt-container') _ganttContainer: HTMLDivElement;
    @query('#content') _content: HTMLDivElement;

    public getContentWidth() {
        return ElementUtil.getWidth(this.getContent());
    }

    public getContentHeight() {
        return ElementUtil.getHeight(this.getContent());
    }

    public getContent() {
        return this._content;
    }

    /** Returns offset top in pixels relative to content top edge. */
    getOffsetTopContentElement(element: HTMLElement): number {
        if(element instanceof GanttSubStepsBase && element.substep) {
            return this.getOffsetTop(element.owner);
        }
        return this.getOffsetTop(element);
    }

    getOffsetTop(element: HTMLElement): number {
        if ((element instanceof GanttSubStepsBase && element.substep) || element.offsetParent === this._content) {
            return element.offsetTop;
        } else if (element.offsetParent === this) {
            // FireFox reports root element as offsetParent for slotted steps
            return element.offsetTop - this._container.offsetTop;
        } else {
            throw "element.offsetParent should be either content or gantt element";
        }
    }

    /** Returns offset left in pixels relative to content left edge. */
    getOffsetLeftContentElement(element: HTMLElement): number {
        if(element instanceof GanttSubStepsBase && element.substep) {
            return this.getOffsetLeft(element.owner);
        }
        return this.getOffsetLeft(element);
    }

    getOffsetLeft(element: HTMLElement): number {
        if ((element instanceof GanttSubStepsBase && element.substep) || element.offsetParent === this._content) {
            return element.offsetLeft;
        } else if (element.offsetParent === this) {
            // FireFox reports root element as offsetParent for slotted steps
            return element.offsetLeft - this._container.offsetLeft;
        } else {
            throw "element.offsetParent should be either content or gantt element";
        }
    }

    handleSlotchange(e: Event) {
        let slot: HTMLSlotElement = <HTMLSlotElement>e.target;
        this._steps = slot.assignedElements({ flatten: true }).map(element => <GanttStepElement>element);
        this._steps.forEach((step, index) => step.position = index);
        console.log(`GanttElement.handleSlotchange ended with ${this._steps.length} step(s)`);
    }

    findStepIndexAt(topY: number): number {
        let step: GanttStepElement;
        for (let index = 0; index < this._steps.length; index++) {
            step = this._steps[index];
            if (this.isBetween(topY, this.getOffsetTop(step),
                (this.getOffsetTop(step) + step.offsetHeight))) {
                return index;
            }
        };
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
    findStepElement(startFromStep: GanttStepElement, startTopY: number, startBottomY: number, newY: number, deltay: number): GanttStepElement {
        let substep: boolean = startFromStep.substep;
        if (substep) {
            startFromStep = startFromStep.owner;
        }

        if (this.isBetween(newY, startTopY, startBottomY)) {
            console.log("findStepElement returns same: Y " + newY + " between " + startTopY + "-" + startBottomY);
            return startFromStep;
        }
        let startIndex: number = this._steps.indexOf(startFromStep);
        let stepCandidate: GanttStepElement;
        let i: number = startIndex;
        if (deltay > 0) {
            i++;
            for (; i < this._steps.length; i++) {
                stepCandidate = this._steps[i];
                if (this.isBetween(newY, this.getOffsetTop(stepCandidate),
                    (this.getOffsetTop(stepCandidate) + stepCandidate.offsetHeight))) {
                    return stepCandidate;
                }
            }
        } else if (deltay < 0) {
            i--;
            for (; i >= 0; i--) {
                stepCandidate = this._steps[i];
                if (this.isBetween(newY, this.getOffsetTop(stepCandidate),
                    (this.getOffsetTop(stepCandidate) + stepCandidate.offsetHeight))) {
                    return stepCandidate;
                }
            }
        }
        return startFromStep;
    }

    private isBetween(v: number, includeMin: number, includeMax: number): boolean {
        return v >= includeMin && v <= includeMax;
    }

    public getSteps(): Array<GanttStepElement> {
        return this._steps;
    }
}