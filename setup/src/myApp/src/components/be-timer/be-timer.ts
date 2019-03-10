import { Component, Output, EventEmitter, Input } from "@angular/core";
import { HelpModalProvider } from "../../providers/help-modal/help-modal";
import { BeConfig } from "../../providers/BeConfig";

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
	timerConfigVal: BeConfig["timer"];

	@Output() timerConfigChange = new EventEmitter();

	@Input()
	get timerConfig() {
		return this.timerConfigVal;
	}

	set timerConfig(val) {
		this.timerConfigVal = val;
		this.timerConfigChange.emit(this.timerConfigVal);
	}

	change(val: BeConfig["timer"]) {
		this.timerConfig = val;
	}

  constructor(public help: HelpModalProvider) {
    console.log("Hello BeTimerComponent Component");
  }
}
