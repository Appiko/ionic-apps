import { Component } from "@angular/core";
import { HelpModalProvider } from "../../providers/help-modal/help-modal";

/**
 * Generated class for the IrTxComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: "ir-tx",
  templateUrl: "ir-tx.html"
})
export class IrTxComponent {
  enable: boolean;

  constructor(public help: HelpModalProvider) {
    console.log("Hello IrTxComponent Component");
    this.enable = false;
  }
}
