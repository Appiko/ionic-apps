import { Component } from "@angular/core";
import { HelpModalProvider } from "../../providers/help-modal/help-modal";

/**
 * Generated class for the CamTriggerCardComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: "cam-trigger-card",
  templateUrl: "cam-trigger-card.html"
})
export class CamTriggerCardComponent {
  operationMode: number;

  constructor(public help: HelpModalProvider) {
    console.log("Hello CamTriggerCardComponent Component");
  }
}
