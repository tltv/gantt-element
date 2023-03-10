import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { query } from 'lit-element/decorators.js';
import { GanttElement } from './gantt-element';

type Constructor<T = object> = {
    new(...args: any[]): T;
    prototype: T;
};

export interface GanttScrollerInterface {
    _container: HTMLDivElement;
    registerScrollElement(scrollElement: HTMLElement): void;
}

export const GanttScrollerMixin = <T extends Constructor<LitElement>>(
    base: T
): T & Constructor<GanttScrollerInterface> => {
    class GanttScrollerMixin extends base implements GanttScrollerInterface {

        @query('#container') _container: HTMLDivElement;

        _scrollElement: HTMLElement;
        _handleScrollElementScroll: (this: HTMLElement, ev: Event) => any;
        _handleContainerScroll: (this: HTMLElement, ev: Event) => any;
        _pauseScrollElementScroll: any;
        _pauseContainerScroll: any;

        /**
         * Register additional scroll event handler to the given element. scrollTop from gantt container will be delegated
         * to the given element and vice versa.
         * @param scrollElement Any scrollable element with scrollTop property or null to clear scroll element.
         */
        public registerScrollElement(scrollElement: HTMLElement): void {
            if (!scrollElement) { 
                if(this._scrollElement) {
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
                self._handleScrollElementScroll = () => self._onHandleScrollElementScroll(self);
                self._handleContainerScroll = () => self._onHandleContainerScroll(self);
                scrollElement.addEventListener('scroll', self._handleScrollElementScroll);
                container.addEventListener('scroll', self._handleContainerScroll);
            });
        }

        _onHandleScrollElementScroll(ganttElement: GanttScrollerMixin) {
            let self = this;
            clearTimeout(self._pauseContainerScroll);
            if(ganttElement._scrollElement.scrollTop == ganttElement._container.scrollTop) {
                return;
            }
            self._container.removeEventListener('scroll', self._handleContainerScroll);
            requestAnimationFrame(() => {
                ganttElement._container.scrollTop = ganttElement._scrollElement.scrollTop > 0 ? ganttElement._scrollElement.scrollTop : 0;
            });
            self._pauseContainerScroll = setTimeout(() => self._container.addEventListener('scroll', self._handleContainerScroll), 50);
        }

        _onHandleContainerScroll(ganttElement: GanttScrollerMixin) {
            let self = this;
            clearTimeout(self._pauseScrollElementScroll);
            if(ganttElement._scrollElement.scrollTop == ganttElement._container.scrollTop) {
                return;
            }
            self._scrollElement.removeEventListener('scroll', self._handleScrollElementScroll);
            requestAnimationFrame(() => {
                ganttElement._scrollElement.scrollTop = ganttElement._container.scrollTop > 0 ? ganttElement._container.scrollTop : 0;
            });
            self._pauseScrollElementScroll = setTimeout(() => self._scrollElement.addEventListener('scroll', self._handleScrollElementScroll), 50);
        }
   
    }
    return GanttScrollerMixin;
};