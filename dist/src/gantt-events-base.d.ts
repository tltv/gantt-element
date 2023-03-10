import { GanttStepElement } from './gantt-step-element';
import { GanttStepsBase } from './gantt-steps-base';
export interface GanttEventsInterface {
    movableSteps: boolean;
    resizableSteps: boolean;
    movableStepsBetweenRows: boolean;
    touching: boolean;
    moveElement: HTMLDivElement;
    handleTouchStart(event: TouchEvent): void;
    handleMouseDown(event: MouseEvent): void;
}
declare global {
    interface Window {
        GanttElementEvents: GanttEventsBase;
    }
}
declare const GanttEventsBase_base: typeof GanttStepsBase & {
    new (...args: any[]): import("./gantt-timeline-mixin").GanttTimelineInterface;
    prototype: import("./gantt-timeline-mixin").GanttTimelineInterface;
};
export declare class GanttEventsBase extends GanttEventsBase_base implements GanttEventsInterface {
    private static TAP_TIME_WINDOW;
    movableSteps: boolean;
    resizableSteps: boolean;
    movableStepsBetweenRows: boolean;
    touching: boolean;
    _eventTargetStep: GanttStepElement;
    touchStartTimeoutId: any;
    movePoint: [number, number];
    capturePoint: [number, number];
    capturePointLeftPercentage: string;
    capturePointWidthPercentage: string;
    capturePointLeftPx: number;
    capturePointTopPx: number;
    capturePointWidthPx: number;
    resizingFromLeft: boolean;
    insideTapTimeWindow: boolean;
    moveElement: HTMLDivElement;
    handleTouchStart(event: TouchEvent): void;
    private _handleTouchEnd;
    private _handleTouchMove;
    private _handleTouchCancel;
    handleMouseDown(event: MouseEvent): void;
    _handleMouseUp(event: MouseEvent): void;
    private _handleMouseUpOutside;
    private _handleMouseMove;
    private _handleTap;
    private handleMoveOrResize;
    private handleMouseOrTouchUp;
    private endMouseEvent;
    private resetStepPosition;
    private resetBarYPosition;
    private calculateNewStepYPosition;
    private setEventCapturePoint;
    private clearEventCapturePoint;
    private detectResizing;
    private isResizingLeft;
    private isResizingRight;
    private getStepOffsetLeft;
    private moveStepHorizontally;
    private updateMoveElementFor;
    private hideMoveElement;
    private moveCompleted;
    private internalMoveOrResizeCompleted;
    private moveStepPosition;
    getElementHeightWithMargin(div: HTMLElement): number;
    private getMarginByComputedStyle;
    private updateStepYPosition;
    private updateStepResizingRight;
    private updateStepResizingLeft;
    private _getRelativeCapturePointY;
}
export {};
