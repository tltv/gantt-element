import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { toDate, format } from 'date-fns-tz';

export class GanttStepBase extends LitElement {

    @property({ reflect: true }) public caption: string;
    /* Step level 'resizable' property. Gantt level 'resizableSteps' overrides this, but this property should always keep "user's" value. */
    @property({ reflect: true, type: Boolean }) public resizable: boolean = true;
    @property({ reflect: true, type: Boolean }) public movable: boolean = true;
    /* Unique id. if not given, uid will match position automatically. Substep gets prefix from owner uid: <owner.uid>-<uid> */
    @property() public uid: string;

    /* Inclusive start Date (millisecond accuracy) */
    @property({
        reflect: true,
        converter: {
            fromAttribute: (value: string, type) => {
                return toDate(value);
            },
            toAttribute: (value: Date, type) => {
                return format(value, "yyyy-MM-dd'T'HH:mm:ss");
            }
        }
    })
    public start: Date;
    /* Inclusive end Date (millisecond accuracy). */
    @property({
        reflect: true,
        converter: {
            fromAttribute: (value: string, type) => { 
              return toDate(value);
            },
            toAttribute: (value: Date, type) => { 
              return format(value, "yyyy-MM-dd'T'HH:mm:ss");
            }
        } 
    })
    public end: Date;

    @property() public backgroundColor = "#fff";
    @property() public stepWidth = "0px";
    @property() public stepLeft = "0px";
    @property() public stepHeight = "30px";
    @property() public position: number;
    @property({ reflect: true, type: Boolean }) public resizing: boolean;
    @property({ reflect: true, type: Boolean }) public moving: boolean;
    /* Should be in sync with Gantt's 'resizableSteps' property. */
    @property({ reflect: true, type: Boolean }) public resizableSteps: boolean = true;

    protected updateLeft() {
        this.style.setProperty('--gantt-step-left', this.stepLeft);
        this.style.removeProperty("left");
        this.style.removeProperty('visibility');
    }

    protected updateWidth() {
        this.style.setProperty('--gantt-step-width', this.stepWidth);
        this.style.removeProperty("width");
    }

    public getStepHeight(): number {
        return parseInt(this.stepHeight, 10);
    }
}