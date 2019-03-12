import { Component, Input, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { HelpModalProvider } from "../../providers/help-modal/help-modal";

/**
 * Generated class for the TriggerFrequencyComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: "trigger-frequency",
  templateUrl: "trigger-frequency.html"
})
export class TriggerFrequencyComponent {
  @Input() label = "";
  @Input() helpObjectName: string;
  @Output() timeChange = new EventEmitter();
  timeVal = 0;

  constructor(public help: HelpModalProvider) {
    console.log("Hello TriggerFrequencyComponent Component");
  }

  @Input()
  get time() {
    return this.timeVal;
  }

  set time(val) {
    this.timeVal = val;
    this.timeChange.emit(this.timeVal);
  }

  change(val) {
    this.time = val;
  }
  errorMessages = {
    frequency: [
      { type: "required", message: "This field is required" },
      {
        type: "min",
        message: "Please enter positive value less than 600"
      },
      {
        type: "max",
        message: "Please enter a value less than 600"
      }
    ]
  };
  // This validates that the timer is set and follows the RegEx pattern
  triggerForm = new FormGroup({
    validateFrequency: new FormControl(
      "",
      Validators.compose([
        Validators.required,
        Validators.min(0),
        Validators.max(600)
      ])
    )
  });
}
