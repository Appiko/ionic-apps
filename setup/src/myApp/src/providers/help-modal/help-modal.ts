import { Injectable } from "@angular/core";
import { AlertController } from "ionic-angular";

/*
  Generated class for the HelpModalProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class HelpModalProvider {
  // TODO: Add different elements
  element = {
    "Trigger Mode": {
      message: `This setting configures the source for the camera trigger.
			Choose 'Motion' to trigger the camera on detection of animal motion.
			Choose 'Timer' to trigger the camera periodically after a specified amount of time.
			Please write to us if you need both simultaneously.`
    },
    "Timer Interval": {
      message:
        "Enter the time in seconds after which the camera should trigger repeatedly"
    },
    "Inter Trigger Time": {
      message: `This setting specifies the amount of time the motion sensor should be switched off after motion detection.`
    },
    "Camera Operations (Motion)": {
      message: `This setting configures how the camera is triggered.
			In 'Single Shot' the shutter button activated once, usually to take a single image.
			In 'Multi-Shot' the shutter button is activated two or more times at an interval specified.
			In 'Long Press' the shutter button is held for the duration specified.
			In 'Video Mode' the shutter button is activated two times at the interval specified.
			In case motion is detected at the end of the video interval the end shutter button press can be delayed by the extension duration for three times.
			In 'Half Press (Focus)' the half press of the shutter button is done which usually focuses the camera.
			Note that based on the settings on the camera different outcomes can be achieved for each mode.`
    },
    "Camera Operations (Timer)": {
      message: `This setting configures how the camera is triggered.
			In 'Single Shot' the shutter button activated once, usually to take a single image.
			In 'Multi-Shot' the shutter button is activated two or more times at an interval specified.
			In 'Long Press' the shutter button is held for the duration specified.
			In 'Video Mode' the shutter button is activated two times at the interval specified.
			In 'Half Press (Focus)' the half press of the shutter button is done which usually focuses the camera.
			Note that based on the settings on the camera different outcomes can be achieved for each mode.`
    },
    "IR Transmission": {
      message: `This controls the infrared beam transmission.
			Switch it off to make the device
			a receiver only and not provide an IR beam to another device.`
    },
    Sensitivity: {
      message: `This setting controls how quickly the sensor reacts to movements.`
    }
  };

  constructor(public alertController: AlertController) {
    console.log("Hello HelpModalProvider Provider");
  }

  // Shows Alert
  show(comp: string) {
    const heading = comp;
    const message =
      this.element[comp]["message"] ||
      "Something went wrong please update the object in help - modal.ts";

    const alert = this.alertController.create({
      title: heading,
      message: message,
      buttons: ["OK"]
    });
    alert.present();
  }
}
