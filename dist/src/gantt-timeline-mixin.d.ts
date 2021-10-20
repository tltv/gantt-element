import { LitElement } from 'lit-element';
import { TimelineElement } from 'tltv-timeline-element/dist/src/timeline-element.js';
declare type Constructor<T = object> = {
    new (...args: any[]): T;
    prototype: T;
};
export interface GanttTimelineInterface {
    _timeline: TimelineElement;
    getTimeline(): Promise<TimelineElement>;
}
export declare const GanttTimelineMixin: <T extends Constructor<LitElement>>(base: T) => T & Constructor<GanttTimelineInterface>;
export {};
