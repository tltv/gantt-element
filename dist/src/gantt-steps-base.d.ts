import { LitElement } from 'lit';
import { GanttStepElement } from './gantt-step-element';
import 'tltv-timeline-element/dist/src/timeline-element.js';
export interface GanttStepsInterface {
    _steps: Array<GanttStepElement>;
    _ganttContainer: HTMLDivElement;
    _content: HTMLDivElement;
    getContentWidth(): number;
    getContent(): HTMLDivElement;
    handleSlotchange(e: Event): void;
    findStepElement(startFromStep: GanttStepElement, startTopY: number, startBottomY: number, newY: number, deltay: number): GanttStepElement;
}
declare const GanttStepsBase_base: typeof LitElement & {
    new (...args: any[]): import("./gantt-scroller-mixin").GanttScrollerInterface;
    prototype: import("./gantt-scroller-mixin").GanttScrollerInterface;
};
export declare class GanttStepsBase extends GanttStepsBase_base implements GanttStepsInterface {
    _steps: Array<GanttStepElement>;
    _ganttContainer: HTMLDivElement;
    _content: HTMLDivElement;
    getContentWidth(): number;
    getContentHeight(): number;
    getContent(): HTMLDivElement;
    /** Returns offset top in pixels relative to content top edge. */
    getOffsetTopContentElement(element: HTMLElement): number;
    getOffsetTop(element: HTMLElement): number;
    /** Returns offset left in pixels relative to content left edge. */
    getOffsetLeftContentElement(element: HTMLElement): number;
    getOffsetLeft(element: HTMLElement): number;
    handleSlotchange(e: Event): void;
    findStepIndexAt(topY: number): number;
    /**
    * Helper method to find Step element by given starting point and y-position
    * and delta-y. Starting point is there to optimize performance a bit as
    * there's no need to iterate through every single step element.
    *
    * @param startFromStep
    *            Starting point element
    * @param startTopY
    * @param startBottomY
    * @param newY
    *            target y-axis position (relative to scroll container)
    * @param deltay
    *            delta-y relative to starting point element.
    * @return Step element at y-axis position. May be same element as given
    *         startFromBar element.
    */
    findStepElement(startFromStep: GanttStepElement, startTopY: number, startBottomY: number, newY: number, deltay: number): GanttStepElement;
    private isBetween;
    getSteps(): Array<GanttStepElement>;
    private initStepsYPosition;
}
export {};
