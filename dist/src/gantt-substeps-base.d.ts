import { GanttStepElement } from './gantt-step-element';
import { GanttStepBase } from './gantt-step-base';
import { TimelineElement } from 'tltv-timeline-element/dist/src/timeline-element.js';
export declare class GanttSubStepsBase extends GanttStepBase {
    substep: boolean;
    owner: GanttStepElement;
    protected _substeps: Array<GanttStepElement>;
    constructor();
    firstUpdated(changedProperties: any): void;
    handleSlotchange(e: Event): void;
    _setupForSubStep(): void;
    calculateSubStepLeft(timeline: TimelineElement): Promise<string>;
    calculateSubStepWidth(timeline: TimelineElement): Promise<string>;
    hasSubSteps(): boolean;
    getSubSteps(): Array<GanttStepElement>;
}
