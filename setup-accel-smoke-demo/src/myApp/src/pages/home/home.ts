import { BLE } from '@ionic-native/ble';
import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { NavController, Platform, AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { DetailPage } from '../detail/detail';

// Appiko Sense Device Names by default
const APPIKO_SENSE_PI = 'SensePi';
const APPIKO_SENSE_PI_COMPLETE_LOCAL_NAME = 'SensePi';
// shortened local name is SPaabbyymmddnnnn : aa is board rev, bb is manufacturing location
const APPIKO_SENSE_SHORTENED_LOCAL_NAME = 'SP' 

const APPIKO_SENSE_RE = /SP[0-9]+/g;

// Bluetooth UUIDs
const UUID_SENSE_PI_SERVICE = '3c73dc70-07f5-480d-b066-837407fbde0a';
const UUID_SENSE_BOARD_SETTINGS = '3c73dc71-07f5-480d-b066-837407fbde0a';

const DEVICE_ID_NUM_OFFSET = 6;
const DEVICE_ID_LEN = 16;

//pnarasim : old UUID
//const APPIKOSENSE_SERVICE = '3c73dc5c-07f5-480d-b066-837407fbde0a';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  
  devices: any[] = [];

  motionBtn: string;
  vibrSmokeBtn: string;

  connMotion: boolean = false;
  connVibrSmoke: boolean = false;
  statusMessage: string;

  motionMessage: string;
  smokeMessage: string;

  count: number;
  accel_trsh: number;
  smoke_trsh: number;

  private bleCheckTimer;
  private bleChecked : boolean = false;
  motionSensed : boolean = false;

  conn_id;
  
  constructor(public navCtrl: NavController,
    private platform: Platform, 
    private toastCtrl: ToastController,
    private ble: BLE,
    private ngZone: NgZone,
    private cd:ChangeDetectorRef,
    private alertCtrl: AlertController) {
    }

    // To enable bluetoooth if not enabled
    ionViewDidEnter() {
      console.log('ionViewDidEnter HomePage');
      this.devices = [];
      this.bleCheckTimer = setInterval(() => {
        this.timerHandler();
      }, 1000);

      this.count = 0;
      this.scan(false);
      this.connMotion = false;
      this.connVibrSmoke = false;
      this.motionMessage = "No detection";
      this.smokeMessage = "No smoke";
      this.accel_trsh = 200;
      this.smoke_trsh = 450;
    }

    // To enable bluetoooth if not enabled
    ionViewDidLeave() {
      console.log('ionViewDidLeave HomePage');
      this.ble.stopScan();
      clearInterval(this.bleCheckTimer);
    }

    timerHandler() {
      this.count = this.count+1;
      //Not connected
      if((this.connMotion ==  false) && (this.connVibrSmoke == false)) {
        //Every 4 sec
        if(this.count%4 == 0) {
          this.scan(false);
        }
      } else if (this.connMotion) {
        //once connected, read the current config on the device.
        this.ble.read(this.conn_id, UUID_SENSE_PI_SERVICE, UUID_SENSE_BOARD_SETTINGS).then(
          data => {            
            console.log("====================== SYSINFO READ ==================");
            var dataview = new DataView(data);
            console.log("read the sysinfo from the sensepi " + dataview.getUint8(0));
            this.setStatus(dataview.getInt8(0));
            if(dataview.getUint8(0) == 0) {
              this.motionMessage = "Motion detected"
              //this.vibration.vibrate(100);
              this.motionSensed = true;
            } else {
              this.motionMessage = "No detection"
              this.motionSensed = false;
            }
            this.cd.detectChanges();
          }
        ).catch(
           (e) => console.log("Error trying to read data from service " + UUID_SENSE_PI_SERVICE + " and char " + UUID_SENSE_BOARD_SETTINGS + " : " + e)
        );
      } else {
        //once connected, read the current config on the device.
        this.ble.read(this.conn_id, UUID_SENSE_PI_SERVICE, UUID_SENSE_BOARD_SETTINGS).then(
          data => {            
            console.log("====================== SYSINFO READ ==================");
            var dataview = new DataView(data);
            var accel_val = dataview.getUint8(0) + 256*dataview.getUint8(1);
            var smoke_val = dataview.getUint8(2) + 256*dataview.getUint8(3);
            this.setStatus("accel val " + accel_val);
            if(accel_val > this.accel_trsh) {
              this.motionMessage = "Motion detected"
            } else {
              this.motionMessage = "No detection"
            }

            if(smoke_val > this.smoke_trsh) {
              this.smokeMessage = "Smoke detected"
            } else {
              this.smokeMessage = "No smoke"
            }
            this.cd.detectChanges();
          }
        ).catch(
           (e) => console.log("Error trying to read data from service " + UUID_SENSE_PI_SERVICE + " and char " + UUID_SENSE_BOARD_SETTINGS + " : " + e)
        );
      }      
    }
    
    // To continuously scan for BLE Devices (stopScan is never called)
    scan(fromBtn) {
      console.log('Scanning')
      this.ble.isEnabled()
        .then(() => {
          this.bleChecked = false;
          this.setStatus('Scanning for Appiko devices');

          this.ble.startScan([UUID_SENSE_PI_SERVICE]).subscribe(
            device => this.onDeviceDiscovered(device),
            error => this.scanError(error)
          );

          if(fromBtn){
            this.devices = [];  // clear list
            this.showToast('Scanning for the device with orange light after button press');
          }

        })
        .catch(() => {
            if (this.platform.is('ios')) {
              this.setStatus('Error! Enable Bluetooth');
              this.devices = [];
              this.cd.detectChanges();
            }
            if(this.bleChecked == false) {
              console.log('ON BLE');
              this.bleChecked = true;
              this.ble.enable()
                .then(() => {
                  this.scan(false)
                })
                .catch(()=> {
                  this.ble.showBluetoothSettings();
                  this.bleChecked = false;
                 });
            }

          })
      /* setTimeout(this.setStatus.bind(this), 150000, 'Scan complete'); */
    }

    Utf8ArrayToStr(array) {
        var out, i, len, c;
        var char2, char3;
  
        out = "";
        len = array.length;
        i = 0;
        while(i < len) {
        c = array[i++];
        switch(c >> 4)
        { 
          case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
            // 0xxxxxxx
            out += String.fromCharCode(c);
            break;
          case 12: case 13:
            // 110x xxxx   10xx xxxx
            char2 = array[i++];
            out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
            break;
          case 14:
            // 1110 xxxx  10xx xxxx  10xx xxxx
            char2 = array[i++];
            char3 = array[i++];
            out += String.fromCharCode(((c & 0x0F) << 12) |
                           ((char2 & 0x3F) << 6) |
                           ((char3 & 0x3F) << 0));
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
      var length, type, data, i = 0, advertisementData = {};
          var bytes = new Uint8Array(buffer);
  
        while (length !== 0) {
  
            length = bytes[i] & 0xFF;
            i++;
  
            // decode type constants from https://www.bluetooth.org/en-us/specification/assigned-numbers/generic-access-profile
            type = bytes[i] & 0xFF;
            i++;
  
            data = bytes.slice(i, i + length - 1); // length includes type byte, but not length byte
            i += length - 2;  // move to end of data
            i++;
  
        advertisementData[this.asHexString(type)] = data;
      }
    
      return advertisementData;
    }

    renameDevice(device) {
      if (this.platform.is('ios')) {
      // This will only print when on iOS
        let dev_name = "";
        if(device.advertising.kCBAdvDataLocalName.substring(0,9) == 'BT Dongle') {
          dev_name = "MotionDongle";
        }
        if(device.advertising.kCBAdvDataLocalName.substring(0,2) == 'SB') {
          dev_name = "SenseBe";
        }
        return dev_name + '-' + device.advertising.kCBAdvDataLocalName.substring(DEVICE_ID_NUM_OFFSET,DEVICE_ID_LEN);
      } else if (this.platform.is('android')) {
        let dev_name = "";
        var advertisingData = this.parseAdvertisingData(device.advertising);
        if(this.Utf8ArrayToStr(advertisingData['0x08']) == 'BT Dongle') {
          dev_name = "MotionDongle";
        }
        return dev_name;
      }
    }

    getSignalString(rssi) {
      if(rssi > -50) {
        return "▁▃▅▇█"
      } else if(rssi > -60) {
        return "▁▃▅▇ "
      } else if(rssi > -73) {
        return "▁▃▅  "
      } else if(rssi > -87) {
        return "▁▃   "
      } else {
        return "▁    "
      }
    }

    // To list the devices as they are discovered
    onDeviceDiscovered(device) {

      var nameRssi =  {"name":this.renameDevice(device), "id":device.id, "rssi":this.getSignalString(device.rssi)} ;

      console.log('Discovered device is of Appiko ' + nameRssi.name);

      this.conn_id = device.id;
      this.ble.connect(device.id).subscribe(
        peripheral => {
          //pnarasim tbd: disable back during this time. else the connecting loading ctrler shows on home page too
          //this.onConnected(peripheral);
          this.setStatus('Connected to ' + (peripheral.name || peripheral.id));      
          if(nameRssi.name == "MotionDongle") {
            this.connMotion = true;
            this.connVibrSmoke = false;
          } else {
            this.connVibrSmoke = true;
            this.connMotion = false;
          }
        },
        peripheral => {
          console.log('Disconnected', 'The peripheral unexpectedly disconnected. Please scan and try again.');
          this.connMotion = false;
          this.connVibrSmoke = false;          
        }
      );

      this.cd.detectChanges();
    }

    // onConnected(peripheral) {
    // }
    
    // If location permission is denied, you'll end up here
    scanError(error) {
      this.setStatus('Error ' + error);
      this.showToast('Error scanning for Appiko BLE devices');
    }
    
    // Display messages in the footer
    setStatus(message) {
      console.log(message);
      this.ngZone.run(() => {
        this.statusMessage = message;
      });
    }

    showToast(msg: string) {
      let toast = this.toastCtrl.create({
        message: msg,
        duration: 3000,
        position: 'middle'
      });
      toast.present();
    }

    showAccelPrompt() {
      const prompt = this.alertCtrl.create({
        title: 'Accel threshold',
        message: "Enter the acceleration threshold",
        inputs: [
          {
            name: 'number',
            placeholder: ''
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Save',
            handler: data => {              
              this.accel_trsh = Number(data.number);
              console.log('Saved clicked ' + this.accel_trsh);
            }
          }
        ]
      });
      prompt.present();
    }

    showSmokePrompt() {
      const prompt = this.alertCtrl.create({
        title: 'Smoke threshold',
        message: "Enter the smoke threshold",
        inputs: [
          {
            name: 'number',
            placeholder: 'Title'
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Save',
            handler: data => {
              this.smoke_trsh = Number(data.number);
              console.log('Saved clicked ' + data.number);
            }
          }
        ]
      });
      prompt.present();
    }

  }