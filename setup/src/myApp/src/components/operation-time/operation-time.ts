import { Component, Output, EventEmitter, Input } from "@angular/core";
import { HelpModalProvider } from "../../providers/help-modal/help-modal";
import { AmbientOptions } from "../../providers/BeConfig";

enum TIME_SETTING {
  NIGHT_ONLY,
  DAY_ONLY,
  DAYNIGHT_BOTH
}

/**
 * Generated class for the BeMotionComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: "operation-time",
  templateUrl: "operation-time.html"
})
export class OperationTimeComponent {
  // sensitivityOnRange: number;
  // sensitivityMap = [1005, 505, 205, 55];

  ambientOptionsVal: AmbientOptions;

  timerShowTwilight: boolean = false;
  timerOpertimeSetting: number;
  timerDNTwilight: boolean;

  @Output() ambientOptionsChange = new EventEmitter();

  @Input()
  get ambientOptions() {
    return this.ambientOptionsVal;
  }

  set ambientOptions(val) {
    this.ambientOptionsVal = val;
    this.setThreshold(this.ambientOptionsVal.threshold);
    this.ambientOptionsChange.emit(this.ambientOptionsVal);
  }

  constructor(public help: HelpModalProvider) { }

  setThreshold(e) {
    this.timerOpertimeSetting = e;
    if (this.timerOpertimeSetting == 0) {
      console.log(`Changed to ${this.timerOpertimeSetting}`);
      this.ambientOptions.threshold = this.timerDNTwilight ? 0xFE : 0xFE;
      this.ambientOptions.aboveThreshold = false;
    } else if (this.timerOpertimeSetting == 1) {
      console.log(`Changed to ${this.timerOpertimeSetting}`);
      this.ambientOptions.threshold = this.timerDNTwilight ? 0xFE : 0xFE;
      this.ambientOptions.aboveThreshold = false;
    } else {
      console.log(`Changed to ${this.timerOpertimeSetting}`);
      this.ambientOptions.threshold = 0xFE;
      this.ambientOptions.aboveThreshold = false;
    }


    if (e == TIME_SETTING.DAYNIGHT_BOTH) {
      this.timerShowTwilight = false;
    } else {
      this.timerShowTwilight = true;
    }
    this.ambientOptionsChange.emit(this.ambientOptionsVal);
  }


}
