import * as ElementUtil from 'tltv-timeline-element/dist/src/util/elementUtil.js';

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

export function getElementHeightWithMargin(div: HTMLElement): number {
    let height: number = Math.round(ElementUtil.getHeight(div));
    let marginHeight: number = 0;
    marginHeight = getMarginByComputedStyle(div);
    return height + Math.round(marginHeight);
}

function getMarginByComputedStyle(elem: HTMLElement): number {
    let cs = elem.ownerDocument.defaultView.getComputedStyle(elem);
    let size: number;
    if (cs) {
        size = parseInt(cs.getPropertyValue('margin-top'))
            + parseInt(cs.getPropertyValue('margin-bottom'));
    } else {
        size = 0;
    }
    return size;
}