import { LitElement, html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { GanttElement } from './gantt-element';
import { GanttSubStepsBase } from './gantt-substeps-base';

@customElement('gantt-step-element')
export class GanttStepElement extends GanttSubStepsBase {

    static RESIZE_WIDTH: number = 10

    static get styles() {
        return css`
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

        :host([moving=true]) {
            cursor: move;
        }

        :host([resizing=true]) {
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

        :host(.step.invalid) {
            visibility: hidden;
        }
        `;
    }

    constructor() {
        super();
        this.style.visibility = 'hidden';
    }

    firstUpdated(changedProperties: any) {
        super.firstUpdated(changedProperties);
        this.classList.add("step");
        this.style.setProperty('--gantt-step-height', this.stepHeight);
        this.addEventListener('touchstart', this._handleTouchStart);
        this.addEventListener('mousedown', this._handleMouseDown);
    }

    render() {
        this.style.setProperty('--gantt-step-background-color', this.backgroundColor);
        this.style.setProperty('--gantt-step-height', this.stepHeight);

        return html`
        <div class="step-label">${this.caption}</div>
        <slot @slotchange=${this.handleSlotchange}></slot>
        `;
    }

    update(changedProperties: any) {
        if (changedProperties.has("start") || changedProperties.has("end")) {
            this.recalculateLeft();
            this.recalculateWidth();
        }
        if (changedProperties.has('position')) {
            if (this.substep) {
                this.style.removeProperty("top");
            } else {
                this.style.top = this.position * this.getStepHeight() + "px";
            }
            this.initUidByPosition();
        }
        super.update(changedProperties);
    }

    private initUidByPosition() {
        if (this.uid) { return; }
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

    private updateUid() {
        this.uid = (this.substep) ? `${this.owner.uid}-${this.position}` : `${this.position}`;
    }

    private recalculateLeft() {
        this.getGanttElement().then(gantt => gantt.getTimeline()
            .then(timeline => {
                if (this.substep) {
                    this.calculateSubStepLeft(timeline).then(newLeft => {
                        this.stepLeft = newLeft;
                        this.updateLeft();
                    });
                } else {
                    this.stepLeft = timeline.getLeftPositionPercentageStringForDate(this.start, gantt.getContentWidth());
                    this._substeps.forEach(substep => substep.refresh());
                    this.updateLeft();
                }
            }));
    }

    private recalculateWidth() {
        this.getGanttElement().then(gantt => gantt.getTimeline()
            .then(timeline => {
                if (this.substep) {
                    this.calculateSubStepWidth(timeline).then(newWidth => {
                        this.stepWidth = newWidth;
                        this.updateWidth();
                    });
                } else {
                    this.stepWidth = timeline.getWidthPercentageStringForDateInterval(this.end.getTime() - this.start.getTime());
                    this._substeps.forEach(substep => substep.refresh());
                    this.updateWidth();
                }
                
            }));
    }

    public refresh() {
        this.recalculateLeft();
        this.recalculateWidth();
    }

    public async getGanttElement(): Promise<GanttElement> {
        let getEl = () => <GanttElement>this.parentElement;
        let test = () => {
            let el = <GanttElement>this.parentElement;
            let result = el && el.isConnected;
            return result && el.getTimeline;
        };
        if (this.substep) {
            getEl = () => <GanttElement>this.parentElement.parentElement;
            test = () => {
                let el = this.parentElement;
                let result = el && el.isConnected;
                if(result) {
                    el = el.parentElement;
                    result = el && el.isConnected;
                }
                return result && (<GanttElement>el).getTimeline;
            };
        }
        let continueWhenGanttReady = function (resolve: any, isReady: Function, notReady: Function) {
            requestAnimationFrame(() => (isReady()) ? resolve() : notReady(resolve, isReady, notReady));
        }
        await new Promise((resolve) => requestAnimationFrame(() => continueWhenGanttReady(resolve, test, continueWhenGanttReady)));
        return getEl();
    }

    private _handleTouchStart(event: TouchEvent) {
        this.getGanttElement().then(gantt => gantt.handleTouchStart(event));
    }

    private _handleMouseDown(event: MouseEvent) {
        this.getGanttElement().then(gantt => gantt.handleMouseDown(event));
    }
    
}