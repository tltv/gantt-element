import { LitElement, property } from 'lit-element';
import { query } from 'lit-element/lib/decorators.js';
import { TimelineElement } from 'tltv-timeline-element/src/timeline-element';

type Constructor<T = object> = {
    new(...args: any[]): T;
    prototype: T;
};

export interface GanttTimelineInterface {
    _timeline: TimelineElement;
    
    getTimeline(): Promise<TimelineElement>;
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

    }
    return GanttTimelineMixin;
};