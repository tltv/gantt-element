import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { GanttStepElement } from './gantt-step-element';
import { GanttStepBase } from './gantt-step-base';
import * as ElementUtil from 'tltv-timeline-element/dist/src/util/elementUtil.js';
import { TimelineElement } from 'tltv-timeline-element/dist/src/timeline-element.js';


export class GanttSubStepsBase extends GanttStepBase {

    @property() public substep: boolean = false;
    @property() public owner: GanttStepElement;

    protected _substeps: Array<GanttStepElement> = [];

    constructor() {
        super();
    }

    firstUpdated(changedProperties: any) {
        super.firstUpdated(changedProperties);
        this._setupForSubStep();
    }

    handleSlotchange(e: Event) {
        // handleSlotchange is called before substep's firstUpdated
        let slot: HTMLSlotElement = <HTMLSlotElement>e.target;
        this._substeps = slot.assignedElements({ flatten: true }).map(element => <GanttStepElement>element);
        this._substeps.forEach((substep, index) => {
            substep._setupForSubStep();
            substep.position = index;
        });
        if(!this._substeps.length) {
            this._setupForSubStep();
        }
        console.log(`GanttSubStepsBase.handleSlotchange ended with ${this._substeps.length} step(s)`);
    }

    _setupForSubStep() {
        if(this.substep = this.parentElement instanceof GanttStepElement) {
            this.classList.add("substep");
            this.owner = this.parentElement;
            this.owner.classList.add("has-sub-steps");
        } else {
            this.classList.remove("has-sub-steps");
        }
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