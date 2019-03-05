import { Component } from "@angular/core";
import { HelpModalProvider } from "../../providers/help-modal/help-modal";

/**
 * Generated class for the BeTimerComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: "be-timer",
  templateUrl: "be-timer.html"
})
export class BeTimerComponent {
  triggerFrequency: number = 2.3;

  constructor(public help: HelpModalProvider) {
    console.log("Hello BeTimerComponent Component");
  }
}
