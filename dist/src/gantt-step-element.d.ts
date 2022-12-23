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
    /** Synchronize properties from the gantt that are not handled automatically and are required by css, e.g. resize icon. */
    private syncPropertiesFromGantt;
    private recalculateLeft;
    private recalculateWidth;
    refresh(): void;
    getGanttElement(): Promise<GanttElement>;
    private _handleTouchStart;
    private _handleMouseDown;
}
