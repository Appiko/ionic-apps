import { Component, Output, EventEmitter, Input } from "@angular/core";
import { HelpModalProvider } from "../../providers/help-modal/help-modal";
import { BeConfig } from "../../providers/BeConfig";

/**
 * Generated class for the BeMotionComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: "be-motion",
  templateUrl: "be-motion.html"
})
export class BeMotionComponent {
  sensitivityOnRange: number;
  sensitivityMap = [1005, 505, 205, 55];

  motionConfigVal: BeConfig["motion"];

  @Output() motionConfigChange = new EventEmitter();

  @Input()
  get motionConfig() {
    return this.motionConfigVal;
  }

  set motionConfig(val) {
    this.motionConfigVal = val;
    this.setSensitivity(this.motionConfigVal.motionSensitivity);
    this.motionConfigChange.emit(this.motionConfigVal);
  }

  constructor(public help: HelpModalProvider) {}

  // sends an object on ionChange
  setSensitivity(e: object | number) {
    if (typeof e === "object") {
      this.motionConfig.motionSensitivity = this.sensitivityMap[e["value"] - 1];
    } else if (typeof e === "number") {
      this.sensitivityOnRange = this.sensitivityMap.indexOf(e) + 1;
    }
  }
}
