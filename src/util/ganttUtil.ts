/**
 * Return x and y coordinates from the given event. Supports mouse and touch event.
 * @param event target Event
 */
export function getPointForEvent(event: Event, container: HTMLDivElement): [number, number] {
    if (event instanceof MouseEvent) {
        return [event.pageX + container.scrollLeft, event.pageY + container.scrollTop];
    } else if (event instanceof TouchEvent) {
        if(event.touches.length > 0) {
            return [event.touches[0].pageX + container.scrollLeft, event.touches[0].pageY + container.scrollTop];
        } else if(event.changedTouches.length > 0) {
            return [event.changedTouches[0].pageX + container.scrollLeft, event.changedTouches[0].pageY + container.scrollTop];
        }
    }
    return null;
}


export function getPageX(event: Event, container: HTMLDivElement) {
    return getPointForEvent(event, container)[0];
}

export function getPageY(event: Event, container: HTMLDivElement) {
    return getPointForEvent(event, container)[1];
}