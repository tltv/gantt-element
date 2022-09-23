import { LitElement } from 'lit';
import { GanttStepElement } from './gantt-step-element';
import 'tltv-timeline-element/dist/src/timeline-element.js';
export interface GanttStepsInterface {
    _steps: Array<GanttStepElement>;
    _ganttContainer: HTMLDivElement;
    _container: HTMLDivElement;
    _content: HTMLDivElement;
    getContentWidth(): number;
    getContent(): HTMLDivElement;
    handleSlotchange(e: Event): void;
    findStepElement(startFromStep: GanttStepElement, startTopY: number, startBottomY: number, newY: number, deltay: number): GanttStepElement;
}
export declare class GanttStepsBase extends LitElement implements GanttStepsInterface {
    _steps: Array<GanttStepElement>;
    _ganttContainer: HTMLDivElement;
    _container: HTMLDivElement;
    _content: HTMLDivElement;
    getContentWidth(): number;
    getContentHeight(): number;
    getContent(): HTMLDivElement;
    getOffsetTopContentElement(element: HTMLElement): number;
    getOffsetLeftContentElement(element: HTMLElement): number;
    handleSlotchange(e: Event): void;
    findStepIndexAt(topY: number): number;
    /**
    * Helper method to find Step element by given starting point and y-position
    * and delta-y. Starting point is there to optimize performance a bit as
    * there's no need to iterate through every single step element.
    *
    * @param startFromStep
    *            Starting point element
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
}
