import { Component } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import { HelpModalProvider } from "../../providers/help-modal/help-modal";

/**
 * Generated class for the BeDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-be-detail",
  templateUrl: "be-detail.html"
})
export class BeDetailPage {
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public help: HelpModalProvider
  ) {}

  triggerMode = 0;
  ionViewDidLoad() {
    console.log("ionViewDidLoad BeDetailPage");
  }

  change() {}
}
