import { Component } from "@angular/core";
import { HelpModalProvider } from "../../providers/help-modal/help-modal";

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
  sensitivity: number = 100;
  sensitivityOnRange: number;
  time = 3.2;
  sensitivityMap = [100, 250, 500, 1000];
  constructor(public help: HelpModalProvider) {
    console.log("Hello BeMotionComponent Component");
    this.setSensitivity(this.sensitivity);
  }

  setSensitivity(e: object | number) {
    if (typeof e === "object") {
      this.sensitivity = this.sensitivityMap[e["value"] - 1];
    } else if (typeof e === "number") {
      this.sensitivityOnRange = this.sensitivityMap.indexOf(e) + 1;
    }
  }
}
