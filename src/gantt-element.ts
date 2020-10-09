import { LitElement, html, css, property, customElement } from 'lit-element';
import { query, queryAssignedNodes } from 'lit-element/lib/decorators.js';
import { zonedTimeToUtc, utcToZonedTime, toDate, format } from 'date-fns-tz';
import { parse, getISOWeek } from 'date-fns';
import { Resolution } from 'tltv-timeline-element/src/model/Resolution';
import { Weekday } from 'tltv-timeline-element/src/model/Weekday';
import 'tltv-timeline-element/src/model/ILocaleDataProvider.ts';
import * as DateUtil from 'tltv-timeline-element/src/util/dateTimeUtil';
import { DateTimeConstants } from 'tltv-timeline-element/src/util/dateTimeUtil';
import * as ElementUtil from 'tltv-timeline-element/src/util/elementUtil';
import { DefaultLocaleDataProvider } from 'tltv-timeline-element/src/model/DefaultLocaleDataProvider';
import 'tltv-timeline-element/src/timeline-element.ts';
import { TimelineElement } from 'tltv-timeline-element/src/timeline-element';
import { GanttStepElement } from './gantt-step-element';
import * as GanttUtil from './util/ganttUtil';
import './gantt-step-element.ts';
import { GanttEventsBase } from './gantt-events-base';


@customElement('gantt-element')
export class GanttElement extends GanttEventsBase {

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
  /* Inclusive end Date (millisecond accuracy) */
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
  @property({ reflect: true}) 
  public zone: string = "Europe/London";
  @property({ reflect: true}) 
  public locale: string = "en-US";
  @property({ reflect: true}) firstDayOfWeek: number = 1; // sunday;
  @property({ reflect: true }) twelveHourClock: boolean = false;

  // TODO enable when typescript supports ResizeObserver
  // _resizeObserver = new ResizeObserver(entries => {
  //   this._timeline.updateWidths();
  //   this.updateContentWidth();
  // });

  static get styles() {
    return css`
      :host {
        display: block;
      }

      #container {
        position: relative;
        width: 100%;
        height: 100%;
        overflow-x: auto;
        user-select: none;
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
    return html`
      <div id="container">
        <timeline-element id="timeline"
            .resolution="${this.resolution}" 
            .startDateTime="${this.start}" 
            .endDateTime="${this.end}"
            .timeZone="${this.zone}"
            .locale="${this.locale}"
            .firstDayOfWeek="${this.firstDayOfWeek}"
            .twelveHourClock="${this.twelveHourClock}">
        </timeline-element>
        <div id="content">
          <slot @slotchange=${this.handleSlotchange}></slot>
        </div>
        <div id="mv-el" style="display: none;"></div>
      </div>
    `;
  }

  constructor() {
    super();
  }

  firstUpdated(changedProperties: any) {
    super.firstUpdated(changedProperties);
    // TODO enable when typescript supports ResizeObserver
    // this._resizeObserver.observe(this);
  }

  updated(changedProperties: any) {
    if (changedProperties.has('resolution') || changedProperties.has('start') || changedProperties.has('end')) {
      // TODO when reolution is hour, end time has to max minutes+seconds (in timeline or here)
      // TODO when resolution is day/week, end time should probably minimize minutes+seconds (in timeline or here)
      // TODO alternatively make end date exclusive not inclusive.
      this.timelineUpdated();
    }
    super.updated(changedProperties);
  }

  handleSlotchange(e: Event) {
    super.handleSlotchange(e);
    this.updateContentHeight();
  }

  async timelineUpdated () {
    await this._timeline.updateComplete;
    this.updateContentWidth();
    this._steps.forEach(step => step.refresh());
  }

  public updateContentWidth() {
    this.getContent().style.width = ElementUtil.getWidth(this._timeline) + "px";
  }

  public updateContentHeight() {
    let heightOfSteps = this._steps.map(step => step.getStepHeight()).reduce((a, b) => a + b);
    console.log(`GanttElement.updateContentHeight calculated ${heightOfSteps}px height for content by steps`);
    this.getContent().style.height = heightOfSteps + 'px';
  }

}