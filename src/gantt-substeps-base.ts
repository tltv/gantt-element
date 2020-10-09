import { LitElement, property } from 'lit-element';
import { GanttStepElement } from './gantt-step-element';
import { GanttStepBase } from './gantt-step-base';
import * as ElementUtil from 'tltv-timeline-element/src/util/elementUtil';
import { TimelineElement } from 'tltv-timeline-element/src/timeline-element';


export class GanttSubStepsBase extends GanttStepBase {

    @property() public substep: boolean = false;
    @property() public owner: GanttStepElement;

    protected _substeps: Array<GanttStepElement> = [];

    constructor() {
        super();
        if(this.substep = this.parentElement instanceof GanttStepElement) {
            this.classList.add("substep");
            this.owner = this.parentElement;
            this.owner.classList.add("has-sub-steps");
        }
    }

    handleSlotchange(e: Event) {
        let slot: HTMLSlotElement = <HTMLSlotElement>e.target;
        this._substeps = slot.assignedElements({ flatten: true }).map(element => <GanttStepElement>element);
        if(this._substeps.length == 0) {
            this.classList.remove("has-sub-steps");
        }
        this._substeps.forEach((substep, index) => substep.position = index);
        console.log(`GanttSubStepsBase.handleSlotchange ended with ${this._substeps.length} step(s)`);
    }

    async calculateSubStepLeft(timeline: TimelineElement) {
        await this.owner.updateComplete;
        let ownerStepWidth: number = ElementUtil.getWidth(this.owner);
        return timeline.getLeftPositionPercentageStringForDateRange(this.start, ownerStepWidth, this.owner.start, this.owner.end);
    }

    async calculateSubStepWidth(timeline: TimelineElement) {
        await this.owner.updateComplete;
        let range: number = this.owner.end.getTime() - this.owner.start.getTime();
        return timeline.getWidthPercentageStringForDateIntervalForRange(this.end.getTime() - this.start.getTime(), range);
    }

    public hasSubSteps() {
        return this.classList.contains("has-sub-steps");
    }

    public getSubSteps(): Array<GanttStepElement> {
        return this._substeps;
    }
}