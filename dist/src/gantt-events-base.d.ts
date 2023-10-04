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
    movableSteps: boolean;
    resizableSteps: boolean;
    movableStepsBetweenRows: boolean;
    touching: boolean;
    /** Tap time window defines the maximum time in milliseconds to detect a touch as a tap after touchStart event is triggered. */
    tapTimeWindow: number;
    /** ignoreTouchTimeWindow defines time window in milliseconds to wait before allowing step move/resize/tap to happen for benefit of scrolling. */
    ignoreTouchTimeWindow: number;
    /** ignoreMouseEventsMaxTime defines time in milliseconds to wait after touchEnd and touchCancel to re-enable mouse events.
     * Touch start does not call preventDefault() to allow native scrolling work smoothly. Mouse events that are initiated by touch events as a
     * backup are handled with ignoreMouseEvents boolean flag. */
    ignoreMouseEventsMaxTime: number;
    ignoreMouseEvents: boolean;
    ignoreMouseEventsId: any;
    /** autoScrollStepSize defiens how many pixels to scroll automatically when moving to container edges. */
    autoScrollStepSize: number;
    /** autoScrollAreaSize defines size of the area in pixels that enables automatic scrolling. */
    autoScrollAreaSize: number;
    _eventTargetStep: GanttStepElement;
    touchStartTapTimeoutId: any;
    touchStartTimeoutId: any;
    movePoint: [number, number];
    capturePoint: [number, number];
    capturePointLeftPercentage: string;
    capturePointWidthPercentage: string;
    capturePointLeftPx: number;
    capturePointTopPx: number;
    capturePointTopRelativeToContentPx: number;
    capturePointWidthPx: number;
    resizingFromLeft: boolean;
    insideTapTimeWindow: boolean;
    touchStartTime: number;
    moveElement: HTMLDivElement;
    private isInsideTouchTimeWindow;
    handleTouchStart(event: TouchEvent): void;
    private _handleTouchEnd;
    private _doHandleTouchEnd;
    private _handleTouchMove;
    private _handleTouchCancel;
    handleMouseDown(event: MouseEvent): void;
    _handleMouseUp(event: MouseEvent): void;
    private _handleMouseUpOutside;
    private _handleMouseMove;
    private _handleTap;
    private handleMoveOrResize;
    private handleMouseOrTouchUp;
    private autoScroll;
    private deferredResetIgnoreMouseEvents;
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
    private findStepByAnotherStepEvent;
    private internalMoveOrResizeCompleted;
    private moveStepPosition;
    private updateStepYPosition;
    private updateStepResizingRight;
    private updateStepResizingLeft;
    private _getRelativeCapturePointY;
    private _getRelativeMovePointY;
    private _getRelativeMovePointX;
}
export {};
