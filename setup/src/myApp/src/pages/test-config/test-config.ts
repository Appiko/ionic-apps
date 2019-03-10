import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { DetailPage } from "../detail/detail";

// TBD : these shd be common to home.ts too : figure out how to share common header file
const APPIKO_DUMMY_DEVICE_MAC = "AA:BB:CC:DD:EE:FF";
const APPIKO_DUMMY_DEVICE_NAME = "Dummy Device (Sample to view config options)";

/**
 * Generated class for the TestConfigPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-test-config",
  templateUrl: "test-config.html"
})
export class TestConfigPage {
  dummyDevice: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    //show a dummy device to check config options etc as sample.
    this.dummyDevice = {
      name: APPIKO_DUMMY_DEVICE_NAME,
      id: APPIKO_DUMMY_DEVICE_MAC,
      advertising: [
        2,
        1,
        6,
        3,
        3,
        15,
        24,
        8,
        9,
        66,
        97,
        116,
        116,
        101,
        114,
        121
      ],
      rssi: -55
    };
    this.navCtrl.push(DetailPage, {
      device: this.dummyDevice
    });
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad TestConfigPage");
  }
}
