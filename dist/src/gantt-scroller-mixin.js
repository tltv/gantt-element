var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { query } from 'lit-element/decorators.js';
export const GanttScrollerMixin = (base) => {
    class GanttScrollerMixin extends base {
        /**
         * Register additional scroll event handler to the given element. scrollTop from gantt container will be delegated
         * to the given element and vice versa.
         * @param scrollElement Any scrollable element with scrollTop property or null to clear scroll element.
         */
        registerScrollElement(scrollElement) {
            if (!scrollElement) {
                if (this._scrollElement) {
                    this._scrollElement.removeEventListener('scroll', this._handleScrollElementScroll);
                    this._container.removeEventListener('scroll', this._handleContainerScroll);
                }
                this._scrollElement = scrollElement;
                return;
            }
            this._scrollElement = scrollElement;
            let self = this;
            this.updateComplete.then(() => {
                let container = self._container;
                self._skipScrollElementScroll = false;
                self._skipContainerScroll = false;
                self._handleScrollElementScroll = () => self._onHandleScrollElementScroll(self);
                self._handleContainerScroll = () => self._onHandleContainerScroll(self);
                scrollElement.addEventListener('scroll', self._handleScrollElementScroll);
                container.addEventListener('scroll', self._handleContainerScroll);
            });
        }
        _onHandleScrollElementScroll(ganttElement) {
            if (ganttElement._skipScrollElementScroll) {
                return;
            }
            if (ganttElement._scrollElement.scrollTop == ganttElement._container.scrollTop) {
                return;
            }
            requestAnimationFrame(() => {
                if (ganttElement._skipScrollElementScroll) {
                    return;
                }
                ganttElement._skipContainerScroll = true;
                ganttElement._container.scrollTop = ganttElement._scrollElement.scrollTop > 0 ? ganttElement._scrollElement.scrollTop : 0;
                ganttElement._skipContainerScroll = false;
            });
        }
        _onHandleContainerScroll(ganttElement) {
            if (ganttElement._skipContainerScroll) {
                return;
            }
            if (ganttElement._scrollElement.scrollTop == ganttElement._container.scrollTop) {
                return;
            }
            requestAnimationFrame(() => {
                if (ganttElement._skipContainerScroll) {
                    return;
                }
                ganttElement._skipScrollElementScroll = true;
                ganttElement._scrollElement.scrollTop = ganttElement._container.scrollTop > 0 ? ganttElement._container.scrollTop : 0;
                ganttElement._skipScrollElementScroll = false;
            });
        }
    }
    __decorate([
        query('#container')
    ], GanttScrollerMixin.prototype, "_container", void 0);
    return GanttScrollerMixin;
};
//# sourceMappingURL=gantt-scroller-mixin.js.map