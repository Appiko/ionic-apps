import { Component } from "@angular/core";
import {
  NavController,
  NavParams,
  LoadingController,
  AlertController,
  ToastController
} from "ionic-angular";
import { HelpModalProvider } from "../../providers/help-modal/help-modal";
import { BLE } from "@ionic-native/ble";
import { BleServiceProvider } from "../../providers/ble-service/ble-service";
import { BeConfig, HardwareInfo } from "../../providers/BeConfig";

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
  triggerMode: BeConfig["triggerMode"];
  motionConfig: BeConfig["motion"];
  timerConfig: BeConfig["timer"];
  irConfig: BeConfig["ir"];
  hardwareVersion: HardwareInfo["version"];
  batteryStatus: HardwareInfo["batteryInVolts"];
  statusMessage = "Connecting to SENSE BE";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private ble: BLE,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    private bleService: BleServiceProvider,
    public loadingCtrl: LoadingController,
    public help: HelpModalProvider
  ) {
    console.log("beDetails Page");
    let device = navParams.get("device");
    console.log("Connecting to " + device.name || device.id);
    console.log("Present loading control : ");
    let loading = this.loadingCtrl.create({
      content: "Connecting to device :" + device.name || device.id
    });
    loading.present();
    this.ble.connect(device.id).subscribe(
      peripheral => {
        this.bleService.getData(peripheral, (config: BeConfig) => {
          this.motionConfig = config.motion;
          this.timerConfig = config.timer;
          this.irConfig = config.ir;
          this.triggerMode = config.triggerMode;
          this.bleService.getSysInfo((hardwareInfo: HardwareInfo) => {
            (this.batteryStatus = hardwareInfo.batteryInVolts),
              (this.hardwareVersion = hardwareInfo.version);
            this.statusMessage = `Connected to Sense Be (v ${
              this.hardwareVersion
            }) 🔋${this.batteryStatus > 2.3 ? "👍" : "👎"}`;
          });
          loading.dismiss();
        });
      },
      () => {
        this.showAlert(
          "Disconnected",
          "The peripheral unexpectedly disconnected. Please scan and try again."
        );
        loading.dismiss();
        this.navCtrl.pop();
      }
    );
  }

  changeTriggerMode(value) {
    this.triggerMode = value;
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad BeDetailPage");
    setInterval(() => {
      console.log(
        "BEDetails" +
          JSON.stringify(
            {
              mode: this.triggerMode,
              motion: this.motionConfig,
              timer: this.timerConfig,
              ir: this.irConfig
            },
            undefined,
            2
          )
      );
    }, 3000);
  }

  ionViewWillLeave() {
    this.bleService.disconnectBE();
  }

  showAlert(title, message) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: ["OK"]
    });
    alert.present();
  }

  onButtonClickWrite() {
    this.bleService.write(
      {
        triggerMode: this.triggerMode,
        motion: this.motionConfig,
        timer: this.timerConfig,
        ir: this.irConfig
      },
      (didWrite: boolean) => {
        this.onWrite(didWrite);
      }
    );
  }
  onWrite(didWrire: boolean): void {
    console.log(`${didWrire ? "Wrote" : "Failed to write"}`);
    this.statusMessage = didWrire ? "Write Success" : "Failed to Write";
  }

  onButtonClickClose() {
    if (this.triggerMode == 1) {
      this.toastCtrl
        .create({
          message: "Red light will blink on detecting motion for 10 minutes",
          duration: 2000,
          position: "middle"
        })
        .present();
    }
    this.navCtrl.pop();
  }
}
