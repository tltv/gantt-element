import { LitElement, html, css } from 'lit';
import {property, customElement} from 'lit/decorators.js';
import { Resolution } from 'tltv-timeline-element/dist/src/model/Resolution.js';
import * as ElementUtil from 'tltv-timeline-element/dist/src/util/elementUtil.js';
import { GanttStepElement } from './gantt-step-element';
import { GanttEventsBase } from './gantt-events-base';
import { BackgroundGridMixin } from './css-background-grid-mixin';
import {getElementHeightWithMargin} from "./util/ganttUtil";


@customElement('gantt-element')
export class GanttElement extends BackgroundGridMixin(GanttEventsBase) {

  @property({ 
    reflect: true,
    converter: {
      fromAttribute: (value: string, type) => { 
        return <any>Resolution[<any>value];
      },
      toAttribute: (value: Resolution, type) => { 
        return <any>Resolution[value];
      }
    }
  }) 
  public resolution: Resolution = Resolution.Day;
  /* Inclusive start Date (hour accuracy) */
  @property({ 
    reflect: true
  }) 
  public start: string;
  /* Inclusive end Date (hour accuracy) */
  @property({ 
    reflect: true
  }) 
  public end: string;
  @property({ reflect: true}) 
  public zone: string = "Europe/London";
  @property({ reflect: true}) 
  public locale: string = "en-US";
  @property({ reflect: true}) firstDayOfWeek: number = 1; // sunday;
  @property({ reflect: true, type: Boolean  }) twelveHourClock: boolean = false;

  @property({ type: Boolean }) monthRowVisible: boolean = true;
  @property({ type: Boolean }) yearRowVisible: boolean = true;
  @property() monthNames: string[];
  @property() weekdayNames: string[];


  _resizeObserver = new ResizeObserver(() => {
    this.updateSize();
  });

  scrollbarWidth = 18;

  static get styles() {
    return css`
      :host {
        display: block;
        position: relative;

        --grid-line-color: #eee;
        --gantt-element-width: 100%;
        --gantt-element-height: auto;

        width: var(--gantt-element-width);
        height: var(--gantt-element-height);
      }

      #gantt-container {
        position: relative;
        width: 100%;
        user-select: none;
        overflow: hidden;
      }

      #container {
        position: relative;
        width: 100%;
        height: 100%;
        user-select: none;
        overflow-x: hidden;
        overflow-y: auto;
        
        background: var(--grid-line-color);
        /* Webkit (Safari/Chrome 10) */
        background: -webkit-gradient(linear, left top, right top, color-stop(1px, var(--grid-line-color)), color-stop(0, transparent)), -webkit-gradient(linear, left top, left bottom, color-stop(1px, var(--grid-line-color)), color-stop(0, transparent));
        /* Webkit (Chrome 11+) */
        background: -webkit-linear-gradient(var(--grid-line-color) 1px, transparent 0px), -webkit-linear-gradient(0deg, var(--grid-line-color) 1px, transparent 0px);
        /* Mozilla Firefox */
        background: -moz-linear-gradient(var(--grid-line-color) 1px, transparent 0px), -moz-linear-gradient(0deg, var(--grid-line-color) 1px, transparent 0px);
        /* IE10 Consumer Preview */
        background: -ms-linear-gradient(0deg, var(--grid-line-color) 1.1px, transparent 0px), -ms-linear-gradient(90deg, var(--grid-line-color) 1.1px, transparent 0px);
        /* Opera */
        background: -o-linear-gradient(var(--grid-line-color) 1px, transparent 0px), -o-linear-gradient(90deg, var(--grid-line-color) 1px, transparent 0px);
        /* W3C Markup, IE10 Release Preview */
        background: linear-gradient(0deg, var(--grid-line-color) 1px, transparent 0px), linear-gradient(90deg, var(--grid-line-color) 1.1px, transparent 0px);
        
        background-attachment: local;
      }

      #content {
        position: relative;
        overflow: hidden;
      }

      #mv-el {
        position: absolute;
				top: 0;
				box-sizing: border-box;
				z-index: 2;
				background: transparent;
				border-left: 1px dashed #999;
        border-right: 1px dashed #999;
        pointer-events: none;
			}
    `;
  }

  render() {
    return html`
    <div id="gantt-container">
      <timeline-element id="timeline" scrollContainerId="container"
          .directlyInsideScrollContainer="${false}"
          .resolution="${this.resolution}" 
          .startDateTime="${this.start}" 
          .endDateTime="${this.end}"
          .timeZone="${this.zone}"
          .locale="${this.locale}"
          .firstDayOfWeek="${this.firstDayOfWeek}"
          .twelveHourClock="${this.twelveHourClock}"
          .monthRowVisible="${this.monthRowVisible}"
          .yearRowVisible="${this.yearRowVisible}"
          .monthNames="${this.monthNames}"
          .weekdayNames="${this.weekdayNames}">
      </timeline-element>
      <div id="container">
        <div id="content">
          <slot @slotchange=${this.handleSlotchange}></slot>
        </div>
      </div>
      <div id="mv-el" style="display: none;"></div>
    </div>
    `;
  }

  constructor() {
    super();
  }

  firstUpdated(changedProperties: any) {
    this.scrollbarWidth = this.calculateScrollbarWidth();
    this.initGrid(this._container, this._content);
    super.firstUpdated(changedProperties);
    this._resizeObserver.observe(this);
    this.addEventListener('touchstart', this._handleGanttTouchStart, { passive: true });
    this.addEventListener('mousedown', this._handleGanttMouseDown);
    this.dispatchEvent(new Event('gantt-element-ready'));
  }

  updated(changedProperties: any) {
    if (changedProperties.has('resolution') 
    || changedProperties.has('start') 
    || changedProperties.has('end') 
    || changedProperties.has('yearRowVisible') 
    || changedProperties.has('monthRowVisible')) {
      this.timelineUpdated();
    }
    else if (changedProperties.has('resizableSteps'))  {
      this._steps.forEach(step => step.refresh());
    }
    
    super.updated(changedProperties);
  }

  handleSlotchange(e: Event) {
    super.handleSlotchange(e);

    // to make sure that all steps are rendered before we calculate the height - in case that steps have margins around them
    setTimeout(() => {
      this.updateContentHeight();
    });
  }

  public updateSize() {
    let self = this;
    this.getTimeline().then(timeline => {
      timeline.updateWidths();
      self.updateGanttContainerStyle();
      self.updateContainerStyle();
      self.updateContentWidth();
    })
  }

  async timelineUpdated () {
    await this._timeline.updateComplete;
    this.updateContentWidth();
    this._steps.forEach(step => step.refresh());
    this.updateContainerStyle();
  }
  

  public updateContentWidth() {
    if((ElementUtil.getHeight(this.getContent()) > ElementUtil.getHeight(this._container))) {
      this.getContent().style.width = ElementUtil.getWidth(this._timeline) - this.scrollbarWidth + "px";
    } else {
      this.getContent().style.width = ElementUtil.getWidth(this._timeline) + "px";
    }
  }

  public updateContentHeight() {
    let heightOfSteps = this._steps.map(step => getElementHeightWithMargin(step)).reduce((a, b) => a + b);
    console.log(`GanttElement.updateContentHeight calculated ${heightOfSteps}px height for content by steps`);
    this.getContent().style.height = heightOfSteps + 'px';
  }

  public calculateScrollbarWidth() {
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);
  
    const inner = document.createElement('div');
    outer.appendChild(inner);
  
    const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);
  
    outer.parentNode.removeChild(outer);
    return scrollbarWidth;
  
  }

  private convertGanttHeightToContainerHeight() {
    let ganttHeight = this.ownerDocument.defaultView.getComputedStyle(this).getPropertyValue("--gantt-element-height");
    if(ganttHeight && (ganttHeight.trim().endsWith("%") || ganttHeight.trim().endsWith("vm"))) {
      return "100%"; // containers should fill whole available height when gantt height is in percentages
    }
    return ganttHeight;
  }

  private updateGanttContainerStyle() {
    // gantt container height should always match with host element's height
    this._ganttContainer.style.height = this.convertGanttHeightToContainerHeight();
  }

  private updateContainerStyle() {
    // update container height based on timeline height
    let ganttHeight = this.convertGanttHeightToContainerHeight();
    let timelineHeight = ElementUtil.getHeight(this._timeline);
    if(ganttHeight === "auto") {
      this._container.style.height = "auto";
    } else {
      this._container.style.height = "calc(" + ganttHeight + " - " + timelineHeight + "px)";
    }

    if (this.backgroundGridEnabled) {
      this.showGrid();
    } else {
      this.hideGrid();
      return;
    }

    // Container element has a background image that is positioned, sized
    // and repeated to fill the whole container with a nice grid background.

    // Update 'background-size' in container element to match the background
    // grid's cell width and height to match with the timeline and rows.
    // Update also 'background-position' in container to match the first
    // resolution element width in the timeline, IF it's not same as all
    // other resolution element widths.
    let resDivElementCount: number = this._timeline.resolutionDiv.childElementCount;
    if (resDivElementCount == 0) {
      return;
    }
    let secondResolutionBlock: HTMLElement = null;
    let firstResolutionBlockWidth: number = this._timeline.getFirstResolutionElementWidth();
    if (firstResolutionBlockWidth == null) {
      return;
    }
    let secondResolutionBlockWidth: number = null;
    if (resDivElementCount > 2) {
      secondResolutionBlock = <HTMLElement>this._timeline.resolutionDiv.children[1];
      secondResolutionBlockWidth = ElementUtil.getWidth(secondResolutionBlock);
    }

    let contentOverflowingHorizontally: boolean = this.isContentOverflowingHorizontally();

    let adjustBgPosition: boolean = secondResolutionBlockWidth != null
      && firstResolutionBlockWidth !== secondResolutionBlockWidth;
    let gridBlockWidthPx: number = 0.0;
    if (!adjustBgPosition) {
      gridBlockWidthPx = firstResolutionBlockWidth;
    } else {
      gridBlockWidthPx = secondResolutionBlockWidth;
    }

    this.updateContainerBackgroundSize(contentOverflowingHorizontally, gridBlockWidthPx);

    this.updateContainerBackgroundPosition(firstResolutionBlockWidth, contentOverflowingHorizontally, gridBlockWidthPx,
      adjustBgPosition);
  }

  private updateContainerBackgroundSize(contentOverflowingHorizontally: boolean, gridBlockWidthPx: number) {
    let gridBlockWidth: string = null;
    if (contentOverflowingHorizontally || this.useAlwaysPxSizeInBackground) {
      gridBlockWidth = gridBlockWidthPx + "px";
    } else {
      let contentWidth: number = ElementUtil.getWidth(this.getContent());
      gridBlockWidth = (100.0 / contentWidth) * gridBlockWidthPx + "%";
    }

    let gridBlockHeightPx: number = this.getBgGridCellHeight();
    this.setBackgroundSize(gridBlockWidth, gridBlockWidthPx, gridBlockHeightPx);
  }

  private updateContainerBackgroundPosition(firstResolutionBlockWidth: number,
    contentOverflowingHorizontally: boolean, gridBlockWidthPx: number, adjustBgPosition: boolean) {
    if (adjustBgPosition) {
      let realBgPosXPx: number = firstResolutionBlockWidth - 1.0;

      if (this.useAlwaysPxSizeInBackground || contentOverflowingHorizontally) {
        this.setBackgroundPosition(realBgPosXPx + "px", "0px", realBgPosXPx,
          0);
      } else {
        let timelineWidth: number = this._timeline.calculateTimelineWidth();
        let relativeBgAreaWidth: number = timelineWidth - gridBlockWidthPx;
        let bgPosX: number = (100.0 / relativeBgAreaWidth) * realBgPosXPx;
        this.setBackgroundPosition(bgPosX + "%", "0px", realBgPosXPx, 0);
      }
    } else {
      this.setBackgroundPosition("-1px", "0", -1, 0);
    }
  }

  private getBgGridCellHeight(): number {
    let gridBlockHeightPx: number = 0;
    let firstStepIndex: number = 0;
    if (firstStepIndex < this.getSteps().length) {
      let firstStep: GanttStepElement = this.getSteps()[firstStepIndex];
      gridBlockHeightPx = getElementHeightWithMargin(firstStep);
      if ((this.getContentHeight() % gridBlockHeightPx) != 0) {
        // height is not divided evenly for each bar.
        // Can't use background grid with background-size trick.
        gridBlockHeightPx = 0;
      }
    }
    return gridBlockHeightPx;
  }

  /**
  * Return true, if content is overflowing horizontally. This means also that
  * horizontal scroll bar is visible.
  */
  public isContentOverflowingHorizontally(): boolean {
    // state of horizontal overflow is handled by timeline widget
    if (!this._content || !this._container || !this._timeline) {
      return false;
    }
    return this._timeline.isTimelineOverflowingHorizontally();
  }

  /**
  * Return true, if content is overflowing vertically.This means also that
  * vertical scroll bar is visible.
  */
  public isContentOverflowingVertically(): boolean {
    if (!this._content || !this._container) {
      return false;
    }
    return this._container.scrollHeight > this._container.clientHeight;
  }

  private _handleGanttTouchStart(event: TouchEvent) {
    this.handleTouchStart(event);
  }

  private _handleGanttMouseDown(event: MouseEvent) {
    this.handleMouseDown(event);
  }
}