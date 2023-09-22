import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { query } from 'lit-element/decorators.js';
import { GanttTimelineMixin } from './gantt-timeline-mixin';
import { GanttStepElement } from './gantt-step-element';
import * as GanttUtil from './util/ganttUtil';
import * as ElementUtil from 'tltv-timeline-element/dist/src/util/elementUtil.js';
import { GanttStepsBase } from './gantt-steps-base';
import { format, formatInTimeZone } from 'date-fns-tz';

export interface GanttEventsInterface {
  movableSteps: boolean;
  resizableSteps: boolean
  movableStepsBetweenRows: boolean;
  touching: boolean;
  moveElement: HTMLDivElement;
  handleTouchStart(event: TouchEvent): void;
  handleMouseDown(event: MouseEvent): void;
}

declare global {
  interface Window { GanttElementEvents: GanttEventsBase; }
}

export class GanttEventsBase extends GanttTimelineMixin(GanttStepsBase) implements GanttEventsInterface {

  @property({ reflect: true, type: Boolean }) movableSteps: boolean = true;
  @property({ reflect: true, type: Boolean }) resizableSteps: boolean = true;
  @property({ reflect: true, type: Boolean }) movableStepsBetweenRows: boolean = true;
  @property({ reflect: true, type: Boolean }) touching: boolean = false;

  /** Tap time window defines the maximum time in milliseconds to detect a touch as a tap after touchStart event is triggered. */
  tapTimeWindow: number = 400; // ms
  /** ignoreTouchTimeWindow defines time window in milliseconds to wait before allowing step move/resize/tap to happen for benefit of scrolling. */
  ignoreTouchTimeWindow: number = 200; // ms
  /** ignoreMouseEventsMaxTime defines time in milliseconds to wait after touchEnd and touchCancel to re-enable mouse events. 
   * Touch start does not call preventDefault() to allow native scrolling work smoothly. Mouse events that are initiated by touch events as a 
   * backup are handled with ignoreMouseEvents boolean flag. */
  ignoreMouseEventsMaxTime: number = 1000; // ms
  ignoreMouseEvents: boolean = false;
  ignoreMouseEventsId: any;

  /** autoScrollStepSize defiens how many pixels to scroll automatically when moving to container edges. */
  autoScrollStepSize: number = 10;
  /** autoScrollAreaSize defines size of the area in pixels that enables automatic scrolling. */
  autoScrollAreaSize: number = 5;

  _eventTargetStep: GanttStepElement;
  touchStartTapTimeoutId: any;
  touchStartTimeoutId: any;
  movePoint: [number, number];
  capturePoint: [number, number];
  capturePointLeftPercentage: string;
  capturePointWidthPercentage: string;
  capturePointLeftPx: number;
  capturePointTopPx: number;
  capturePointTopRelativeToContentPx: number;
  capturePointWidthPx: number;
  resizingFromLeft: boolean;
  insideTapTimeWindow: boolean = true;
  touchStartTime: number;

  // additional element that appears when moving or resizing
  @query('#mv-el')
  moveElement: HTMLDivElement;

  private isInsideTouchTimeWindow(): boolean {
    return this.ignoreTouchTimeWindow > 0 && (Date.now() - this.touchStartTime) <= this.ignoreTouchTimeWindow;
  }

  // touchstart is fired before mousedown
  public handleTouchStart(event: TouchEvent) {
    if (event.touches.length != 1) { return; }
    if(this.touchStartTime === Date.now()) {
      return;
    }
    clearTimeout(this.ignoreMouseEventsId);
    this.ignoreMouseEvents = true;
    this.touchStartTime = Date.now();
    this.insideTapTimeWindow = true;
    if (event.target instanceof GanttStepElement) {
      this.setEventCapturePoint(event, <GanttStepElement>event.target);
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

    } else if(event.target === this) {
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

  private _handleTouchEnd(event: TouchEvent) {
    if(!this.touching || this.isInsideTouchTimeWindow()) {
      this._doHandleTouchEnd(() => {});
    } else {
      let self = this;
      this._doHandleTouchEnd(() => {
        if (self.insideTapTimeWindow && (!(event.target instanceof GanttStepElement)
          || self._eventTargetStep === self.findStepByAnotherStepEvent(self._eventTargetStep, event))) {
            self._handleTap(event);
        } else if(!this.isInsideTouchTimeWindow()) {
          if(self.insideTapTimeWindow && event.target instanceof GanttStepElement) {
            // this is not done yet at this point because move event handler is not enabled when insideTapTimeWindow=true
            self.handleMoveOrResize(event);
          }
          self.handleMouseOrTouchUp(event);
        }
      });
    }
  }

  private _doHandleTouchEnd(operation: Function) {
    clearTimeout(this.touchStartTimeoutId);
    clearTimeout(this.touchStartTapTimeoutId);

    this.removeEventListener('touchend', this._handleTouchEnd);
    this.removeEventListener('touchmove', this._handleTouchMove);
    this.removeEventListener('touchcancel', this._handleTouchCancel);
    try {
      operation();
    } finally {
      this.touching = false;
      this.insideTapTimeWindow = true;
      this.deferredResetIgnoreMouseEvents();
      this.clearEventCapturePoint();
      this.hideMoveElement();
    }
  }

  private _handleTouchMove(event: TouchEvent) {
    if(this.isInsideTouchTimeWindow()) {
      this.touchStartTime = Date.now();
      this._doHandleTouchEnd(() => {});
      event.preventDefault();
      return;
    }
    if(this.handleMoveOrResize(event)) {
      // Prevent the browser from processing emulated mouse events.
      event.preventDefault();
    }
  }

  private _handleTouchCancel(event: TouchEvent) {
    clearTimeout(this.touchStartTimeoutId);
    clearTimeout(this.touchStartTapTimeoutId);
    this.touching = false;
    this.deferredResetIgnoreMouseEvents();
    this.clearEventCapturePoint();
    this.hideMoveElement();
    
  }

  public handleMouseDown(event: MouseEvent) {
    if(this.ignoreMouseEvents) {
       return;
    }
    if (event.target instanceof GanttStepElement) {
      this.setEventCapturePoint(event, <GanttStepElement>event.target);
      this.addEventListener('mouseup', this._handleMouseUp);
      this.addEventListener('mousemove', this._handleMouseMove);
      window.addEventListener('mouseup', this._handleMouseUpOutside);
      window.GanttElementEvents = this;
    } else if(event.target === this) {
      this.setEventCapturePoint(event, null);
      this.addEventListener('mouseup', this._handleMouseUp);
      window.addEventListener('mouseup', this._handleMouseUpOutside);
      window.GanttElementEvents = this;
    }
  }

  public _handleMouseUp(event: MouseEvent) {
    if(this.ignoreMouseEvents) {
      return;
    }
    if(!this.movePoint) {
      this.movePoint = GanttUtil.getPointForEvent(event, this._container);
    }
    if(this.capturePoint && this.movePoint && this.capturePoint[0] == this.movePoint[0] && this.capturePoint[1] == this.movePoint[1])  {
      this._handleTap(event);
    } else {
      this.handleMouseOrTouchUp(event);
    }
    this.endMouseEvent();
    event.stopPropagation();
  }

  private _handleMouseUpOutside(event: MouseEvent) {
    if(!window.GanttElementEvents) {
      console.error("Attempted to end Gantt mouse events without window.GanttElementEvents target gantt element");
      return;
    }
    let target = window.GanttElementEvents;
    target.resetStepPosition(target._eventTargetStep);
    target.hideMoveElement();
    target.endMouseEvent();
  }

  private _handleMouseMove(event: MouseEvent) {
    if(this.ignoreMouseEvents) {
      return;
    }
    this.handleMoveOrResize(event);
  }

  private _handleTap(event: Event) {
    if(event.target instanceof GanttStepElement) {
      this.dispatchEvent(new CustomEvent("ganttStepClick", {
        detail: {
          uid: event.target.uid,
          start: formatInTimeZone(event.target.start, this.getTimeZone(), "yyyy-MM-dd'T'HH:mm:ss"),
          end: formatInTimeZone(event.target.end, this.getTimeZone(), "yyyy-MM-dd'T'HH:mm:ss"),
          step: event.target,
          event: event
        }
      }));
    } else {
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

  private handleMoveOrResize(event: Event): boolean {
    this.movePoint = GanttUtil.getPointForEvent(event, this._container);

    if (!this._eventTargetStep) { return false; }

    // calculate delta x and y by original position and the current one.
    let deltax: number = GanttUtil.getPageX(event, this._container) - this.capturePoint[0];
    let deltay: number = GanttUtil.getPageY(event, this._container) - this.capturePoint[1];
    console.log("Position delta x: %dpx,  y: %dpx", deltax, deltay);

    if (this._eventTargetStep.resizing) {
      if (this.resizingFromLeft) {
        this.updateStepResizingLeft(this._eventTargetStep, deltax);
      } else {
        this.updateStepResizingRight(this._eventTargetStep, deltax);
      }
      this.updateMoveElementFor(this._eventTargetStep);

    } else if (this._eventTargetStep.moving) {
      if(this.movableSteps) {
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

  private handleMouseOrTouchUp(event: Event) {
    if (!this._eventTargetStep) { 
      this.hideMoveElement();
      return; 
    }

    if (this._eventTargetStep.resizing) {
      console.log("Resizing done");
      this.internalMoveOrResizeCompleted(this._eventTargetStep, null, false, event);
    } else if (this._eventTargetStep.moving) {
      console.log("Moving done");
      this.moveCompleted(this._eventTargetStep, GanttUtil.getPageY(event, this._container), event);
    } else {
      this.resetStepPosition(this._eventTargetStep);
    }

    this.hideMoveElement();
  }

  private autoScroll() {
    if(this._container.scrollTop > 0 && this._getRelativeMovePointY() <= (this._container.scrollTop + this.autoScrollAreaSize)) {
      this._container.scrollTop = Math.max(0, this._container.scrollTop - this.autoScrollStepSize);
      return;
    }
    if(this._getRelativeMovePointY() >= (this._container.clientHeight + this._container.scrollTop - this.autoScrollAreaSize)) {
      this._container.scrollTop = Math.min(this._container.scrollHeight - this._container.clientHeight, this._container.scrollTop + this.autoScrollStepSize);
      return;
    }
    if(this._container.scrollLeft > 0 && this._getRelativeMovePointX() <= (this._container.scrollLeft + this.autoScrollAreaSize)) {
      this._container.scrollLeft = Math.max(0, this._container.scrollLeft - this.autoScrollStepSize);
      return;
    }
    if(this._getRelativeMovePointX() >= (this._container.clientWidth + this._container.scrollLeft - this.autoScrollAreaSize)) {
      this._container.scrollLeft = Math.min(this._container.scrollWidth - this._container.clientWidth, this._container.scrollLeft + this.autoScrollStepSize);
      return;
    }
  }

  private deferredResetIgnoreMouseEvents() {
    clearTimeout(this.ignoreMouseEventsId);
    let self = this;
    this.ignoreMouseEventsId = setTimeout(() => self.ignoreMouseEvents = false, this.ignoreMouseEventsMaxTime);
  }

  private endMouseEvent() {
    this.clearEventCapturePoint();
    this.removeEventListener('mouseup', this._handleMouseUp);
    this.removeEventListener('mousemove', this._handleMouseMove);
    window.removeEventListener('mouseup', this._handleMouseUpOutside);
    window.GanttElementEvents = null;
  }

  private resetStepPosition(step: GanttStepElement) {
    if (!step) { 
      return; 
    }
    // step.style.backgroundColor = this.capturePointBgColor;
    step.style.setProperty("left", this.capturePointLeftPercentage);
    step.style.setProperty("width", this.capturePointWidthPercentage);
    this.resetBarYPosition(step);
  }

  private resetBarYPosition(step: GanttStepElement) {
    if(!step.substep) {
      step.style.top = this.calculateNewStepYPosition(step) + "px";
    } else {
      // capturePointTopPx may be wrong sometimes, don't know why. TODO check this.getOffsetTop(step) for substeps.
      step.style.top = this.capturePointTopPx + "px";
    }
  }

  private calculateNewStepYPosition(step: GanttStepElement) {
    // calculate current 'top' value based on other steps.
    var rowIndex = this.getSteps().indexOf(step);
    if(rowIndex > 0) {
      return parseInt(this.getSteps()[rowIndex-1].style.top, 10) + this.getElementHeightWithMargin(this.getSteps()[rowIndex-1]);
    } else if(this.getSteps().length > 1) {
      return parseInt(this.getSteps()[rowIndex+1].style.top, 10) - this.getElementHeightWithMargin(step);
    } else {
      return 0;
    }
  }

  private setEventCapturePoint(event: Event, step: GanttStepElement) {
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
    } else {
      step.moving = (this.movableSteps || this.movableStepsBetweenRows) && step.movable;
    }
  }

  private clearEventCapturePoint() {
    if (this._eventTargetStep) {
      if (this._eventTargetStep.moving) this._eventTargetStep.moving = false;
      if (this._eventTargetStep.resizing) this._eventTargetStep.resizing = false;
      this._eventTargetStep = null;
    }
  }

  private detectResizing(step: GanttStepElement): boolean {
    return this.resizableSteps && step.resizable && !step.classList.contains("has-sub-steps") && (this.isResizingLeft(step) || this.isResizingRight(step));
  }

  private isResizingLeft(step: GanttStepElement): boolean {
    if (step.substep) {
      return this.movePoint[0] <= (this.getStepOffsetLeft(step) + GanttStepElement.RESIZE_WIDTH);
    }
    return this.movePoint[0] <= (this.getStepOffsetLeft(step) + GanttStepElement.RESIZE_WIDTH);
  }

  private isResizingRight(step: GanttStepElement): boolean {
    if(step.substep) {
      return this.movePoint[0] >= (this.getStepOffsetLeft(step)
                            + step.offsetWidth
                            + -GanttStepElement.RESIZE_WIDTH);
    }
    return this.movePoint[0] >= (this.getStepOffsetLeft(step) + step.offsetWidth + -GanttStepElement.RESIZE_WIDTH);
  }

  private getStepOffsetLeft(step: GanttStepElement): number {
    if(step.substep) {
      return this.offsetLeft + this.getContent().offsetLeft
        + step.owner.offsetLeft + step.offsetLeft;
    }
    return this.offsetLeft + this._container.offsetLeft + step.offsetLeft;
  }

  private moveStepHorizontally(step: GanttStepElement, deltax: number) {
    step.style.left = this.capturePointLeftPx + deltax + "px";
  }

  private updateMoveElementFor(step: GanttStepElement) {
    if (!step) {
      this.hideMoveElement();
      return;
    }
    this.moveElement.style.removeProperty('display');

    let styleLeft: string = step.style.left;
    // use capturePointLeftPx as default
    let left: number = this.capturePointLeftPx;
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

  private hideMoveElement() {
    this.moveElement.style.display = "none";
  }

  /*
  * This is called when target step element is moved successfully. Element's
  * CSS attributes 'left' and 'width' are updated (unit in pixels).
  */
  private moveCompleted(step: GanttStepElement, y: number, event: Event) {
    let deltay: number = this.movableStepsBetweenRows ? y - this.capturePoint[1] : 0;
    console.log("Position delta y: " + deltay + "px" + " capture point y is " + this.capturePoint[1]);

    let newPosition: GanttStepElement = this.findStepByAnotherStepEvent(step, event);
    this.internalMoveOrResizeCompleted(step, newPosition, true, event);
  }

  private findStepByAnotherStepEvent(step: GanttStepElement, event: Event) :GanttStepElement {
    let y = GanttUtil.getPageY(event, this._container);
    let deltay: number = this.movableStepsBetweenRows ? y - this.capturePoint[1] : 0;
    return this.findStepElement(step, this.capturePointTopRelativeToContentPx,
      (this.capturePointTopRelativeToContentPx + this.getElementHeightWithMargin(step)), y - (this._container.offsetTop + this.offsetTop),
      deltay);
  }

  private internalMoveOrResizeCompleted(step: GanttStepElement, newPosition: GanttStepElement, move: boolean, event: Event) {
    let newStepUid: string = step.uid;
    if (newPosition && step !== newPosition) {
      newStepUid = newPosition.uid;
    }

    let startDate: Date = step.start;
    let endDate: Date = step.end;
    if((move && this.movableSteps) || (!move && this.resizableSteps)) {
      // calculate new start/end dates for moved/resized step
      let left: number = parseInt(step.style.left, 10);
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
        if(step.substep) {
          this.resetBarYPosition(step);
        } else if (step.uid !== newStepUid) {
          this.moveStepPosition(step, newStepUid);
        } else {
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
    } else {
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

  private moveStepPosition(step: GanttStepElement, newStepUid: string) {
    // avoid editing this._steps directly here (let LitElement do it automatically when DOM structure changes)
    let steps = [...this._steps];
    let movedOverStep = steps.find(step => step.uid === newStepUid);
    let movingOverSiblingBelow = steps.indexOf(step) + 1 === steps.indexOf(movedOverStep);
    if (movedOverStep) {
      let insertBeforeStep;
      if(steps.indexOf(movedOverStep) + 1 >= steps.length) {
        // move after the last step
        insertBeforeStep = null;
      } else if(movingOverSiblingBelow) {
        insertBeforeStep = steps[steps.indexOf(movedOverStep) + 1];
      } else {
        insertBeforeStep = movedOverStep;
      }
      steps.splice(steps.indexOf(step), 1);
      this.removeChild(step);
      this.insertBefore(step, insertBeforeStep);
    }
  }

  public getElementHeightWithMargin(div: HTMLElement): number {
    let height: number = Math.round(ElementUtil.getHeight(div));
    let marginHeight: number = 0;
    marginHeight = this.getMarginByComputedStyle(div);
    return height + Math.round(marginHeight);
  }

  private getMarginByComputedStyle(elem: HTMLElement): number {
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

  private updateStepYPosition(step: GanttStepElement, deltay: number) {
    let stepHeight: number = this.getElementHeightWithMargin(step);
    let offsetY: number = 0; // offset from content top edge
    if (step.substep) {
      offsetY = parseInt(step.owner.style.top, 10) || 0;
    }
    let stepTop: number = (parseInt(step.style.top, 10) || 0) + offsetY;
    let maxStepEdgeDeltaUp: number = stepTop - this._getRelativeCapturePointY();
    let maxStepEdgeDeltaDown: number = stepHeight + maxStepEdgeDeltaUp;

    if (deltay <= maxStepEdgeDeltaUp) {
      // move up
      if ((stepTop - stepHeight) >= 0) {
        step.style.top = stepTop - stepHeight - offsetY + "px";
      }
    } else if (deltay >= maxStepEdgeDeltaDown) {
      // move down
      step.style.top = Math.min(this.getContent().clientHeight - stepHeight, stepTop + stepHeight - offsetY) + "px";
    }
  }

  private updateStepResizingRight(step: GanttStepElement, deltax: number) {
    let newWidth: number = this.capturePointWidthPx + deltax;
    if (newWidth >= GanttStepElement.RESIZE_WIDTH) {
      step.style.left = this.capturePointLeftPx + "px";
      step.style.width = newWidth + "px";
    }
  }

  private updateStepResizingLeft(step: GanttStepElement, deltax: number) {
    let newLeft: number = this.capturePointLeftPx + deltax;
    let newWidth: number = this.capturePointWidthPx - deltax;
    if (newWidth >= GanttStepElement.RESIZE_WIDTH) {
      step.style.left = newLeft + "px";
      step.style.width = newWidth + "px";
    }
  }

  private _getRelativeCapturePointY(): number {
    return this.capturePoint[1] - (this._container.offsetTop + this.offsetTop);
  }

  private _getRelativeMovePointY(): number {
    return this.movePoint[1] - (this._container.offsetTop + this.offsetTop);
  }

  private _getRelativeMovePointX(): number {
    return this.movePoint[0] - (this._container.offsetLeft + this.offsetLeft);
  }
}