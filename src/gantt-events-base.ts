import { LitElement, property } from 'lit-element';
import { query } from 'lit-element/lib/decorators.js';
import { GanttTimelineMixin } from './gantt-timeline-mixin';
import { GanttStepElement } from './gantt-step-element';
import * as GanttUtil from './util/ganttUtil';
import * as ElementUtil from 'tltv-timeline-element/src/util/elementUtil';
import { GanttStepsBase } from './gantt-steps-base';
import { GanttElement } from './gantt-element';

export interface GanttEventsInterface {
  movableSteps: boolean;
  resizableSteps: boolean
  movableStepsBetweenRows: boolean;
  touching: boolean;
  moveElement: HTMLDivElement;
  handleTouchStart(event: TouchEvent): void;
  handleMouseDown(event: MouseEvent): void;
}

export class GanttEventsBase extends GanttTimelineMixin(GanttStepsBase) implements GanttEventsInterface {

  private static TAP_TIME_WINDOW = 400; // milliseconds

  @property() movableSteps: boolean = true;
  @property() resizableSteps: boolean = true;
  @property() movableStepsBetweenRows: boolean = true;
  @property({ reflect: true }) touching: boolean = false;

  _eventTargetStep: GanttStepElement;
  touchStartTimeoutId: any;
  movePoint: [number, number];
  capturePoint: [number, number];
  capturePointLeftPercentage: string;
  capturePointWidthPercentage: string;
  capturePointLeftPx: number;
  capturePointTopPx: number;
  capturePointWidthPx: number;
  resizingFromLeft: boolean;
  insideTapTimeWindow: boolean = true;

  // additional element that appears when moving or resizing
  @query('#mv-el')
  moveElement: HTMLDivElement;

  // touchstart is fired before mousedown
  public handleTouchStart(event: TouchEvent) {
    if (event.touches.length != 1) { return; }

    this.insideTapTimeWindow = true;
    if (event.target instanceof GanttStepElement) {
      this.setEventCapturePoint(event, <GanttStepElement>event.target);
      this.addEventListener('touchend', this._handleTouchEnd);
      this.touchStartTimeoutId = setTimeout(() => {
        this.touching = true;
        this.insideTapTimeWindow = false;
        this.addEventListener('touchmove', this._handleTouchMove);
        this.addEventListener('touchcancel', this._handleTouchCancel);
      }, GanttEventsBase.TAP_TIME_WINDOW);
      event.preventDefault();
    }
  }

  private _handleTouchEnd(event: TouchEvent) {
    clearTimeout(this.touchStartTimeoutId);
    if(this.insideTapTimeWindow) {
      this._handleTap(event);
    } else {
      this.handleMouseOrTouchUp(event);
    }
    this.insideTapTimeWindow = true;
    this.touching = false;
    this.clearEventCapturePoint();
    this.removeEventListener('touchend', this._handleTouchEnd);
    this.removeEventListener('touchmove', this._handleTouchMove);
    this.removeEventListener('touchcancel', this._handleTouchCancel);
  }

  private _handleTouchMove(event: TouchEvent) {
    this.handleMoveOrResize(event);
    // Prevent the browser from processing emulated mouse events.
    event.preventDefault();
  }

  private _handleTouchCancel(event: TouchEvent) {
    clearTimeout(this.touchStartTimeoutId);
    this.touching = false;
    this.clearEventCapturePoint();
    this.hideMoveElement();
  }

  public handleMouseDown(event: MouseEvent) {
    if (event.target instanceof GanttStepElement) {
      this.setEventCapturePoint(event, <GanttStepElement>event.target);
      this.addEventListener('mouseup', this._handleMouseUp);
      this.addEventListener('mousemove', this._handleMouseMove);
    }
  }

  public _handleMouseUp(event: MouseEvent) {
    if(this.capturePoint && this.movePoint && this.capturePoint[0] == this.movePoint[0] && this.capturePoint[1] == this.movePoint[1])  {
      this._handleTap(event);
    } else {
      this.handleMouseOrTouchUp(event);
    }
    this.clearEventCapturePoint();
    this.removeEventListener('mouseup', this._handleMouseUp);
    this.removeEventListener('mousemove', this._handleMouseMove);
  }

  private _handleMouseMove(event: MouseEvent) {
    this.handleMoveOrResize(event);
  }

  private _handleTap(event: Event) {
    // TODO
  }

  private handleMoveOrResize(event: Event) {
    if (!this._eventTargetStep) { return; }

    this.movePoint = GanttUtil.getPointForEvent(event, this._container);

    // calculate delta x and y by original position and the current one.
    let deltax: number = GanttUtil.getPageX(event, this._container) - this.capturePoint[0];
    let deltay: number = GanttUtil.getPageY(event, this._container) - this.capturePoint[1];
    console.log("Position delta x: " + deltax + "px");

    if (this._eventTargetStep.resizing) {
      if (this.resizingFromLeft) {
        this.updateStepResizingLeft(this._eventTargetStep, deltax);
      } else {
        this.updateStepResizingRight(this._eventTargetStep, deltax);
      }
      this.updateMoveElementFor(this._eventTargetStep);

    } else if (this._eventTargetStep.moving) {
      this.moveStepHorizontally(this._eventTargetStep, deltax);
      this.updateMoveElementFor(this._eventTargetStep);
      if (this.movableStepsBetweenRows) {
        this.updateStepYPosition(this._eventTargetStep, deltay);
      }
    }
  }

  private handleMouseOrTouchUp(event: Event) {
    if (!this._eventTargetStep) { return; }

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

  private resetStepPosition(step: GanttStepElement) {
    // step.style.backgroundColor = this.capturePointBgColor;
    step.style.setProperty("left", this.capturePointLeftPercentage);
    step.style.setProperty("width", this.capturePointWidthPercentage);
    this.resetBarYPosition(step);
  }

  private resetBarYPosition(step: GanttStepElement) {
    step.style.top = this.capturePointTopPx + "px";
  }

  private setEventCapturePoint(event: Event, step: GanttStepElement) {
    this._eventTargetStep = step;
    this.capturePointLeftPercentage = step.style.left;
    this.capturePointWidthPercentage = step.style.width;
    this.capturePointTopPx = step.offsetTop;
    this.capturePointLeftPx = step.offsetLeft;
    this.capturePointWidthPx = step.clientWidth;
    this.capturePoint = GanttUtil.getPointForEvent(event, this._container);
    this.movePoint = [this.capturePoint[0], this.capturePoint[1]];

    if (this.detectResizing(step)) {
      step.resizing = true;
      this.resizingFromLeft = this.isResizingLeft(step);
    } else {
      step.moving = this.resizableSteps && step.movable;
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
      return this.movePoint[0] <= (this.getContent().offsetLeft
        + step.owner.offsetLeft + step.offsetLeft + GanttStepElement.RESIZE_WIDTH);
    }
    return this.movePoint[0] <= (this._container.offsetLeft + step.offsetLeft + GanttStepElement.RESIZE_WIDTH);
  }

  private isResizingRight(step: GanttStepElement): boolean {
    if(step.substep) {
      return this.movePoint[0] >= (this.getContent().offsetLeft
                            + step.owner.offsetLeft + step.offsetLeft
                            + step.offsetWidth
                            + -GanttStepElement.RESIZE_WIDTH);
    }
    return this.movePoint[0] >= (this._container.offsetLeft + step.offsetLeft + step.offsetWidth + -GanttStepElement.RESIZE_WIDTH);
  }

  private moveStepHorizontally(step: GanttStepElement, deltax: number) {
    step.style.left = this.capturePointLeftPx + deltax + "px";
  }

  private updateMoveElementFor(step: GanttStepElement) {
    if (step == null) {
      this.hideMoveElement();
    }
    this.moveElement.style.removeProperty('display');

    let styleLeft: string = step.style.left;
    // user capturePointLeftPx as default
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
    this.moveElement.style.left = left + "px";
    this.moveElement.style.width = step.clientWidth + "px";
    this.moveElement.style.height = this._container.clientHeight + "px";
  }

  private hideMoveElement() {
    this.moveElement.style.display = "none";
  }

  /*
  * This is called when target step element is moved successfully. Element's
  * CSS attributes 'left' and 'width' are updated (unit in pixels).
  */
  private moveCompleted(step: GanttStepElement, y: number, event: Event) {
    let deltay: number = y - this.capturePoint[1];
    console.log("Position delta y: " + deltay + "px" + " capture point y is " + this.capturePoint[1]);

    let newPosition: GanttStepElement = this.findStepElement(step, this.capturePointTopPx,
      (this.capturePointTopPx + this.getElementHeightWithMargin(step)), y - this.getContent().offsetTop,
      deltay);
    this.internalMoveOrResizeCompleted(step, newPosition, true, event);
  }

  private internalMoveOrResizeCompleted(step: GanttStepElement, newPosition: GanttStepElement, move: boolean, event: Event) {
    let newStepUid: string = step.uid;
    if (newPosition && step !== newPosition) {
      newStepUid = newPosition.uid;
    }

    let ownerStartDate: Date;
    let ownerEndDate: Date;
    let left: number = parseInt(step.style.left, 10);
    if (step.substep) {
      let ownerLeft: number = step.owner.offsetLeft;
      left += ownerLeft;
      ownerStartDate = this._timeline.getDateForLeftPosition(ownerLeft);
      ownerLeft += ElementUtil.getWidth(step.owner);
      ownerEndDate = this._timeline.getDateForLeftPosition(ownerLeft);
    }
    let startDate: Date = this._timeline.getDateForLeftPosition(left);
    left += ElementUtil.getWidth(step);
    let endDate: Date = this._timeline.getDateForLeftPosition(left);
    step.start = startDate;
    step.end = endDate;

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
          start: startDate,
          end: endDate,
          step: step,
          event: event
        }
      }));
    } else {
      this.dispatchEvent(new CustomEvent("ganttStepResize", {
        detail: {
          uid: step.uid,
          start: startDate,
          end: endDate,
          step: step,
          event: event
        }
      }));
    }
  }

  private moveStepPosition(step: GanttStepElement, newStepUid: string) {
    // avoid editing this._steps directly here (let LitElement do it automatically when DOM structure changes)
    let steps = [...this._steps];
    steps.splice(steps.indexOf(step), 1);
    let insertBeforeStep = steps.find(step => step.uid === newStepUid);
    if (insertBeforeStep) {
      this.removeChild(step);
      this.insertBefore(step, insertBeforeStep);
    }
  }

  private getElementHeightWithMargin(div: HTMLElement): number {
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
    let barHeight: number = this.getElementHeightWithMargin(step);
    let offsetY: number = 0; // offset from content top edge
    if (step.substep) {
      offsetY = parseInt(step.owner.style.top, 10);
    }
    let barTop: number = parseInt(step.style.top, 10) + offsetY;
    let movementFromTop: number = this.capturePointTopPx + deltay;
    let deltaTop: number = movementFromTop - barTop;
    let maxDeltaUp: number = this.capturePoint[1] - this.getContent().offsetTop - this.capturePointTopPx;
    let maxDeltaDown: number = barHeight - maxDeltaUp;

    if (deltaTop <= (-1 * maxDeltaUp)) {
      // move up
      if ((barTop - barHeight) >= 0) {
        step.style.top = barTop - barHeight - offsetY + "px";
      }
    } else if (deltaTop >= maxDeltaDown) {
      // move down
      step.style.top = barTop + barHeight - offsetY + "px";
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

}