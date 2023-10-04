/**
 * Return x and y coordinates from the given event. Supports mouse and touch event.
 * @param event target Event
 */
export declare function getPointForEvent(event: Event, container: HTMLDivElement): [number, number];
export declare function getPageX(event: Event, container: HTMLDivElement): number;
export declare function getPageY(event: Event, container: HTMLDivElement): number;
export declare function getElementHeightWithMargin(div: HTMLElement): number;
