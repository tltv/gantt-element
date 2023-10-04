var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { GanttSubStepsBase } from './gantt-substeps-base';
export let GanttStepElement = class GanttStepElement extends GanttSubStepsBase {
    static get styles() {
        return css `
        :host {
            position: absolute;
            height: var(--gantt-step-height);
            z-index: 1;
            -webkit-touch-callout: none;
            touch-action: pan-y;
            -ms-touch-action: pan-y;
            -webkit-border-radius: 3px;
            -moz-border-radius: 3px;
            border-radius: 3px;
            box-shadow: 2px 0 3px rgba(0, 0, 0, 0.14), 0 0 0 1px rgba(0, 0, 0, 0.07);
            background-color: var(--gantt-step-background-color);
            left: var(--gantt-step-left);
            width: var(--gantt-step-width);
            user-select: none;
        }

        :host([moving]) {
            cursor: move;
        }

        :host([resizing]) {
            cursor: e-resize;
        }

        .step-label {
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            margin: 3px;
        }
        :host(.has-sub-steps:hover) > .step-label {
            width: 100%;
            background-color: rgba(246, 255, 99, 0.3);
            border-radius: 6px;
            transform: translate(0,-22px);
        }
        :host(.has-sub-steps:first-child:hover) {
            z-index: 2;
        }
        :host(.has-sub-steps:first-child:hover) > .step-label {
            transform: translate(0, 22px);
        }
        :host(.has-sub-steps:hover) > .step-label:hover {
            cursor: move;
        }
        :host(.has-sub-steps) {
            background-color: rgba(246, 255, 99, 0.3) !important;
        }
        :host(.has-sub-steps) > .step-label {
            position: absolute;
            max-width: 100%;
        }

        :host([resizablesteps][resizable]:not(.has-sub-steps)):before,
        :host([resizablesteps]) ::slotted(gantt-step-element[resizable]):before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 10px;
            height: 100%;
            cursor: e-resize;
          }
          :host([resizablesteps][resizable]:not(.has-sub-steps)):after,
          :host([resizablesteps]) ::slotted(gantt-step-element[resizable]):after {
              content: "";
              position: absolute;
              right: 0;
              top: 0;
              width: 10px;
              height: 100%;
              cursor: e-resize;
          }
          
        :host(.step.invalid) {
            visibility: hidden;
        }
        `;
    }
    constructor() {
        super();
    }
    firstUpdated(changedProperties) {
        super.firstUpdated(changedProperties);
        this.classList.add("step");
        this.style.visibility = 'hidden';
        this.style.setProperty('--gantt-step-height', this.stepHeight);
        this.addEventListener('touchstart', this._handleTouchStart);
        this.addEventListener('mousedown', this._handleMouseDown);
    }
    render() {
        this.style.setProperty('--gantt-step-background-color', this.backgroundColor);
        this.style.setProperty('--gantt-step-height', this.stepHeight);
        return html `
        <div class="step-label" part="step-label">${this.caption}</div>
        <slot @slotchange=${this.handleSlotchange}></slot>
        `;
    }
    update(changedProperties) {
        if (changedProperties.has("start") || changedProperties.has("end")) {
            this.recalculateLeft();
            this.recalculateWidth();
        }
        if (changedProperties.has('position')) {
            this.initUidByPosition();
        }
        super.update(changedProperties);
    }
    initUidByPosition() {
        if (this.uid) {
            return;
        }
        if (this.substep) {
            if (!this.owner.uid) {
                this.ownerUidUpdated();
                return;
            }
        }
        this.updateUid();
    }
    async ownerUidUpdated() {
        await this.owner.updateComplete;
        this.uid = `${this.owner.uid}-${this.position}`;
    }
    updateUid() {
        this.uid = (this.substep) ? `${this.owner.uid}-${this.position}` : `${this.position}`;
    }
    /** Synchronize properties from the gantt that are not handled automatically and are required by css, e.g. resize icon. */
    syncPropertiesFromGantt() {
        this.getGanttElement().then(gantt => {
            this.resizableSteps = gantt.resizableSteps;
        });
    }
    recalculateLeft() {
        this.getGanttElement().then(gantt => gantt.getTimeline()
            .then(timeline => {
            if (this.substep) {
                this.calculateSubStepLeft(timeline).then(newLeft => {
                    this.stepLeft = newLeft;
                    this.updateLeft();
                });
            }
            else {
                this.stepLeft = timeline.getLeftPositionPercentageStringForDate(this.start, gantt.getContentWidth());
                this._substeps.forEach(substep => substep.refresh());
                this.updateLeft();
            }
        }));
    }
    recalculateWidth() {
        this.getGanttElement().then(gantt => gantt.getTimeline()
            .then(timeline => {
            if (this.substep) {
                this.calculateSubStepWidth(timeline).then(newWidth => {
                    this.stepWidth = newWidth;
                    this.updateWidth();
                });
            }
            else {
                if (gantt.isContentOverflowingVertically()) {
                    let rangeEnd = timeline.getDateForLeftPosition(gantt.getContentWidth());
                    this.stepWidth = timeline.getWidthPercentageStringForDateIntervalForRange(this.end.getTime() - this.start.getTime(), rangeEnd.getTime() - timeline.internalInclusiveStartDateTime.getTime());
                }
                else {
                    this.stepWidth = timeline.getWidthPercentageStringForDateInterval(this.end.getTime() - this.start.getTime());
                }
                this._substeps.forEach(substep => substep.refresh());
                this.updateWidth();
            }
        }));
    }
    refresh() {
        this.syncPropertiesFromGantt();
        this.recalculateLeft();
        this.recalculateWidth();
    }
    async getGanttElement() {
        let getEl = () => this.parentElement;
        let test = () => {
            let el = this.parentElement;
            let result = el && el.isConnected;
            return result && el.getTimeline;
        };
        if (this.substep) {
            getEl = () => this.parentElement.parentElement;
            test = () => {
                let el = this.parentElement;
                let result = el && el.isConnected;
                if (result) {
                    el = el.parentElement;
                    result = el && el.isConnected;
                }
                return result && el.getTimeline;
            };
        }
        let continueWhenGanttReady = function (resolve, isReady, notReady) {
            requestAnimationFrame(() => (isReady()) ? resolve() : notReady(resolve, isReady, notReady));
        };
        await new Promise((resolve) => requestAnimationFrame(() => continueWhenGanttReady(resolve, test, continueWhenGanttReady)));
        return getEl();
    }
    _handleTouchStart(event) {
        this.getGanttElement().then(gantt => gantt.handleTouchStart(event));
    }
    _handleMouseDown(event) {
        this.getGanttElement().then(gantt => gantt.handleMouseDown(event));
    }
};
GanttStepElement.RESIZE_WIDTH = 10;
GanttStepElement = __decorate([
    customElement('gantt-step-element')
], GanttStepElement);
//# sourceMappingURL=gantt-step-element.js.map