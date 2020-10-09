import { LitElement, property } from 'lit-element';
import { GanttStepElement } from './gantt-step-element';

export class GanttSubStepsBase extends LitElement {

    @property() public substep: boolean = false;
    @property() public owner: GanttStepElement;

    _substeps: Array<GanttStepElement>;

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
}