import { LitElement, html } from 'lit';
import { query } from 'lit-element/decorators.js';
import { TimelineElement } from 'tltv-timeline-element/dist/src/timeline-element.js';

type Constructor<T = object> = {
    new(...args: any[]): T;
    prototype: T;
};

export interface GanttTimelineInterface {
    _timeline: TimelineElement;
    
    getTimeline(): Promise<TimelineElement>;
    getTimeZone(): string;
}

export const GanttTimelineMixin = <T extends Constructor<LitElement>>(
    base: T
): T & Constructor<GanttTimelineInterface> => {
    class GanttTimelineMixin extends base implements GanttTimelineInterface {

        @query('#timeline')
        _timeline: TimelineElement;

        public async getTimeline(): Promise<TimelineElement> {
            let continueWhenTimelineReady = function (resolve: any, isReady: Function, notReady: Function) {
                requestAnimationFrame(() => (isReady()) ? resolve() : notReady(resolve, notReady));
            }
            await new Promise((resolve) => requestAnimationFrame(() => continueWhenTimelineReady(resolve, () => this._timeline, continueWhenTimelineReady)));
            return this._timeline;
        }

        public getTimeZone(): string {
            return this._timeline.getAttribute("timezone");
        }
    }
    return GanttTimelineMixin;
};