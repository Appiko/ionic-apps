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
      message: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
		Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
		Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
		Excepteur sint occaecat cupidatat non proident,
		sunt in culpa qui officia deserunt mollit anim id est laborum.`
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
