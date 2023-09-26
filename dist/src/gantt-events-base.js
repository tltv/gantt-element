var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { property } from 'lit/decorators.js';
import { query } from 'lit-element/decorators.js';
import { GanttTimelineMixin } from './gantt-timeline-mixin';
import { GanttStepElement } from './gantt-step-element';
import * as GanttUtil from './util/ganttUtil';
import * as ElementUtil from 'tltv-timeline-element/dist/src/util/elementUtil.js';
import { GanttStepsBase } from './gantt-steps-base';
import { formatInTimeZone } from 'date-fns-tz';
import { getElementHeightWithMargin } from './util/ganttUtil';
export class GanttEventsBase extends GanttTimelineMixin(GanttStepsBase) {
    constructor() {
        super(...arguments);
        this.movableSteps = true;
        this.resizableSteps = true;
        this.movableStepsBetweenRows = true;
        this.touching = false;
        /** Tap time window defines the maximum time in milliseconds to detect a touch as a tap after touchStart event is triggered. */
        this.tapTimeWindow = 400; // ms
        /** ignoreTouchTimeWindow defines time window in milliseconds to wait before allowing step move/resize/tap to happen for benefit of scrolling. */
        this.ignoreTouchTimeWindow = 200; // ms
        /** ignoreMouseEventsMaxTime defines time in milliseconds to wait after touchEnd and touchCancel to re-enable mouse events.
         * Touch start does not call preventDefault() to allow native scrolling work smoothly. Mouse events that are initiated by touch events as a
         * backup are handled with ignoreMouseEvents boolean flag. */
        this.ignoreMouseEventsMaxTime = 1000; // ms
        this.ignoreMouseEvents = false;
        /** autoScrollStepSize defiens how many pixels to scroll automatically when moving to container edges. */
        this.autoScrollStepSize = 10;
        /** autoScrollAreaSize defines size of the area in pixels that enables automatic scrolling. */
        this.autoScrollAreaSize = 5;
        this.insideTapTimeWindow = true;
    }
    isInsideTouchTimeWindow() {
        return this.ignoreTouchTimeWindow > 0 && (Date.now() - this.touchStartTime) <= this.ignoreTouchTimeWindow;
    }
    // touchstart is fired before mousedown
    handleTouchStart(event) {
        if (event.touches.length != 1) {
            return;
        }
        if (this.touchStartTime === Date.now()) {
            return;
        }
        clearTimeout(this.ignoreMouseEventsId);
        this.ignoreMouseEvents = true;
        this.touchStartTime = Date.now();
        this.insideTapTimeWindow = true;
        if (event.target instanceof GanttStepElement) {
            this.setEventCapturePoint(event, event.target);
            this.addEventListener('touchend', this._handleTouchEnd);
            let self = this;
            this.touchStartTimeoutId = setTimeout(() => {
                this.touching = true;
                self.addEventListener('touchmove', self._handleTouchMove);
                self.addEventListener('touchcancel', self._handleTouchCancel);
                self.updateMoveElementFor(self._eventTargetStep);
            }, this.ignoreTouchTimeWindow);
            this.touchStartTapTimeoutId = setTimeout(() => {
                self.insideTapTimeWindow = false;
            }, this.tapTimeWindow);
        }
        else if (event.target === this) {
            this.touching = true;
            this.setEventCapturePoint(event, null);
            this.addEventListener('touchend', this._handleTouchEnd);
            let self = this;
            this.touchStartTapTimeoutId = setTimeout(() => {
                self.insideTapTimeWindow = false;
            }, this.tapTimeWindow);
            this.addEventListener('touchmove', this._handleTouchMove);
            this.addEventListener('touchcancel', this._handleTouchCancel);
        }
    }
    _handleTouchEnd(event) {
        if (!this.touching || this.isInsideTouchTimeWindow()) {
            this._doHandleTouchEnd(() => { });
        }
        else {
            let self = this;
            this._doHandleTouchEnd(() => {
                if (self.insideTapTimeWindow && (!(event.target instanceof GanttStepElement)
                    || self._eventTargetStep === self.findStepByAnotherStepEvent(self._eventTargetStep, event))) {
                    self._handleTap(event);
                }
                else if (!this.isInsideTouchTimeWindow()) {
                    if (self.insideTapTimeWindow && event.target instanceof GanttStepElement) {
                        // this is not done yet at this point because move event handler is not enabled when insideTapTimeWindow=true
                        self.handleMoveOrResize(event);
                    }
                    self.handleMouseOrTouchUp(event);
                }
            });
        }
    }
    _doHandleTouchEnd(operation) {
        clearTimeout(this.touchStartTimeoutId);
        clearTimeout(this.touchStartTapTimeoutId);
        this.removeEventListener('touchend', this._handleTouchEnd);
        this.removeEventListener('touchmove', this._handleTouchMove);
        this.removeEventListener('touchcancel', this._handleTouchCancel);
        try {
            operation();
        }
        finally {
            this.touching = false;
            this.insideTapTimeWindow = true;
            this.deferredResetIgnoreMouseEvents();
            this.clearEventCapturePoint();
            this.hideMoveElement();
        }
    }
    _handleTouchMove(event) {
        if (this.isInsideTouchTimeWindow()) {
            this.touchStartTime = Date.now();
            this._doHandleTouchEnd(() => { });
            event.preventDefault();
            return;
        }
        if (this.handleMoveOrResize(event)) {
            // Prevent the browser from processing emulated mouse events.
            event.preventDefault();
        }
    }
    _handleTouchCancel(event) {
        clearTimeout(this.touchStartTimeoutId);
        clearTimeout(this.touchStartTapTimeoutId);
        this.touching = false;
        this.deferredResetIgnoreMouseEvents();
        this.clearEventCapturePoint();
        this.hideMoveElement();
    }
    handleMouseDown(event) {
        if (this.ignoreMouseEvents) {
            return;
        }
        if (event.target instanceof GanttStepElement) {
            this.setEventCapturePoint(event, event.target);
            this.addEventListener('mouseup', this._handleMouseUp);
            this.addEventListener('mousemove', this._handleMouseMove);
            window.addEventListener('mouseup', this._handleMouseUpOutside);
            window.GanttElementEvents = this;
        }
        else if (event.target === this) {
            this.setEventCapturePoint(event, null);
            this.addEventListener('mouseup', this._handleMouseUp);
            window.addEventListener('mouseup', this._handleMouseUpOutside);
            window.GanttElementEvents = this;
        }
    }
    _handleMouseUp(event) {
        if (this.ignoreMouseEvents) {
            return;
        }
        if (!this.movePoint) {
            this.movePoint = GanttUtil.getPointForEvent(event, this._container);
        }
        if (this.capturePoint && this.movePoint && this.capturePoint[0] == this.movePoint[0] && this.capturePoint[1] == this.movePoint[1]) {
            this._handleTap(event);
        }
        else {
            this.handleMouseOrTouchUp(event);
        }
        this.endMouseEvent();
        event.stopPropagation();
    }
    _handleMouseUpOutside(event) {
        if (!window.GanttElementEvents) {
            console.error("Attempted to end Gantt mouse events without window.GanttElementEvents target gantt element");
            return;
        }
        let target = window.GanttElementEvents;
        target.resetStepPosition(target._eventTargetStep);
        target.hideMoveElement();
        target.endMouseEvent();
    }
    _handleMouseMove(event) {
        if (this.ignoreMouseEvents) {
            return;
        }
        this.handleMoveOrResize(event);
    }
    _handleTap(event) {
        if (event.target instanceof GanttStepElement) {
            this.dispatchEvent(new CustomEvent("ganttStepClick", {
                detail: {
                    uid: event.target.uid,
                    start: formatInTimeZone(event.target.start, this.getTimeZone(), "yyyy-MM-dd'T'HH:mm:ss"),
                    end: formatInTimeZone(event.target.end, this.getTimeZone(), "yyyy-MM-dd'T'HH:mm:ss"),
                    step: event.target,
                    event: event
                }
            }));
        }
        else {
            this.dispatchEvent(new CustomEvent("ganttBackgroundClick", {
                detail: {
                    index: this.findStepIndexAt(GanttUtil.getPageY(event, this._container) - (this._container.offsetTop + this.offsetTop)),
                    date: formatInTimeZone(this._timeline.getDateForLeftPosition(GanttUtil.getPageX(event, this._container) - (this._container.offsetLeft + this.offsetLeft)), this.getTimeZone(), "yyyy-MM-dd'T'HH:mm:ss"),
                    event: event
                }
            }));
        }
        this.hideMoveElement();
    }
    handleMoveOrResize(event) {
        this.movePoint = GanttUtil.getPointForEvent(event, this._container);
        if (!this._eventTargetStep) {
            return false;
        }
        // calculate delta x and y by original position and the current one.
        let deltax = GanttUtil.getPageX(event, this._container) - this.capturePoint[0];
        let deltay = GanttUtil.getPageY(event, this._container) - this.capturePoint[1];
        if (this._eventTargetStep.resizing) {
            if (this.resizingFromLeft) {
                this.updateStepResizingLeft(this._eventTargetStep, deltax);
            }
            else {
                this.updateStepResizingRight(this._eventTargetStep, deltax);
            }
            this.updateMoveElementFor(this._eventTargetStep);
        }
        else if (this._eventTargetStep.moving) {
            if (this.movableSteps) {
                this.moveStepHorizontally(this._eventTargetStep, deltax);
                this.updateMoveElementFor(this._eventTargetStep);
            }
            if (this.movableStepsBetweenRows) {
                this.updateStepYPosition(this._eventTargetStep, deltay);
            }
            this.autoScroll();
        }
        return true;
    }
    handleMouseOrTouchUp(event) {
        if (!this._eventTargetStep) {
            this.hideMoveElement();
            return;
        }
        if (this._eventTargetStep.resizing) {
            console.log("Resizing done");
            this.internalMoveOrResizeCompleted(this._eventTargetStep, null, false, event);
        }
        else if (this._eventTargetStep.moving) {
            console.log("Moving done");
            this.moveCompleted(this._eventTargetStep, GanttUtil.getPageY(event, this._container), event);
        }
        else {
            this.resetStepPosition(this._eventTargetStep);
        }
        this.hideMoveElement();
    }
    autoScroll() {
        if (this._container.scrollTop > 0 && this._getRelativeMovePointY() <= (this._container.scrollTop + this.autoScrollAreaSize)) {
            this._container.scrollTop = Math.max(0, this._container.scrollTop - this.autoScrollStepSize);
            return;
        }
        if (this._getRelativeMovePointY() >= (this._container.clientHeight + this._container.scrollTop - this.autoScrollAreaSize)) {
            this._container.scrollTop = Math.min(this._container.scrollHeight - this._container.clientHeight, this._container.scrollTop + this.autoScrollStepSize);
            return;
        }
        if (this._container.scrollLeft > 0 && this._getRelativeMovePointX() <= (this._container.scrollLeft + this.autoScrollAreaSize)) {
            this._container.scrollLeft = Math.max(0, this._container.scrollLeft - this.autoScrollStepSize);
            return;
        }
        if (this._getRelativeMovePointX() >= (this._container.clientWidth + this._container.scrollLeft - this.autoScrollAreaSize)) {
            this._container.scrollLeft = Math.min(this._container.scrollWidth - this._container.clientWidth, this._container.scrollLeft + this.autoScrollStepSize);
            return;
        }
    }
    deferredResetIgnoreMouseEvents() {
        clearTimeout(this.ignoreMouseEventsId);
        let self = this;
        this.ignoreMouseEventsId = setTimeout(() => self.ignoreMouseEvents = false, this.ignoreMouseEventsMaxTime);
    }
    endMouseEvent() {
        this.clearEventCapturePoint();
        this.removeEventListener('mouseup', this._handleMouseUp);
        this.removeEventListener('mousemove', this._handleMouseMove);
        window.removeEventListener('mouseup', this._handleMouseUpOutside);
        window.GanttElementEvents = null;
    }
    resetStepPosition(step) {
        if (!step) {
            return;
        }
        // step.style.backgroundColor = this.capturePointBgColor;
        step.style.setProperty("left", this.capturePointLeftPercentage);
        step.style.setProperty("width", this.capturePointWidthPercentage);
        this.resetBarYPosition(step);
    }
    resetBarYPosition(step) {
        if (!step.substep) {
            step.style.top = this.calculateNewStepYPosition(step) + "px";
        }
        else {
            // capturePointTopPx may be wrong sometimes, don't know why. TODO check this.getOffsetTop(step) for substeps.
            step.style.top = this.capturePointTopPx + "px";
        }
    }
    calculateNewStepYPosition(step) {
        // calculate current 'top' value based on other steps.
        var rowIndex = this.getSteps().indexOf(step);
        if (rowIndex > 0) {
            return parseInt(this.getSteps()[rowIndex - 1].style.top, 10) + getElementHeightWithMargin(this.getSteps()[rowIndex - 1]);
        }
        else if (this.getSteps().length > 1) {
            return parseInt(this.getSteps()[rowIndex + 1].style.top, 10) - getElementHeightWithMargin(step);
        }
        else {
            return 0;
        }
    }
    setEventCapturePoint(event, step) {
        this._eventTargetStep = step;
        this.capturePoint = GanttUtil.getPointForEvent(event, this._container);
        this.movePoint = null;
        if (!step) {
            return;
        }
        this.capturePointLeftPercentage = step.style.left;
        this.capturePointWidthPercentage = step.style.width;
        this.capturePointTopPx = this.getOffsetTop(step);
        this.capturePointTopRelativeToContentPx = this.getOffsetTopContentElement(step);
        this.capturePointLeftPx = step.offsetLeft;
        this.capturePointWidthPx = step.clientWidth;
        this.movePoint = [this.capturePoint[0], this.capturePoint[1]];
        if (this.detectResizing(step)) {
            step.resizing = true;
            this.resizingFromLeft = this.isResizingLeft(step);
        }
        else {
            step.moving = (this.movableSteps || this.movableStepsBetweenRows) && step.movable;
        }
    }
    clearEventCapturePoint() {
        if (this._eventTargetStep) {
            if (this._eventTargetStep.moving)
                this._eventTargetStep.moving = false;
            if (this._eventTargetStep.resizing)
                this._eventTargetStep.resizing = false;
            this._eventTargetStep = null;
        }
    }
    detectResizing(step) {
        return this.resizableSteps && step.resizable && !step.classList.contains("has-sub-steps") && (this.isResizingLeft(step) || this.isResizingRight(step));
    }
    isResizingLeft(step) {
        if (step.substep) {
            return this.movePoint[0] <= (this.getStepOffsetLeft(step) + GanttStepElement.RESIZE_WIDTH);
        }
        return this.movePoint[0] <= (this.getStepOffsetLeft(step) + GanttStepElement.RESIZE_WIDTH);
    }
    isResizingRight(step) {
        if (step.substep) {
            return this.movePoint[0] >= (this.getStepOffsetLeft(step)
                + step.offsetWidth
                + -GanttStepElement.RESIZE_WIDTH);
        }
        return this.movePoint[0] >= (this.getStepOffsetLeft(step) + step.offsetWidth + -GanttStepElement.RESIZE_WIDTH);
    }
    getStepOffsetLeft(step) {
        if (step.substep) {
            return this.offsetLeft + this.getContent().offsetLeft
                + step.owner.offsetLeft + step.offsetLeft;
        }
        return this.offsetLeft + this._container.offsetLeft + step.offsetLeft;
    }
    moveStepHorizontally(step, deltax) {
        step.style.left = this.capturePointLeftPx + deltax + "px";
    }
    updateMoveElementFor(step) {
        if (!step) {
            this.hideMoveElement();
            return;
        }
        this.moveElement.style.removeProperty('display');
        let styleLeft = step.style.left;
        // use capturePointLeftPx as default
        let left = this.capturePointLeftPx;
        if (styleLeft && styleLeft.length > 2 && styleLeft.endsWith("px")) {
            // if target's 'left' is pixel value like '123px', use that.
            // When target is already moved, then it's using pixel values. If
            // it's not moved yet, it may use percentage value.
            left = parseInt(styleLeft, 10);
        }
        if (step.substep) {
            left += step.owner.offsetLeft;
        }
        left -= this._container.scrollLeft;
        this.moveElement.style.left = left + "px";
        this.moveElement.style.width = step.clientWidth + "px";
        this.moveElement.style.height = this._ganttContainer.clientHeight + "px";
    }
    hideMoveElement() {
        this.moveElement.style.display = "none";
    }
    /*
    * This is called when target step element is moved successfully. Element's
    * CSS attributes 'left' and 'width' are updated (unit in pixels).
    */
    moveCompleted(step, y, event) {
        let deltay = this.movableStepsBetweenRows ? y - this.capturePoint[1] : 0;
        let newPosition = this.findStepByAnotherStepEvent(step, event);
        this.internalMoveOrResizeCompleted(step, newPosition, true, event);
    }
    findStepByAnotherStepEvent(step, event) {
        let y = GanttUtil.getPageY(event, this._container);
        let deltay = this.movableStepsBetweenRows ? y - this.capturePoint[1] : 0;
        return this.findStepElement(step, this.capturePointTopRelativeToContentPx, (this.capturePointTopRelativeToContentPx + getElementHeightWithMargin(step)), y - (this._container.offsetTop + this.offsetTop), deltay);
    }
    internalMoveOrResizeCompleted(step, newPosition, move, event) {
        let newStepUid = step.uid;
        if (newPosition && step !== newPosition) {
            newStepUid = newPosition.uid;
        }
        let startDate = step.start;
        let endDate = step.end;
        if ((move && this.movableSteps) || (!move && this.resizableSteps)) {
            // calculate new start/end dates for moved/resized step
            let left = parseInt(step.style.left, 10);
            if (step.substep) {
                left += step.owner.offsetLeft;
            }
            startDate = this._timeline.getDateForLeftPosition(left);
            left += ElementUtil.getWidth(step);
            endDate = this._timeline.getDateForLeftPosition(left);
            step.start = startDate;
            step.end = endDate;
        }
        if (move) {
            if (this.movableStepsBetweenRows) {
                if (step.substep) {
                    this.resetBarYPosition(step);
                }
                else if (step.uid !== newStepUid) {
                    this.moveStepPosition(step, newStepUid);
                }
                else {
                    this.resetBarYPosition(step);
                }
            }
            this.dispatchEvent(new CustomEvent("ganttStepMove", {
                detail: {
                    uid: step.uid,
                    newUid: newStepUid,
                    start: formatInTimeZone(startDate, this.getTimeZone(), "yyyy-MM-dd'T'HH:mm:ss"),
                    end: formatInTimeZone(endDate, this.getTimeZone(), "yyyy-MM-dd'T'HH:mm:ss"),
                    step: step,
                    event: event
                }
            }));
        }
        else {
            this.dispatchEvent(new CustomEvent("ganttStepResize", {
                detail: {
                    uid: step.uid,
                    start: formatInTimeZone(startDate, this.getTimeZone(), "yyyy-MM-dd'T'HH:mm:ss"),
                    end: formatInTimeZone(endDate, this.getTimeZone(), "yyyy-MM-dd'T'HH:mm:ss"),
                    step: step,
                    event: event
                }
            }));
        }
    }
    moveStepPosition(step, newStepUid) {
        // avoid editing this._steps directly here (let LitElement do it automatically when DOM structure changes)
        let steps = [...this._steps];
        let movedOverStep = steps.find(step => step.uid === newStepUid);
        let movingOverSiblingBelow = steps.indexOf(step) + 1 === steps.indexOf(movedOverStep);
        if (movedOverStep) {
            let insertBeforeStep;
            if (steps.indexOf(movedOverStep) + 1 >= steps.length) {
                // move after the last step
                insertBeforeStep = null;
            }
            else if (movingOverSiblingBelow) {
                insertBeforeStep = steps[steps.indexOf(movedOverStep) + 1];
            }
            else {
                insertBeforeStep = movedOverStep;
            }
            steps.splice(steps.indexOf(step), 1);
            this.removeChild(step);
            this.insertBefore(step, insertBeforeStep);
        }
    }
    updateStepYPosition(step, deltay) {
        let stepHeight = getElementHeightWithMargin(step);
        let offsetY = 0; // offset from content top edge
        if (step.substep) {
            offsetY = parseInt(step.owner.style.top, 10) || 0;
        }
        let stepTop = (parseInt(step.style.top, 10) || 0) + offsetY;
        let maxStepEdgeDeltaUp = stepTop - this._getRelativeCapturePointY();
        let maxStepEdgeDeltaDown = stepHeight + maxStepEdgeDeltaUp;
        if (deltay <= maxStepEdgeDeltaUp) {
            // move up
            if ((stepTop - stepHeight) >= 0) {
                step.style.top = stepTop - stepHeight - offsetY + "px";
            }
        }
        else if (deltay >= maxStepEdgeDeltaDown) {
            // move down
            step.style.top = Math.min(this.getContent().clientHeight - stepHeight, stepTop + stepHeight - offsetY) + "px";
        }
    }
    updateStepResizingRight(step, deltax) {
        let newWidth = this.capturePointWidthPx + deltax;
        if (newWidth >= GanttStepElement.RESIZE_WIDTH) {
            step.style.left = this.capturePointLeftPx + "px";
            step.style.width = newWidth + "px";
        }
    }
    updateStepResizingLeft(step, deltax) {
        let newLeft = this.capturePointLeftPx + deltax;
        let newWidth = this.capturePointWidthPx - deltax;
        if (newWidth >= GanttStepElement.RESIZE_WIDTH) {
            step.style.left = newLeft + "px";
            step.style.width = newWidth + "px";
        }
    }
    _getRelativeCapturePointY() {
        return this.capturePoint[1] - (this._container.offsetTop + this.offsetTop);
    }
    _getRelativeMovePointY() {
        return this.movePoint[1] - (this._container.offsetTop + this.offsetTop);
    }
    _getRelativeMovePointX() {
        return this.movePoint[0] - (this._container.offsetLeft + this.offsetLeft);
    }
}
__decorate([
    property({ reflect: true, type: Boolean })
], GanttEventsBase.prototype, "movableSteps", void 0);
__decorate([
    property({ reflect: true, type: Boolean })
], GanttEventsBase.prototype, "resizableSteps", void 0);
__decorate([
    property({ reflect: true, type: Boolean })
], GanttEventsBase.prototype, "movableStepsBetweenRows", void 0);
__decorate([
    property({ reflect: true, type: Boolean })
], GanttEventsBase.prototype, "touching", void 0);
__decorate([
    query('#mv-el')
], GanttEventsBase.prototype, "moveElement", void 0);
//# sourceMappingURL=gantt-events-base.js.map