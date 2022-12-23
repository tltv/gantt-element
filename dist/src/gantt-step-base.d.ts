import { LitElement } from 'lit';
export declare class GanttStepBase extends LitElement {
    caption: string;
    resizable: boolean;
    movable: boolean;
    uid: string;
    start: Date;
    end: Date;
    backgroundColor: string;
    stepWidth: string;
    stepLeft: string;
    stepHeight: string;
    position: number;
    resizing: boolean;
    moving: boolean;
    resizableSteps: boolean;
    protected updateLeft(): void;
    protected updateWidth(): void;
    getStepHeight(): number;
}
