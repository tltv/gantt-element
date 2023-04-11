import { Resolution } from 'tltv-timeline-element/dist/src/model/Resolution.js';
import { GanttEventsBase } from './gantt-events-base';
declare const GanttElement_base: typeof GanttEventsBase & {
    new (...args: any[]): import("./css-background-grid-mixin").BackgroundGridInterface;
    prototype: import("./css-background-grid-mixin").BackgroundGridInterface;
};
export declare class GanttElement extends GanttElement_base {
    resolution: Resolution;
    start: string;
    end: string;
    zone: string;
    locale: string;
    firstDayOfWeek: number;
    twelveHourClock: boolean;
    monthRowVisible: boolean;
    yearRowVisible: boolean;
    monthNames: string[];
    weekdayNames: string[];
    _resizeObserver: ResizeObserver;
    scrollbarWidth: number;
    static get styles(): import("lit").CSSResult;
    render(): import("lit-html").TemplateResult<1>;
    constructor();
    firstUpdated(changedProperties: any): void;
    updated(changedProperties: any): void;
    handleSlotchange(e: Event): void;
    updateSize(): void;
    timelineUpdated(): Promise<void>;
    updateContentWidth(): void;
    updateContentHeight(): void;
    calculateScrollbarWidth(): number;
    private convertGanttHeightToContainerHeight;
    private updateGanttContainerStyle;
    private updateContainerStyle;
    private updateContainerBackgroundSize;
    private updateContainerBackgroundPosition;
    private getBgGridCellHeight;
    /**
    * Return true, if content is overflowing horizontally. This means also that
    * horizontal scroll bar is visible.
    */
    isContentOverflowingHorizontally(): boolean;
    /**
    * Return true, if content is overflowing vertically.This means also that
    * vertical scroll bar is visible.
    */
    isContentOverflowingVertically(): boolean;
    private _handleGanttTouchStart;
    private _handleGanttMouseDown;
}
export {};
