var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { toDate, format } from 'date-fns-tz';
export class GanttStepBase extends LitElement {
    constructor() {
        super(...arguments);
        /* Step level 'resizable' property. Gantt level 'resizableSteps' overrides this, but this property should always keep "user's" value. */
        this.resizable = true;
        this.movable = true;
        this.backgroundColor = "#fff";
        this.stepWidth = "0px";
        this.stepLeft = "0px";
        this.stepHeight = "30px";
        /* Should be in sync with Gantt's 'resizableSteps' property. */
        this.resizableSteps = true;
    }
    updateLeft() {
        this.style.setProperty('--gantt-step-left', this.stepLeft);
        this.style.removeProperty("left");
        this.style.removeProperty('visibility');
    }
    updateWidth() {
        this.style.setProperty('--gantt-step-width', this.stepWidth);
        this.style.removeProperty("width");
    }
    getStepHeight() {
        return parseInt(this.stepHeight, 10);
    }
}
__decorate([
    property({ reflect: true })
], GanttStepBase.prototype, "caption", void 0);
__decorate([
    property({ reflect: true, type: Boolean })
], GanttStepBase.prototype, "resizable", void 0);
__decorate([
    property({ reflect: true, type: Boolean })
], GanttStepBase.prototype, "movable", void 0);
__decorate([
    property()
], GanttStepBase.prototype, "uid", void 0);
__decorate([
    property({
        reflect: true,
        converter: {
            fromAttribute: (value, type) => {
                return toDate(value);
            },
            toAttribute: (value, type) => {
                return format(value, "yyyy-MM-dd'T'HH:mm:ss");
            }
        }
    })
], GanttStepBase.prototype, "start", void 0);
__decorate([
    property({
        reflect: true,
        converter: {
            fromAttribute: (value, type) => {
                return toDate(value);
            },
            toAttribute: (value, type) => {
                return format(value, "yyyy-MM-dd'T'HH:mm:ss");
            }
        }
    })
], GanttStepBase.prototype, "end", void 0);
__decorate([
    property()
], GanttStepBase.prototype, "backgroundColor", void 0);
__decorate([
    property()
], GanttStepBase.prototype, "stepWidth", void 0);
__decorate([
    property()
], GanttStepBase.prototype, "stepLeft", void 0);
__decorate([
    property()
], GanttStepBase.prototype, "stepHeight", void 0);
__decorate([
    property()
], GanttStepBase.prototype, "position", void 0);
__decorate([
    property({ reflect: true, type: Boolean })
], GanttStepBase.prototype, "resizing", void 0);
__decorate([
    property({ reflect: true, type: Boolean })
], GanttStepBase.prototype, "moving", void 0);
__decorate([
    property({ reflect: true, type: Boolean })
], GanttStepBase.prototype, "resizableSteps", void 0);
//# sourceMappingURL=gantt-step-base.js.map