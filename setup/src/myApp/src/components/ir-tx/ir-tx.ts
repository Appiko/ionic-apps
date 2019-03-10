import { Component, Output, EventEmitter, Input } from "@angular/core";
import { HelpModalProvider } from "../../providers/help-modal/help-modal";
import { BeConfig } from "../../providers/BeConfig";

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
  irConfigVal: BeConfig["ir"];

  @Output() irConfigChange = new EventEmitter();

  @Input()
  get irConfig() {
    return this.irConfigVal;
  }

  set irConfig(val) {
    this.irConfigVal = val;
    this.irConfigChange.emit(this.irConfigVal);
  }

  constructor(public help: HelpModalProvider) {
    console.log("Hello IrTxComponent Component");
  }
}
