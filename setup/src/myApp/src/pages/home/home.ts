import { BLE } from "@ionic-native/ble";
import { Component, NgZone, ChangeDetectorRef } from "@angular/core";
import { NavController, Platform } from "ionic-angular";
import { ToastController } from "ionic-angular";
import { DetailPage } from "../detail/detail";
import { BeDetailPage } from "../be-detail/be-detail";

// Appiko Sense Device Names by default
const APPIKO_SENSE_PI = "SensePi";
const APPIKO_SENSE_BE = "SenseBe";
const DEVICES_TO_SCAN = [APPIKO_SENSE_PI, APPIKO_SENSE_BE];

const DEVICE_ID_NUM_OFFSET = 6;
const DEVICE_ID_LEN = 16;

//pnarasim : old UUID
//const APPIKOSENSE_SERVICE = '3c73dc5c-07f5-480d-b066-837407fbde0a';

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  devices: any[] = [];
  statusMessage: string;

  private bleCheckTimer;
  private bleChecked: boolean = false;

  constructor(
    public navCtrl: NavController,
    private platform: Platform,
    private toastCtrl: ToastController,
    private ble: BLE,
    private ngZone: NgZone,
    private cd: ChangeDetectorRef
  ) { }

  // To enable bluetoooth if not enabled
  ionViewDidEnter() {
    console.log("ionViewDidEnter HomePage");
    this.devices = [];
    this.bleCheckTimer = setInterval(() => {
      this.scan(false);
    }, 3000);

    this.scan(false);
  }

  // To continuously scan for BLE Devices (stopScan is never called)
  scan(fromBtn) {
    console.log("Scanning");
    this.ble
      .isEnabled()
      .then(() => {
        this.bleChecked = false;
        this.setStatus("Press the button on Sense device");

        this.ble.startScan([]).subscribe(
          device => {
            let deviceType = this.getDeviceType(device);
            if (DEVICES_TO_SCAN.includes(deviceType)) {
              this.onDeviceDiscovered(device);
            }
          },
          error => this.scanError(error)
        );

        if (fromBtn) {
          this.devices = []; // clear list
          this.showToast(
            "Scanning for the device with orange light after button press"
          );
        }
      })
      .catch(() => {
        if (this.platform.is("ios")) {
          this.setStatus("Error! Enable Bluetooth");
          this.devices = [];
          this.cd.detectChanges();
        }
        if (this.bleChecked == false) {
          console.log("ON BLE");
          this.bleChecked = true;
          this.ble
            .enable()
            .then(() => {
              this.scan(false);
            })
            .catch(() => {
              this.ble.showBluetoothSettings();
              this.bleChecked = false;
            });
        }
      });
    /* setTimeout(this.setStatus.bind(this), 150000, 'Scan complete'); */
  }

  Utf8ArrayToStr(array) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = array.length;
    i = 0;
    while (i < len) {
      c = array[i++];
      switch (c >> 4) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
          // 0xxxxxxx
          out += String.fromCharCode(c);
          break;
        case 12:
        case 13:
          // 110x xxxx   10xx xxxx
          char2 = array[i++];
          out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
          break;
        case 14:
          // 1110 xxxx  10xx xxxx  10xx xxxx
          char2 = array[i++];
          char3 = array[i++];
          out += String.fromCharCode(
            ((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0)
          );
          break;
      }
    }

    return out;
  }

  // i must be < 256
  asHexString(i) {
    var hex;

    hex = i.toString(16);

    // zero padding
    if (hex.length === 1) {
      hex = "0" + hex;
    }

    return "0x" + hex;
  }

  parseAdvertisingData(buffer) {
    var length,
      type,
      data,
      i = 0,
      advertisementData = {};
    var bytes = new Uint8Array(buffer);

    while (length !== 0) {
      length = bytes[i] & 0xff;
      i++;

      // decode type constants from https://www.bluetooth.org/en-us/specification/assigned-numbers/generic-access-profile
      type = bytes[i] & 0xff;
      i++;

      data = bytes.slice(i, i + length - 1); // length includes type byte, but not length byte
      i += length - 2; // move to end of data
      i++;

      advertisementData[this.asHexString(type)] = data;
    }

    return advertisementData;
  }

  getDeviceType(device) {
    if (this.platform.is("ios")) {
      if ("kCBAdvDataLocalName" in device.advertising) {
        if (device.advertising.kCBAdvDataLocalName.substring(0, 2) == "SP") {
          return "SensePi";
        }
      }
      if ("kCBAdvDataLocalName" in device.advertising) {
        let id = device.advertising.kCBAdvDataLocalName.substring(0, 2);
        if (id == "SB" || id == "BT" || id == "BR") {
          return "SenseBe";
        }
      }
    }
    if (this.platform.is("android")) {
      return device.name;
    }
  }
  renameDevice(device) {
    if (this.platform.is("ios")) {
      // This will only print when on iOS
      let dev_name = "";
      if (device.advertising.kCBAdvDataLocalName.substring(0, 2) == "SP") {
        dev_name = "SensePi";
      }
      let id = device.advertising.kCBAdvDataLocalName.substring(0, 2);
      if (id == "SB" || id == "BT" || id == "BR") {
        dev_name = "SenseBe";
      }
      return (
        dev_name +
        "-" +
        device.advertising.kCBAdvDataLocalName.substring(
          DEVICE_ID_NUM_OFFSET,
          DEVICE_ID_LEN
        )
      );
    } else if (this.platform.is("android")) {
      var advertisingData = this.parseAdvertisingData(device.advertising);
      return (
        device.name +
        "-" +
        this.Utf8ArrayToStr(
          advertisingData["0x08"].slice(DEVICE_ID_NUM_OFFSET, DEVICE_ID_LEN)
        )
      );
    }
  }

  getSignalString(rssi) {
    if (rssi > -50) {
      return "▁▃▅▇█";
    } else if (rssi > -60) {
      return "▁▃▅▇ ";
    } else if (rssi > -73) {
      return "▁▃▅  ";
    } else if (rssi > -87) {
      return "▁▃   ";
    } else {
      return "▁    ";
    }
  }

  // To list the devices as they are discovered
  onDeviceDiscovered(device) {
    var nameRssi = {
      name: this.renameDevice(device),
      id: device.id,
      rssi: this.getSignalString(device.rssi)
    };
    console.log("Discovered " + JSON.stringify(device, null, 2));

    console.log(`Discovered ${this.devices.length} Appiko devices`);

    var devPresent = false;
    for (var i = 0; i < this.devices.length; i++) {
      if (this.devices[i]["id"] == device.id) {
        devPresent = true;
        //Update the entry that's present already
        this.devices.splice(i, 1, nameRssi);

        console.log(
          "+++++++++++-!@#$%^&*()Akeady resent-!@#$%^&*()+++++++++++"
        );
      }
    }

    if (devPresent == false) {
      console.log("Pushed device");
      this.devices.push(nameRssi);
    }

    this.cd.detectChanges();
  }

  // If location permission is denied, you'll end up here
  scanError(error) {
    this.setStatus("Error " + error);
    this.showToast("Error scanning for Appiko BLE devices");
  }

  // Display messages in the footer
  setStatus(message) {
    console.log(message);
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }

  // Takes you to device details page on click
  deviceSelected(device) {
    console.log(JSON.stringify(device) + " selected");
    //stop scan when device is selected
    console.log("Stopping scan");
    this.ble.stopScan();
    clearInterval(this.bleCheckTimer);

    // Route to page according to Device
    if (device.name.includes(APPIKO_SENSE_PI)) {
      this.navCtrl.push(DetailPage, {
        device: device
      });
    } else if (device.name.includes(APPIKO_SENSE_BE)) {
      this.navCtrl.push(BeDetailPage, {
        device: device
      });
    }
  }

  showToast(msg: string) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: "middle"
    });
    toast.present();
  }
}
