import { Component, Input, EventEmitter, Output } from "@angular/core";
import { HelpModalProvider } from "../../providers/help-modal/help-modal";
import { FormGroup, Validators, FormControl } from "@angular/forms";
import { CamConfig } from "../../providers/BeConfig";

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
  camConfigVal: CamConfig;

  @Output() camConfigChange = new EventEmitter();
  @Input()
  get camConfig() {
    return this.camConfigVal;
  }

  set camConfig(val) {
    this.camConfigVal = val;
    this.camConfigChange.emit(this.camConfigVal);
  }

  @Input() triggerMode: number;

  constructor(public help: HelpModalProvider) {
    console.log("Hello CamTriggerCardComponent Component");
  }
  errorMessages = {
    //   { type: "required", message: "This field is required" },
    //   {
    //     type: "max",
    //     message: "Enter value below 32"
    //   },
    //   {
    //     type: "min",
    //     message: "Enter value above 2 and below 32"
    //   }
    // ],
    numerOfShots: this.getValidationArray({
      isRequired: true,
      min: 2,
      max: 32,
      inSeconds: false
    }),
    timeBetweenShots: this.getValidationArray({
      isRequired: true,
      min: 0.3,
      max: 120,
      inSeconds: true
    }),
    videoDuration: this.getValidationArray({
      isRequired: true,
      min: 2,
      max: 32,
      inSeconds: true
    }),
    videoExtentionTime: this.getValidationArray({
      isRequired: false,
      min: 0,
      max: 240,
      inSeconds: true
    }),
    longPressDuration: this.getValidationArray({
      isRequired: true,
      min: 1,
      max: 10800,
      inSeconds: true
    })
  };

  multiShotForm = new FormGroup({
    validateNumberOfShots: new FormControl(
      "",
      Validators.compose([
        Validators.required,
        Validators.max(32),
        Validators.min(2)
      ])
    ),
    validateTimeBetweenShots: new FormControl(
      "",
      Validators.compose([
        Validators.required,
        Validators.max(120),
        Validators.min(0.3)
      ])
    )
  });
  videoForm = new FormGroup({
    validateDuration: new FormControl(
      "",
      Validators.compose([
        Validators.required,
        Validators.max(32),
        Validators.min(2)
      ])
    ),
    validateExtentionTime: new FormControl(
      "",
      Validators.compose([Validators.max(240), Validators.min(0)])
    )
  });
  longPressForm = new FormGroup({
    validateDuration: new FormControl(
      "",
      Validators.compose([
        Validators.required,
        Validators.max(10800),
        Validators.min(1)
      ])
    )
  });

  getValidationArray(data: {
    isRequired: boolean;
    min: number;
    max: number;
    inSeconds: boolean;
  }): Array<Object> {
    let validationArray = [];

    if (data.isRequired)
      validationArray.push({
        type: "required",
        message: "This field is required"
      });

    validationArray.push({
      type: "min",
      message: `Enter value above ${data.min} and less than or equal to ${
        data.max
      } ${data.inSeconds ? "seconds" : ""}`
    });

    validationArray.push({
      type: "max",
      message: `Enter value less than or equal to ${data.max} ${
        data.inSeconds ? "seconds" : ""
      }`
    });
    return validationArray;
  }
}
