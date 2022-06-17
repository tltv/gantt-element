import { GanttElement } from './gantt-element';
import { GanttSubStepsBase } from './gantt-substeps-base';
export declare class GanttStepElement extends GanttSubStepsBase {
    static RESIZE_WIDTH: number;
    static get styles(): import("lit").CSSResult;
    constructor();
    firstUpdated(changedProperties: any): void;
    render(): import("lit-html").TemplateResult<1>;
    update(changedProperties: any): void;
    private initUidByPosition;
    ownerUidUpdated(): Promise<void>;
    private updateUid;
    private recalculateLeft;
    private recalculateWidth;
    refresh(): void;
    getGanttElement(): GanttElement;
    private _handleTouchStart;
    private _handleMouseDown;
}
