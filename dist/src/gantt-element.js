var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, css, property, customElement } from 'lit-element';
import { Resolution } from 'tltv-timeline-element/dist/src/model/Resolution.js';
import * as ElementUtil from 'tltv-timeline-element/dist/src/util/elementUtil.js';
import './gantt-step-element.ts';
import { GanttEventsBase } from './gantt-events-base';
import { BackgroundGridMixin } from './css-background-grid-mixin';
let GanttElement = class GanttElement extends BackgroundGridMixin(GanttEventsBase) {
    constructor() {
        super();
        this.resolution = Resolution.Day;
        this.zone = "Europe/London";
        this.locale = "en-US";
        this.firstDayOfWeek = 1; // sunday;
        this.twelveHourClock = false;
        this._resizeObserver = new ResizeObserver(() => {
            this.updateSize();
        });
        this.scrollbarWidth = 18; // pixels //TODO calculate scrollbar size
    }
    static get styles() {
        return css `
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
        return html `
    <div id="gantt-container">
      <timeline-element id="timeline" scrollContainerId="container"
          .directlyInsideScrollContainer="${false}"
          .resolution="${this.resolution}" 
          .startDateTime="${this.start}" 
          .endDateTime="${this.end}"
          .timeZone="${this.zone}"
          .locale="${this.locale}"
          .firstDayOfWeek="${this.firstDayOfWeek}"
          .twelveHourClock="${this.twelveHourClock}">
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
    firstUpdated(changedProperties) {
        this.initGrid(this._container, this._content);
        super.firstUpdated(changedProperties);
        this._resizeObserver.observe(this);
    }
    updated(changedProperties) {
        if (changedProperties.has('resolution') || changedProperties.has('start') || changedProperties.has('end')) {
            this.timelineUpdated();
        }
        super.updated(changedProperties);
    }
    handleSlotchange(e) {
        super.handleSlotchange(e);
        this.updateContentHeight();
    }
    updateSize() {
        this._timeline.updateWidths();
        this.updateGanttContainerStyle();
        this.updateContainerStyle();
        this.updateContentWidth();
    }
    async timelineUpdated() {
        await this._timeline.updateComplete;
        this.updateContentWidth();
        this._steps.forEach(step => step.refresh());
        this.updateContainerStyle();
    }
    updateContentWidth() {
        if ((ElementUtil.getHeight(this.getContent()) > ElementUtil.getHeight(this._container))) {
            this.getContent().style.width = ElementUtil.getWidth(this._timeline) - this.scrollbarWidth + "px";
        }
        else {
            this.getContent().style.width = ElementUtil.getWidth(this._timeline) + "px";
        }
    }
    updateContentHeight() {
        let heightOfSteps = this._steps.map(step => step.getStepHeight()).reduce((a, b) => a + b);
        console.log(`GanttElement.updateContentHeight calculated ${heightOfSteps}px height for content by steps`);
        this.getContent().style.height = heightOfSteps + 'px';
    }
    convertGanttHeightToContainerHeight() {
        let ganttHeight = this.ownerDocument.defaultView.getComputedStyle(this).getPropertyValue("--gantt-element-height");
        if (ganttHeight && (ganttHeight.trim().endsWith("%") || ganttHeight.trim().endsWith("vm"))) {
            return "100%"; // containers should fill whole available height when gantt height is in percentages
        }
        return ganttHeight;
    }
    updateGanttContainerStyle() {
        // gantt container height should always match with host element's height
        this._ganttContainer.style.height = this.convertGanttHeightToContainerHeight();
    }
    updateContainerStyle() {
        // update container height based on timeline height
        let ganttHeight = this.convertGanttHeightToContainerHeight();
        let timelineHeight = ElementUtil.getHeight(this._timeline);
        if (ganttHeight === "auto") {
            this._container.style.height = "auto";
        }
        else {
            this._container.style.height = "calc(" + ganttHeight + " - " + timelineHeight + "px)";
        }
        if (this.backgroundGridEnabled) {
            this.showGrid();
        }
        else {
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
        let resDivElementCount = this._timeline.resolutionDiv.childElementCount;
        if (resDivElementCount == 0) {
            return;
        }
        let secondResolutionBlock = null;
        let firstResolutionBlockWidth = this._timeline.getFirstResolutionElementWidth();
        if (firstResolutionBlockWidth == null) {
            return;
        }
        let secondResolutionBlockWidth = null;
        if (resDivElementCount > 2) {
            secondResolutionBlock = this._timeline.resolutionDiv.children[1];
            secondResolutionBlockWidth = ElementUtil.getWidth(secondResolutionBlock);
        }
        let contentOverflowingHorizontally = this.isContentOverflowingHorizontally();
        let adjustBgPosition = secondResolutionBlockWidth != null
            && firstResolutionBlockWidth !== secondResolutionBlockWidth;
        let gridBlockWidthPx = 0.0;
        if (!adjustBgPosition) {
            gridBlockWidthPx = firstResolutionBlockWidth;
        }
        else {
            gridBlockWidthPx = secondResolutionBlockWidth;
        }
        this.updateContainerBackgroundSize(contentOverflowingHorizontally, gridBlockWidthPx);
        this.updateContainerBackgroundPosition(firstResolutionBlockWidth, contentOverflowingHorizontally, gridBlockWidthPx, adjustBgPosition);
    }
    updateContainerBackgroundSize(contentOverflowingHorizontally, gridBlockWidthPx) {
        let gridBlockWidth = null;
        if (contentOverflowingHorizontally || this.useAlwaysPxSizeInBackground) {
            gridBlockWidth = gridBlockWidthPx + "px";
        }
        else {
            let contentWidth = ElementUtil.getWidth(this.getContent());
            gridBlockWidth = (100.0 / contentWidth) * gridBlockWidthPx + "%";
        }
        let gridBlockHeightPx = this.getBgGridCellHeight();
        this.setBackgroundSize(gridBlockWidth, gridBlockWidthPx, gridBlockHeightPx);
    }
    updateContainerBackgroundPosition(firstResolutionBlockWidth, contentOverflowingHorizontally, gridBlockWidthPx, adjustBgPosition) {
        if (adjustBgPosition) {
            let realBgPosXPx = firstResolutionBlockWidth - 1.0;
            if (this.useAlwaysPxSizeInBackground || contentOverflowingHorizontally) {
                this.setBackgroundPosition(realBgPosXPx + "px", "0px", realBgPosXPx, 0);
            }
            else {
                let timelineWidth = this._timeline.calculateTimelineWidth();
                let relativeBgAreaWidth = timelineWidth - gridBlockWidthPx;
                let bgPosX = (100.0 / relativeBgAreaWidth) * realBgPosXPx;
                this.setBackgroundPosition(bgPosX + "%", "0px", realBgPosXPx, 0);
            }
        }
        else {
            this.setBackgroundPosition("-1px", "0", -1, 0);
        }
    }
    getBgGridCellHeight() {
        let gridBlockHeightPx = 0;
        let firstStepIndex = 0;
        if (firstStepIndex < this.getSteps().length) {
            let firstStep = this.getSteps()[firstStepIndex];
            gridBlockHeightPx = this.getElementHeightWithMargin(firstStep);
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
    isContentOverflowingHorizontally() {
        // state of horizontal overflow is handled by timeline widget
        if (!this._content || !this._container || !this._timeline) {
            return false;
        }
        return this._timeline.isTimelineOverflowingHorizontally();
    }
};
__decorate([
    property({
        reflect: true,
        converter: {
            fromAttribute: (value, type) => {
                return Resolution[value];
            },
            toAttribute: (value, type) => {
                return Resolution[value];
            }
        }
    })
], GanttElement.prototype, "resolution", void 0);
__decorate([
    property({
        reflect: true
    })
], GanttElement.prototype, "start", void 0);
__decorate([
    property({
        reflect: true
    })
], GanttElement.prototype, "end", void 0);
__decorate([
    property({ reflect: true })
], GanttElement.prototype, "zone", void 0);
__decorate([
    property({ reflect: true })
], GanttElement.prototype, "locale", void 0);
__decorate([
    property({ reflect: true })
], GanttElement.prototype, "firstDayOfWeek", void 0);
__decorate([
    property({ reflect: true })
], GanttElement.prototype, "twelveHourClock", void 0);
GanttElement = __decorate([
    customElement('gantt-element')
], GanttElement);
export { GanttElement };
//# sourceMappingURL=gantt-element.js.map