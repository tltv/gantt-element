import { LitElement } from 'lit';
declare type Constructor<T = object> = {
    new (...args: any[]): T;
    prototype: T;
};
export interface GanttScrollerInterface {
    _container: HTMLDivElement;
    registerScrollElement(scrollElement: HTMLElement): void;
}
export declare const GanttScrollerMixin: <T extends Constructor<LitElement>>(base: T) => T & Constructor<GanttScrollerInterface>;
export {};
