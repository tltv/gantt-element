var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { property } from 'lit/decorators.js';
import { GanttStepElement } from './gantt-step-element';
import { GanttStepBase } from './gantt-step-base';
import * as ElementUtil from 'tltv-timeline-element/dist/src/util/elementUtil.js';
export class GanttSubStepsBase extends GanttStepBase {
    constructor() {
        super();
        this.substep = false;
        this._substeps = [];
    }
    firstUpdated(changedProperties) {
        super.firstUpdated(changedProperties);
        this._setupForSubStep();
    }
    handleSlotchange(e) {
        // handleSlotchange is called before substep's firstUpdated
        let slot = e.target;
        this._substeps = slot.assignedElements({ flatten: true })
            .filter(element => element instanceof GanttStepElement)
            .map(element => element);
        this._substeps.forEach((substep, index) => {
            substep._setupForSubStep();
            substep.position = index;
        });
        if (!this._substeps.length) {
            this._setupForSubStep();
        }
        console.log(`GanttSubStepsBase.handleSlotchange ended with ${this._substeps.length} step(s)`);
    }
    _setupForSubStep() {
        if (this.substep = this.parentElement instanceof GanttStepElement) {
            this.classList.add("substep");
            this.owner = this.parentElement;
            this.owner.classList.add("has-sub-steps");
        }
        else {
            this.classList.remove("has-sub-steps");
        }
    }
    async calculateSubStepLeft(timeline) {
        await this.owner.updateComplete;
        let ownerStepWidth = ElementUtil.getWidth(this.owner);
        return timeline.getLeftPositionPercentageStringForDateRange(this.start, ownerStepWidth, this.owner.start, this.owner.end);
    }
    async calculateSubStepWidth(timeline) {
        await this.owner.updateComplete;
        let range = this.owner.end.getTime() - this.owner.start.getTime();
        return timeline.getWidthPercentageStringForDateIntervalForRange(this.end.getTime() - this.start.getTime(), range);
    }
    hasSubSteps() {
        return this.classList.contains("has-sub-steps");
    }
    getSubSteps() {
        return this._substeps;
    }
}
__decorate([
    property()
], GanttSubStepsBase.prototype, "substep", void 0);
__decorate([
    property()
], GanttSubStepsBase.prototype, "owner", void 0);
//# sourceMappingURL=gantt-substeps-base.js.map