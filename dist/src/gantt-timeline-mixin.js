var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { query } from 'lit-element/decorators.js';
export const GanttTimelineMixin = (base) => {
    class GanttTimelineMixin extends base {
        async getTimeline() {
            let continueWhenTimelineReady = function (resolve, isReady, notReady) {
                requestAnimationFrame(() => (isReady()) ? resolve() : notReady(resolve, notReady));
            };
            await new Promise((resolve) => requestAnimationFrame(() => continueWhenTimelineReady(resolve, () => this._timeline, continueWhenTimelineReady)));
            return this._timeline;
        }
        getTimeZone() {
            return this._timeline.getAttribute("timezone");
        }
    }
    __decorate([
        query('#timeline')
    ], GanttTimelineMixin.prototype, "_timeline", void 0);
    return GanttTimelineMixin;
};
//# sourceMappingURL=gantt-timeline-mixin.js.map