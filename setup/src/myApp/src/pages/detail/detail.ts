import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { Platform, NavController, NavParams, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { NativeStorage } from '@ionic-native/native-storage';
import { Subscription } from 'rxjs';

const CAM_TRIGGER_SETTING_HEAD = 'Trigger Source';
const CAM_TRIGGER_SETTING_TEXT = "This setting configures the source for the camera trigger.\
\nChoose 'Motion Only' to trigger the camera on detection of animal motion.\
\nChoose 'Time Lapse Only' to trigger the camera periodically after a specified amount of time. \
\nPlease write to us if you need both simultaneously.";

const TIMER_INTERVAL_HEAD = 'Time-Lapse Interval';
const TIMER_INTERVAL_TEXT = 'Enter the time in seconds after which the camera should trigger repeatedly';

const OPER_MODE_HEAD = 'Operating Mode';
const OPER_MODE_TEXT = "Choose when the camera should be triggered based on the ambient light. \
For an always-on device, please choose 'Day and Night'. \
In the case of 'Day Only' and 'Night Only', there is an option to 'Include Twilight', \
which will enable operation in the transitioning low-light conditions also.";

const TRIGGER_MODE_PIR_HEAD = 'Trigger Mode';
const TRIGGER_MODE_PIR_TEXT = "This setting configures how the camera is triggered. \
In 'Single Shot' the shutter button activated once, usually to take a single image. \
In 'Multi-Shot' the shutter button is activated two or more times at an interval specified. \
In 'Long Press' the shutter button is held for the duration specified. \
In 'Video Mode' the shutter button is activated two times at the interval specified. \
In case motion is detected at the end of the video interval the end shutter button press can be delayed by the extension duration for three times. \
In 'Half Press (Focus)' the half press of the shutter button is done which usually focuses the camera. \
Note that based on the settings on the camera different outcomes can be achieved for each mode.";

const TRIGGER_MODE_TIMER_HEAD = 'Trigger Mode';
const TRIGGER_MODE_TIMER_TEXT = "This setting configures how the camera is triggered. \
In 'Single Shot' the shutter button activated once, usually to take a single image. \
In 'Multi-Shot' the shutter button is activated two or more times at an interval specified. \
In 'Long Press' the shutter button is held for the duration specified. \
In 'Video Mode' the shutter button is activated two times at the interval specified. \
In 'Half Press (Focus)' the half press of the shutter button is done which usually focuses the camera. \
Note that based on the settings on the camera different outcomes can be achieved for each mode.";

const SENSITIVITY_HEAD = 'Sensor Sensitivity';
const SENSITIVITY_TEXT = "This setting configures how sensitive SensePi's motion sensing is. \
If you're using the narrow-angle SensePi, set it to 1 or 2 as its detection range is quite high. \
In case the SensePi is wide-angle, the maximum detection range varies from 5-6 m to 14-15 m by changing the sensitivity. \
Increasing the sensitivity can help detect smaller animals, though could seldom cause false triggers too. ";

const INTERTRIGGERTIME_HEAD = 'Inter-Trigger Time';
const INTERTRIGGERTIME_TEXT = "This setting specifies the amount of time the motion sensor should be switched off after motion detection.";

// TBD : these shd be common to home.ts too : figure out how to share common header file
const APPIKO_DUMMY_DEVICE_MAC = 'AA:BB:CC:DD:EE:FF';
const APPIKO_DUMMY_DEVICE_NAME = 'Dummy Device';

// Bluetooth UUIDs
const UUID_SENSE_PI_SERVICE = '3c73dc50-07f5-480d-b066-837407fbde0a';
const UUID_SENSE_BOARD_SETTINGS = '3c73dc51-07f5-480d-b066-837407fbde0a';
const UUID_SENSE_PI_USER_SETTINGS = '3c73dc52-07f5-480d-b066-837407fbde0a';

const FW_VER='1.0';

const CAMERA_MAKE_NIKON=1;
const CAMERA_MAKE_CANON=2;
const CAMERA_MAKE_SONY=3;

const TRIGGER_TIMER = 0;
const TRIGGER_MOTION = 1;

const SENSEPI_SETTINGS_LENGTH=17;

const OFFSET_TRIGGER_SETTING=0;
const OFFSET_PIR_OPER=1;
const OFFSET_PIR_MODE=2;
const OFFSET_PIR_MODE_DATA=3;
const OFFSET_PIR_MODE_DATA_LARGER_VALUE=3;
const OFFSET_PIR_MODE_DATA_SMALLER_VALUE=5;
const OFFSET_PIR_MODE_BURST_GAP=3;
const OFFSET_PIR_MODE_BURST_NUMBER=5;
const OFFSET_PIR_MODE_BULB_EXPOSURE=3;
const OFFSET_PIR_MODE_VIDEO_DURATION=3;
const OFFSET_PIR_MODE_VIDEO_EXTENSION=5;
const OFFSET_PIR_THRESHOLD=6;
const OFFSET_PIR_AMPLIFICATION=7;
const OFFSET_PIR_INTERTRIGGERTIME=8;

const OFFSET_TIMER_INTERVAL=10;
const OFFSET_TIMER_OPER=12;
const OFFSET_TIMER_MODE=13;
const OFFSET_TIMER_MODE_DATA=14;
const OFFSET_TIMER_MODE_DATA_LARGER_VALUE=14;
const OFFSET_TIMER_MODE_DATA_SMALLER_VALUE=16;
const OFFSET_TIMER_MODE_BURST_GAP=14;
const OFFSET_TIMER_MODE_BURST_NUMBER=16;
const OFFSET_TIMER_MODE_BULB_EXPOSURE=14;
const OFFSET_TIMER_MODE_VIDEO_DURATION=14;
const OFFSET_TIMER_MODE_VIDEO_EXTENSION=16;

const DAY_TWILIGHT_THRESHOLD = 12;
const NIGHT_TWILIGHT_THRESHOLD = 31;
const DAY_NIGHT_THRESHOLD = 22;

enum TIME_SETTING {
  NIGHT_ONLY,
  DAY_ONLY,
  DAYNIGHT_BOTH 
}

enum MODE_SETTING {
  TRIGGER_SINGLE,
  TRIGGER_BURST,
  TRIGGER_BULB_EXPOSURE,
  TRIGGER_VIDEO,
  TRIGGER_FOCUS  
}

enum TRIGGER_SETTING {
  TRIGGER_TIMER_ONLY,
  TRIGGER_PIR_ONLY,
  TRIGGER_BOTH  
}

enum HELPER_BTN_ID {
  CAM_TRIGGER_SETTING=0,
  TIMER_INTERVAL,
  OPER_MODE,
  TRIGGER_MODE_PIR,
  TRIGGER_MODE_TIMER,
  SENSITIVITY,
  INTERTRIGGERTIME
}

@Component({
  selector: 'page-detail',
  templateUrl: 'detail.html',
})
export class DetailPage {

  readonly HB_CAM_TRIGGER_SETTING = HELPER_BTN_ID.CAM_TRIGGER_SETTING;
  readonly HB_TIMER_INTERVAL = HELPER_BTN_ID.TIMER_INTERVAL;
  readonly HB_OPER_MODE = HELPER_BTN_ID.OPER_MODE;
  readonly HB_TRIGGER_MODE_PIR = HELPER_BTN_ID.TRIGGER_MODE_PIR;
  readonly HB_TRIGGER_MODE_TIMER = HELPER_BTN_ID.TRIGGER_MODE_TIMER;
  readonly HB_SENSITIVITY = HELPER_BTN_ID.SENSITIVITY;
  readonly HB_INTERTRIGGERTIME = HELPER_BTN_ID.INTERTRIGGERTIME;

  realConnection: boolean = true;

  peripheral: any = {};
    
  //settings : SensePiSettings;
  triggerSetting: number;

  radioClickedTriggerTimer: boolean = false;
  radioClickedTriggerPir: boolean = false;
  radioClickedTriggerBoth: boolean = false;

  timerInterval: number;
  timerIntervalmin: number;
  timerOpertimeSetting: number;
  timerDNTwilight: boolean = false;
  timerShowTwilight : boolean = false;
  timerMode: number;

  timerBurstGap: number;
  timerBurstNumber: number;
  timerBulbExposureTime: number;
  timerVideoDuration: number;
  timerVideoExtension: number;
  radioTimerClickedSingle: boolean = false;
  radioTimerClickedBurst: boolean = false;
  radioTimerClickedBulb: boolean = false;
  radioTimerClickedVideo: boolean = false;
  radioTimerClickedFocus: boolean = false;
  
  pirOpertimeSetting: number;
  pirDNTwilight: boolean = false;
  pirShowTwilight : boolean = false;
  pirMode: number;
  pirBurstGap: number;
  pirBurstNumber: number;
  pirBulbExposureTime: number;
  pirVideoDuration: number;
  pirVideoExtension: number;
  radioPirClickedSingle: boolean = false;
  radioPirClickedBurst: boolean = false;
  radioPirClickedBulb: boolean = false;
  radioPirClickedVideo: boolean = false;
  radioPirClickedFocus: boolean = false;

  pirSensitivity: number;
  pirInterTriggerTime: number;

  sysinfoFwVerMajor: number;
  sysinfoFwVerMinor: number;
  sysinfoFwVerBuild: number;
  sysinfoBattVolt: number;
  sysinfoBattOK: string;
  
  public buttonColor: string = "plain";

  private isMotion: boolean = true;
    
  makes: any[];
  
  make: number;
  
  statusMessage: string;
  
  styling: any = {
    'clickBg': false
  };
  
  initializeVars() {
    this.triggerSetting=1;

    this.timerInterval=50;
    this.timerOpertimeSetting=2;
    this.timerMode=0;
    this.timerBurstGap=0;
    this.timerBurstNumber=0;
    this.timerBulbExposureTime=0;
    this.timerVideoDuration=0;
    this.timerVideoExtension=0;
    
    this.pirOpertimeSetting=2;
    this.pirMode=0;
    this.pirBurstGap=0;
    this.pirBurstNumber=0;
    this.pirBulbExposureTime=0;
    this.pirVideoDuration=0;
    this.pirVideoExtension=0;
    this.pirSensitivity=1;
    this.pirInterTriggerTime=5;

  }

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private ble: BLE,
    private alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private nstorage: NativeStorage,
    private ngZone: NgZone,
    platform: Platform,
    public toastCtrl: ToastController,
    private cd:ChangeDetectorRef) {

      this.initializeVars();
      let device = navParams.get('device');
  
      if (device.name == APPIKO_DUMMY_DEVICE_NAME) {
        this.realConnection = false;
      } else {
        this.realConnection = true;
      }

      if (!this.realConnection) {
        // go stratight to options and disable the write
        this.onConnected(device);
      } else {

        this.setStatus('Connecting to ' + device.name || device.id);
     
        console.log('Present loading control : ')

        let loading = this.loadingCtrl.create({
        content: 'Connecting to device :' + device.name || device.id
        });

        loading.present();
        this.ble.connect(device.id).subscribe(
          peripheral => {
            //pnarasim tbd: disable back during this time. else the connecting loading ctrler shows on home page too
            this.onConnected(peripheral);
            loading.dismiss();
          },
          peripheral => {
            this.showAlert('Disconnected', 'The peripheral unexpectedly disconnected. Please scan and try again.');
            loading.dismiss();
            this.navCtrl.pop();
          }
        );
      }

      this.initializeMakes();
      
    }

    // When connection to the peripheral is successful
    onConnected(peripheral) {
      
      this.peripheral = peripheral;
      this.setStatus('Connected to ' + (peripheral.name || peripheral.id));
      console.log(JSON.stringify(peripheral, null, 2));

      //once connected, read the current config on the device.
      this.ble.read(this.peripheral.id, UUID_SENSE_PI_SERVICE, UUID_SENSE_PI_USER_SETTINGS).then(
        data => {
          console.log("read the config from the sensepi " + JSON.stringify(data)),
          console.log("====================== SETTINGS READ AND LOADED FROM THE DEVICE =================="),
          this.print_settings_arraybufffer(data),
          this.loadDeviceConfigs(data)
        }
      ).catch(
         (e) => console.log("Error trying to read data from service " + UUID_SENSE_PI_SERVICE + " and char " + UUID_SENSE_PI_USER_SETTINGS + " : " + e)
      );

      //once connected, read the current config on the device.
      this.ble.read(this.peripheral.id, UUID_SENSE_PI_SERVICE, UUID_SENSE_BOARD_SETTINGS).then(
        data => {
          console.log("read the sysinfo from the sensepi "),
          console.log("====================== SYSINFO READ =================="),
          this.loadSysInfo(data)
        }
      ).catch(
         (e) => console.log("Error trying to read data from service " + UUID_SENSE_PI_SERVICE + " and char " + UUID_SENSE_PI_USER_SETTINGS + " : " + e)
      );

       setTimeout(() => {
        let data = this.constructArrayBufferToWrite();
        console.log('Uninitiated writeback of existing settings of len' + data.byteLength);
        this.ble.write(this.peripheral.id, UUID_SENSE_PI_SERVICE, UUID_SENSE_PI_USER_SETTINGS, data).then(
          () =>
          {
            this.setStatus('Write Success');
            if(this.triggerSetting == TRIGGER_MOTION){
              this.isMotion = true;
            } else {
              this.isMotion = false;
            }
          },
          //console.log('Wrote all settings to the device = ' + data)
        )
        .catch(
          e => console.log('error in writing to device : ' + e),
        );
      }, 3000);
      
    }
  
    // TIMER Settings
    public setTriggerSetting(event) {
      console.log('triggerSetting : trigger was set to ' + event);
      this.triggerSetting = event;
      switch (+event)  {
        case TRIGGER_SETTING.TRIGGER_TIMER_ONLY : {
          console.log("Trigger mode is TIMER only");
          this.radioClickedTriggerTimer = true;
          this.radioClickedTriggerPir = false;
          this.radioClickedTriggerBoth = false;
          break;
        }
        case TRIGGER_SETTING.TRIGGER_PIR_ONLY : {
          console.log("Trigger mode is MOTION only");
          this.radioClickedTriggerTimer = false;
          this.radioClickedTriggerPir = true;
          this.radioClickedTriggerBoth = false;
          break;
        }
        case TRIGGER_SETTING.TRIGGER_BOTH : {
          console.log("Trigger mode is TIMER + MOTION");
          this.radioClickedTriggerTimer = true;
          this.radioClickedTriggerPir = true;
          this.radioClickedTriggerBoth = true;
          break;
        }
        default :{
          console.log("default trigger?");
          break;
        }
      }
      this.cd.detectChanges();
    }

    public setTimerOpertimeSetting(event) {
      console.log('TIMER : timerOpertimeSetting : time was set to ' + event);
      this.timerOpertimeSetting = event;
      if(event == TIME_SETTING.DAYNIGHT_BOTH) {
        this.timerShowTwilight = false;
      } else {
    this.timerShowTwilight = true;
      }
    }
    
    public resetTimerModes() {
      this.radioTimerClickedSingle = false;
      this.radioTimerClickedBurst = false;
      this.radioTimerClickedBulb = false;
      this.radioTimerClickedVideo = false;
      this.radioTimerClickedFocus = false;
    }

    public setTimerBurstGap(event) {
      //pnarasim : sending data in units of 0.1 - so if user enters 2.5, send 25
      console.log("TIMER: Burst Gap is set to " + this.timerBurstGap);
    }
    
    public setTimerBurstNumber(event) {
      console.log("TIMER: Burst Number of shots is set to " + this.timerBurstNumber);
    }

    public setTimerBulbExposureTime(event) {
      console.log("TIMER: Bulb Exposure Time is set to " + this.timerBulbExposureTime);
    }

    public setTimerVideoDuration(event) {
       console.log("TIMER: Video Duration is set to " + this.timerVideoDuration);
    }

    public setTimerVideoExtension(event) {
       console.log("TIMER: Video Extension is set to " + this.timerVideoExtension);
    }

    public setTimerMode(event) {
      console.log('TIMER : mode : mode selected was ' + event);
      //everytime user selects a different mode, reset all to zero.
      this.resetTimerModes();
      this.timerMode = event;
      switch (+event) {
        case MODE_SETTING.TRIGGER_SINGLE: {
          console.log('TIMER: Radio button SINGLE TRIGGER selected');
          this.radioTimerClickedSingle = true;
          break;
        } 
        case MODE_SETTING.TRIGGER_BURST:{
          console.log('TIMER: Radio button BURST TRIGGER selected');
          this.radioTimerClickedBurst = true;
          console.log('Burst Gap selected as ' + this.timerBurstGap  + ' and burst number of shots is ' + this.timerBurstNumber);
          break;
        }
        case MODE_SETTING.TRIGGER_BULB_EXPOSURE: {
          console.log('TIMER: Radio button BULB EXPPOSURE TRIGGER selected');
          this.radioTimerClickedBulb = true;
          console.log('TIMER: bulbExposureTime set to ' + this.timerBulbExposureTime);
          break;
        }
        case MODE_SETTING.TRIGGER_VIDEO: {
          console.log('TIMER: Radio button VIDEO TRIGGER selected');
          this.radioTimerClickedVideo = true;
          console.log('TIMER: videoDuration = ' + this.timerVideoDuration + ' videoExtension = ' + this.timerVideoExtension);
         break;
        }
        case MODE_SETTING.TRIGGER_FOCUS: {
          console.log('TIMER: Radio button FOCUS TRIGGER selected');
          this.radioTimerClickedFocus = true;
          break;
        }
        default: { 
          break; 
        } 
      }
    }
  
    public setTriggerTimerInterval(event) {
      console.log('Timer: Interval set to ' + this.timerInterval);
    }

    // PIR settings
    public setPirOpertimeSetting(event) {
      console.log('Pir : PirOpertimeSetting : time was set to ' + event);
      this.pirOpertimeSetting = event;
      if(event == TIME_SETTING.DAYNIGHT_BOTH) {
        this.pirShowTwilight = false;
      } else {
    this.pirShowTwilight = true;
      }
    }
   
    public resetPirModes() {
      this.radioPirClickedSingle = false;
      this.radioPirClickedBurst = false;
      this.radioPirClickedBulb = false;
      this.radioPirClickedVideo = false;
      this.radioPirClickedFocus = false;
    }

    public setPirBurstGap(event) {
      console.log("Pir: Burst Gap is set to " + this.pirBurstGap);
    }

    public setPirBurstNumber(event) {
      console.log("Pir: Burst Number of shots is set to " + this.pirBurstNumber);
    }

    public setPirBulbExposureTime(event) {
      console.log("Pir: Bulb Exposure Time is set to " + this.pirBulbExposureTime);
    }

    public setPirVideoDuration(event) {
       console.log("Pir: Video Duration is set to " + this.pirVideoDuration);
    }

    public setPirVideoExtension(event) {
       console.log("Pir: Video Extension is set to " + this.pirVideoExtension);
    }

    public setPirMode(event) {
      console.log('Pir : mode : mode selected was ' + event);
      //everytime user selects a different mode, reset all to zero.
      this.resetPirModes();
      this.pirMode = event;
      switch (+event) {
        case MODE_SETTING.TRIGGER_SINGLE: {
          console.log('Pir: Radio button SINGLE TRIGGER selected');
          this.radioPirClickedSingle = true;
          break;
        } 
        case MODE_SETTING.TRIGGER_BURST:{
          console.log('Pir: Radio button BURST TRIGGER selected');
          this.radioPirClickedBurst = true;
          console.log('Burst Gap selected as ' + this.pirBurstGap + ' and burst number of shots is ' + this.pirBurstNumber);
          break;
        }
        case MODE_SETTING.TRIGGER_BULB_EXPOSURE: {
          console.log('Pir: Radio button BULB EXPPOSURE TRIGGER selected');
          this.radioPirClickedBulb = true;
          console.log('Pir: bulbExposureTime set to ' + this.pirBulbExposureTime);
          break;
        }
        case MODE_SETTING.TRIGGER_VIDEO: {
          console.log('Pir: Radio button VIDEO TRIGGER selected');
          this.radioPirClickedVideo = true;
          console.log('Pir: videoDuration = ' + this.pirVideoDuration + ' videoExtension = ' + this.pirVideoExtension);
         break;
        }
        case MODE_SETTING.TRIGGER_FOCUS: {
          console.log('Pir: Radio button FOCUS TRIGGER selected');
          this.radioPirClickedFocus = true;
          break;
        }
        default: { 
          break; 
        } 
      }
    }

    public setPirSensitivity(event) {
      console.log('Pir: Threshold set to ' + this.pirSensitivity);
    }

    public setPirInterTriggerTime(event) {
      console.log('Pir: Inter Trigger Time set to ' + this.pirInterTriggerTime); 
    }
    
    // To initialize make names for camera attached
    initializeMakes() {
      this.makes = [
        { id: CAMERA_MAKE_CANON, name: 'Canon' },
        { id: CAMERA_MAKE_NIKON, name: 'Nikon' },
        { id: CAMERA_MAKE_SONY, name: 'Sony' }
      ];
    }
    
    public setMake(event) {
      this.make = event.id;
      console.log('Make = ' + event.id + " Make name = " + event.name);
    }

    public loadDeviceConfigs(config) {
      /*
        Read the ArrayBuffer just sent by the board : make this fw version dependent next        
      */

      var dataview = new DataView(config);

      this.triggerSetting = dataview.getUint8(OFFSET_TRIGGER_SETTING);

      if(this.triggerSetting == TRIGGER_MOTION){
        this.isMotion = true;
      } else {
        this.isMotion = false;
      }
      
      switch(dataview.getUint8(OFFSET_PIR_OPER)) {
        case ((DAY_NIGHT_THRESHOLD<<1)+(TIME_SETTING.DAY_ONLY)):
          this.pirShowTwilight = true;
          this.pirDNTwilight = false;
          this.pirOpertimeSetting = TIME_SETTING.DAY_ONLY;
          break;
        case ((DAY_NIGHT_THRESHOLD<<1)+(TIME_SETTING.NIGHT_ONLY)):
          this.pirShowTwilight = true;
          this.pirDNTwilight = false;
          this.pirOpertimeSetting = TIME_SETTING.NIGHT_ONLY;
          break;
        case ((DAY_TWILIGHT_THRESHOLD<<1)+(TIME_SETTING.DAY_ONLY)):
          this.pirShowTwilight = true;
          this.pirDNTwilight = true;
          this.pirOpertimeSetting = TIME_SETTING.DAY_ONLY;
          break;
        case ((NIGHT_TWILIGHT_THRESHOLD<<1)+(TIME_SETTING.NIGHT_ONLY)):
          this.pirShowTwilight = true;
          this.pirDNTwilight = true;
          this.pirOpertimeSetting = TIME_SETTING.NIGHT_ONLY;
          break;
        //This is how day & night is stored
        case TIME_SETTING.DAY_ONLY:
          this.pirShowTwilight = false;
          this.pirDNTwilight = false;
          this.pirOpertimeSetting = TIME_SETTING.DAYNIGHT_BOTH;
          break;
        default:
          this.pirShowTwilight = false;
          this.pirDNTwilight = false;
          this.pirOpertimeSetting = TIME_SETTING.DAYNIGHT_BOTH;
          break;
      }

      this.pirMode = dataview.getUint8(OFFSET_PIR_MODE);
      
      switch (+this.pirMode) {
        case MODE_SETTING.TRIGGER_SINGLE: {
          //no extra data to record.
          break;
        }
        case MODE_SETTING.TRIGGER_BURST: {
          this.pirBurstGap = (dataview.getUint16(OFFSET_PIR_MODE_BURST_GAP, true))/10;
          this.pirBurstNumber = dataview.getUint8(OFFSET_PIR_MODE_BURST_NUMBER);
          break;
        }
        case MODE_SETTING.TRIGGER_BULB_EXPOSURE: {
          this.pirBulbExposureTime = (((dataview.getUint16(OFFSET_PIR_MODE_BULB_EXPOSURE, true)) + (dataview.getUint8(OFFSET_PIR_MODE_BULB_EXPOSURE+2)<<16)))/10;
          break;
        }
        case MODE_SETTING.TRIGGER_VIDEO: {
          this.pirVideoDuration = dataview.getUint16(OFFSET_PIR_MODE_VIDEO_DURATION, true);
          this.pirVideoExtension = dataview.getUint8(OFFSET_PIR_MODE_VIDEO_EXTENSION);
          break;
        }
        default: {
          break;
        }
      } 
      let pirThreshold = dataview.getUint8(OFFSET_PIR_THRESHOLD);
      let pirAmplification = dataview.getUint8(OFFSET_PIR_AMPLIFICATION);

//6. AMP 60 Thresh 100
//5. AMP 40 Thresh 100
//4. AMP 40 Thresh 175
//3. AMP 20 Thresh 175
//2. AMP 20 Thresh 250
//1. AMP 00 Thresh 250
      if(pirThreshold == 250) {
        if(pirAmplification == 0) {
          this.pirSensitivity = 1;
        } else if(pirAmplification == 20) {
          this.pirSensitivity = 2;
        } else {
          this.pirSensitivity = 1;
        }
      } else if(pirThreshold == 175) {
        if(pirAmplification == 20) {
          this.pirSensitivity = 3;
        } else if(pirAmplification == 40) {
          this.pirSensitivity = 4;
        } else {
          this.pirSensitivity = 1;
        }
      } else if(pirThreshold == 100) {
        if(pirAmplification == 40) {
          this.pirSensitivity = 5;
        } else if(pirAmplification == 60) {
          this.pirSensitivity = 6;
        } else {
          this.pirSensitivity = 1;
        }
      } else {
        this.pirSensitivity = 1;
      }

      this.pirInterTriggerTime = (dataview.getUint16(OFFSET_PIR_INTERTRIGGERTIME, true))/10;
      
      //dataview.setUint8(OFFSET_MAKE, this.make); 

      // ==== TIMER SETTINGS ++++
      this.timerInterval = (dataview.getUint16(OFFSET_TIMER_INTERVAL, true))/10;
      
      switch(dataview.getUint8(OFFSET_TIMER_OPER)) {
        case ((DAY_NIGHT_THRESHOLD<<1)+(TIME_SETTING.DAY_ONLY)):
          this.timerShowTwilight = true;
          this.timerDNTwilight = false;
          this.timerOpertimeSetting = TIME_SETTING.DAY_ONLY;
          break;
        case ((DAY_NIGHT_THRESHOLD<<1)+(TIME_SETTING.NIGHT_ONLY)):
          this.timerShowTwilight = true;
          this.timerDNTwilight = false;
          this.timerOpertimeSetting = TIME_SETTING.NIGHT_ONLY;
          break;
        case ((DAY_TWILIGHT_THRESHOLD<<1)+(TIME_SETTING.DAY_ONLY)):
          this.timerShowTwilight = true;
          this.timerDNTwilight = true;
          this.timerOpertimeSetting = TIME_SETTING.DAY_ONLY;
          break;
        case ((NIGHT_TWILIGHT_THRESHOLD<<1)+(TIME_SETTING.NIGHT_ONLY)):
          this.timerShowTwilight = true;
          this.timerDNTwilight = true;
          this.timerOpertimeSetting = TIME_SETTING.NIGHT_ONLY;
          break;
        //This is how day & night is stored
        case TIME_SETTING.DAY_ONLY:
          this.timerShowTwilight = false;
          this.timerDNTwilight = false;
          this.timerOpertimeSetting = TIME_SETTING.DAYNIGHT_BOTH;
          break;
        default:
          this.timerShowTwilight = false;
          this.timerDNTwilight = false;
          this.timerOpertimeSetting = TIME_SETTING.DAYNIGHT_BOTH;
          break;
      }

      this.timerMode = dataview.getUint8(OFFSET_TIMER_MODE);
      
      switch (+this.timerMode) {
        case MODE_SETTING.TRIGGER_SINGLE: {
          //no extra data to record.
          break;
        }
        case MODE_SETTING.TRIGGER_BURST: {
          this.timerBurstGap = (dataview.getUint16(OFFSET_TIMER_MODE_BURST_GAP, true))/10;
          this.timerBurstNumber = dataview.getUint8(OFFSET_TIMER_MODE_BURST_NUMBER);
          break;
        }
        case MODE_SETTING.TRIGGER_BULB_EXPOSURE: {
          this.timerBulbExposureTime = ((dataview.getUint16(OFFSET_TIMER_MODE_BULB_EXPOSURE, true)) + (dataview.getUint8(OFFSET_TIMER_MODE_BULB_EXPOSURE+2)<<16))/10;
          break;
        }
        case MODE_SETTING.TRIGGER_VIDEO: {
          this.timerVideoDuration = dataview.getUint16(OFFSET_TIMER_MODE_VIDEO_DURATION, true);
          this.timerVideoExtension = dataview.getUint8(OFFSET_TIMER_MODE_VIDEO_EXTENSION); 
          break;
        }
        default: {
          break;
        }
      } 
    }

    public loadSysInfo(info) {
      /*
        Read the ArrayBuffer just sent by the board : make this fw version dependent next        
      */

      var dataview = new DataView(info);

      this.sysinfoBattVolt = (dataview.getUint8(16)*3.6/256);
      this.sysinfoBattVolt = parseFloat(this.sysinfoBattVolt.toFixed(2));      
      this.sysinfoFwVerMajor = dataview.getUint8(17);
      this.sysinfoFwVerMinor = dataview.getUint8(18);
      this.sysinfoFwVerBuild = dataview.getUint8(19);

      if(this.sysinfoBattVolt > 2.3)
      {
        this.sysinfoBattOK = '👍';
      } else {
    this.sysinfoBattOK = '👎';
      }

      console.log('sysinfoBattVolt' + this.sysinfoBattVolt + typeof(this.sysinfoBattVolt));
      console.log('sysinfoFwVerMajor' + this.sysinfoFwVerMajor);
      console.log('sysinfoFwVerMinor' + this.sysinfoFwVerMinor);
      console.log('sysinfoFwVerBuild' + this.sysinfoFwVerBuild);
      console.log('sysinfoBattOK' + this.sysinfoBattOK);
 
    }


    public print_settings_arraybufffer(writeBuffer:ArrayBuffer) {

      console.log(Array.prototype.map.call(new Uint8Array(writeBuffer), x => ('00' + x.toString(16)).slice(-2)).join(''));

      var dataview = new DataView(writeBuffer);

      console.log('triggerSetting (1 byte)= ' + dataview.getUint8(OFFSET_TRIGGER_SETTING));
      // == PIR Settings ====
      console.log('PIR OpertimeSetting DN Threshold = ' + (dataview.getUint8(OFFSET_PIR_OPER)>>1));
      console.log('PIR OpertimeSetting DN mode = ' + (dataview.getUint8(OFFSET_PIR_OPER) & 1));

      console.log('PIR mode (1 byte)= ' + dataview.getUint8(OFFSET_PIR_MODE));
      switch(+dataview.getUint8(OFFSET_PIR_MODE)) {
        case MODE_SETTING.TRIGGER_SINGLE: {
          //no extra data to record.
          console.log("PIR Mode Larger Value (2 bytes) =" + dataview.getUint16(OFFSET_PIR_MODE_DATA_LARGER_VALUE, true));
          console.log("PIR Mode Smaller Value (1 bytes) =" + dataview.getUint8(OFFSET_PIR_MODE_DATA_SMALLER_VALUE));
          break;
        }
        case MODE_SETTING.TRIGGER_BURST: {
          console.log("PIR BurstGap (2 bytes)= " + dataview.getUint16(OFFSET_PIR_MODE_BURST_GAP, true));
          console.log("PIR BurstNumber (1 byte)= " + dataview.getUint8(OFFSET_PIR_MODE_BURST_NUMBER));
          break;
        }
        case MODE_SETTING.TRIGGER_BULB_EXPOSURE: {
          console.log("PIR BulbExposureTime = (3 bytes)" + 
            ((dataview.getUint16(OFFSET_PIR_MODE_BULB_EXPOSURE, true)) + (dataview.getUint8(OFFSET_PIR_MODE_BULB_EXPOSURE+2)<<16)));
          break;
        }
        case MODE_SETTING.TRIGGER_VIDEO: {
          console.log("PIR VideoDuration = (2 bytes)" + dataview.getUint16(OFFSET_PIR_MODE_VIDEO_DURATION, true) + " VideoExtension (1 byte)= " + dataview.getUint8(OFFSET_PIR_MODE_VIDEO_EXTENSION)); 
          break;
        }
        default: {
          break;
        }
      
      }
    
      console.log('PIR Threshold (1 byte)= ' + dataview.getUint8(OFFSET_PIR_THRESHOLD));
      console.log('PIR Amplification (1 byte)= ' + dataview.getUint8(OFFSET_PIR_AMPLIFICATION));
      console.log('PIR InterTriggerTime (2 bytes)= ' + dataview.getUint16(OFFSET_PIR_INTERTRIGGERTIME, true));
      
      // === TIMER Settings ===
      console.log('TIMER timerInterval (2 bytes)= ' + dataview.getUint16(OFFSET_TIMER_INTERVAL, true));

      console.log('TIMER OpertimeSetting DN threshold = ' + (dataview.getUint8(OFFSET_TIMER_OPER)>>1));
      console.log('TIMER OpertimeSetting DN mode = ' + (dataview.getUint8(OFFSET_TIMER_OPER)&1));
      
      console.log('TIMER mode (1 byte)= ' + dataview.getUint8(OFFSET_TIMER_MODE));
      switch(+dataview.getUint8(OFFSET_TIMER_MODE)) {
        case MODE_SETTING.TRIGGER_SINGLE: {
          //no extra data to record.
          console.log("TIMER Mode Larger Value (2 bytes)=" + dataview.getUint16(OFFSET_TIMER_MODE_DATA_LARGER_VALUE, true));
          console.log("TIMER Mode Smaller Value (1 byte)=" + dataview.getUint8(OFFSET_TIMER_MODE_DATA_SMALLER_VALUE));
          break;
        }
        case MODE_SETTING.TRIGGER_BURST: {
          console.log("TIMER BurstGap (2 bytes)= " + dataview.getUint16(OFFSET_TIMER_MODE_BURST_GAP, true));
          console.log("TIMER BurstNumber (1 byte)= " + dataview.getUint8(OFFSET_TIMER_MODE_BURST_NUMBER));
          break;
        }
        case MODE_SETTING.TRIGGER_BULB_EXPOSURE: {
          console.log("TIMER BulbExposureTime (3 bytes) = " + 
            ((dataview.getUint16(OFFSET_TIMER_MODE_BULB_EXPOSURE, true))+(dataview.getUint8(OFFSET_TIMER_MODE_BULB_EXPOSURE+2)<<16)));
          break;
        }
        case MODE_SETTING.TRIGGER_VIDEO: {
          console.log("TIMER VideoDuration (2 bytes)= " + dataview.getUint16(OFFSET_TIMER_MODE_VIDEO_DURATION, true) + " VideoExtension (1 byte)= " + dataview.getUint8(OFFSET_TIMER_MODE_VIDEO_EXTENSION)); 
          break;
        }
        default: {
          break;
        }
      
      }
    
      console.log("===========================================")
    }

    
    public constructArrayBufferToWrite():ArrayBuffer {
      /*
        Format of ArrayBuffer that the board expects : make this fw version dependent next        
      */

      let writeBuffer = new ArrayBuffer(SENSEPI_SETTINGS_LENGTH);
      var dataview = new DataView(writeBuffer);

      //start writing the values
      
      dataview.setUint8(OFFSET_TRIGGER_SETTING, this.triggerSetting);

      // ==== PIR SETTINGS ++++
      let pirOperTimeVal;
      if (this.pirOpertimeSetting == TIME_SETTING.DAYNIGHT_BOTH) {
        pirOperTimeVal = 1;
      } else if (this.pirOpertimeSetting == TIME_SETTING.DAY_ONLY) {
        if(this.pirDNTwilight == true) {
          pirOperTimeVal = ((DAY_TWILIGHT_THRESHOLD<<1) + (this.pirOpertimeSetting&0x01));
        } else {
          pirOperTimeVal = ((DAY_NIGHT_THRESHOLD<<1) + (this.pirOpertimeSetting&0x01));
        }
      } else if (this.pirOpertimeSetting == TIME_SETTING.NIGHT_ONLY) {
        if(this.pirDNTwilight == true) {
          pirOperTimeVal = ((NIGHT_TWILIGHT_THRESHOLD<<1) + (this.pirOpertimeSetting&0x01));
        } else {
          pirOperTimeVal = ((DAY_NIGHT_THRESHOLD<<1) + (this.pirOpertimeSetting&0x01));
        }
      }
      dataview.setUint8(OFFSET_PIR_OPER, pirOperTimeVal);
      console.log('PIR DNT = ' + (pirOperTimeVal>>1) + ' + ' + this.pirOpertimeSetting + ' = ' + (pirOperTimeVal));

      dataview.setUint8(OFFSET_PIR_MODE,this.pirMode);
      
      switch (+this.pirMode) {
        case MODE_SETTING.TRIGGER_SINGLE: {
          //no extra data to record.
          dataview.setUint16(OFFSET_PIR_MODE_DATA_LARGER_VALUE, 0);
          dataview.setUint8(OFFSET_PIR_MODE_DATA_SMALLER_VALUE, 0);
          break;
        }
        case MODE_SETTING.TRIGGER_BURST: {
          dataview.setUint16(OFFSET_PIR_MODE_BURST_GAP, (this.pirBurstGap*10), true);
          dataview.setUint8(OFFSET_PIR_MODE_BURST_NUMBER, this.pirBurstNumber);
          break;
        }
        case MODE_SETTING.TRIGGER_BULB_EXPOSURE: {
          dataview.setUint16(OFFSET_PIR_MODE_BULB_EXPOSURE, ((this.pirBulbExposureTime*10)&0xFFFF), true);
          dataview.setUint8(OFFSET_PIR_MODE_BULB_EXPOSURE+2, ((this.pirBulbExposureTime*10) >>16));
          break;
        }
        case MODE_SETTING.TRIGGER_VIDEO: {
          dataview.setUint16(OFFSET_PIR_MODE_VIDEO_DURATION, this.pirVideoDuration, true);
          dataview.setUint8(OFFSET_PIR_MODE_VIDEO_EXTENSION, this.pirVideoExtension); 
          break;
        }
        default: {
          break;
        }
      }
      let pirThreshold;
      let pirAmplification;

      switch(this.pirSensitivity) {
        case 1:
          pirThreshold = 250;
          pirAmplification = 0;
          break;
        case 2:
          pirThreshold = 250;
          pirAmplification = 20;
          break;
        case 3:
          pirThreshold = 175;
          pirAmplification = 20;
          break;
        case 4:
          pirThreshold = 175;
          pirAmplification = 40;
          break;
        case 5:
          pirThreshold = 100;
          pirAmplification = 40;
          break;
        case 6:
          pirThreshold = 100;
          pirAmplification = 60;
          break;
        default:
          pirThreshold = 250;
          pirAmplification = 0;
          break;
      }


      dataview.setUint8(OFFSET_PIR_THRESHOLD, pirThreshold);
      dataview.setUint8(OFFSET_PIR_AMPLIFICATION, pirAmplification);
      dataview.setUint16(OFFSET_PIR_INTERTRIGGERTIME, (this.pirInterTriggerTime*10), true); 
      
      //dataview.setUint8(OFFSET_MAKE, this.make); 

      // ==== TIMER SETTINGS ++++
      dataview.setUint16(OFFSET_TIMER_INTERVAL, (this.timerInterval*10), true);
      

      let timerOperTimeVal;
      if (this.timerOpertimeSetting == TIME_SETTING.DAYNIGHT_BOTH) {
        timerOperTimeVal = 1;
      } else if (this.timerOpertimeSetting == TIME_SETTING.DAY_ONLY) {
        if(this.timerDNTwilight == true) {
          timerOperTimeVal = ((DAY_TWILIGHT_THRESHOLD<<1) + (this.timerOpertimeSetting&0x01));
        } else {
          timerOperTimeVal = ((DAY_NIGHT_THRESHOLD<<1) + (this.timerOpertimeSetting&0x01));
        }
      } else if (this.timerOpertimeSetting == TIME_SETTING.NIGHT_ONLY) {
        if(this.timerDNTwilight == true) {
          timerOperTimeVal = ((NIGHT_TWILIGHT_THRESHOLD<<1) + (this.timerOpertimeSetting&0x01));
        } else {
          timerOperTimeVal = ((DAY_NIGHT_THRESHOLD<<1) + (this.timerOpertimeSetting&0x01));
        }
      }
      dataview.setUint8(OFFSET_TIMER_OPER, timerOperTimeVal);
      console.log('PIR DNT = ' + (timerOperTimeVal>>1) + ' + ' + this.timerOpertimeSetting + ' = ' +
          (timerOperTimeVal));
      
      dataview.setUint8(OFFSET_TIMER_MODE,this.timerMode);
      
      switch (+this.timerMode) {
        case MODE_SETTING.TRIGGER_SINGLE: {
          //no extra data to record.
          dataview.setUint16(OFFSET_TIMER_MODE_DATA_LARGER_VALUE, 0);
          dataview.setUint8(OFFSET_TIMER_MODE_DATA_SMALLER_VALUE, 0);
          break;
        }
        case MODE_SETTING.TRIGGER_BURST: {
          dataview.setUint16(OFFSET_TIMER_MODE_BURST_GAP, (this.timerBurstGap*10), true);
          dataview.setUint8(OFFSET_TIMER_MODE_BURST_NUMBER, this.timerBurstNumber);
          break;
        }
        case MODE_SETTING.TRIGGER_BULB_EXPOSURE: {
          dataview.setUint16(OFFSET_TIMER_MODE_BULB_EXPOSURE, ((this.timerBulbExposureTime*10)&0xFFFF), true);
          dataview.setUint8(OFFSET_TIMER_MODE_BULB_EXPOSURE+2, ((this.timerBulbExposureTime*10)>>16));
          break;
        }
        case MODE_SETTING.TRIGGER_VIDEO: {
          dataview.setUint16(OFFSET_TIMER_MODE_VIDEO_DURATION, this.timerVideoDuration, true);
          dataview.setUint8(OFFSET_TIMER_MODE_VIDEO_EXTENSION, this.timerVideoExtension); 
          break;
        }
        default: {
          break;
        }
      } 

      console.log("===============SETTINGS THAT WILL BE WRITTEN TO THE DEVICE ============================")
      this.print_settings_arraybufffer(writeBuffer);
      
      return writeBuffer;

    }

    onButtonClickSaveSettings(event) {
      // save all the current settings
      console.log("Saving all current values to default profile"); 
      this.nstorage.setItem('TRIGGER_SETTING', this.triggerSetting);
      this.nstorage.setItem('TIMER_INTERVAL', this.timerInterval);
      this.nstorage.setItem('TIMER_OPERSETTING', this.timerOpertimeSetting);
      this.nstorage.setItem('TIMER_MODE', this.timerMode);
      this.nstorage.setItem('TIMER_BURSTGAP', this.timerBurstGap);
      this.nstorage.setItem('TIMER_BURSTNUMBER', this.timerBurstNumber);
      this.nstorage.setItem('TIMER_BULBEXPOSURE', this.timerBulbExposureTime);
      this.nstorage.setItem('TIMER_VIDEODURATION', this.timerVideoDuration);
      this.nstorage.setItem('TIMER_VIDEO_EXTENSION', this.timerVideoExtension);
      this.nstorage.setItem('PIR_OPERSETTING', this.pirOpertimeSetting);
      this.nstorage.setItem('PIR_MODE', this.pirMode);
      this.nstorage.setItem('PIR_BURSTGAP', this.pirBurstGap);
      this.nstorage.setItem('PIR_BURSTNUMBER', this.pirBurstNumber);
      this.nstorage.setItem('PIR_BULBEXPOSURE', this.pirBulbExposureTime);
      this.nstorage.setItem('PIR_VIDEODURATION', this.pirVideoDuration);
      this.nstorage.setItem('PIR_VIDEOEXTENSION', this.pirVideoExtension);
      this.nstorage.setItem('PIR_INTERTRIGGERTIME', this.pirInterTriggerTime);
    }


    async onButtonClickPopSettings(event) {
      console.log("Popping all settings from saved/default profile");
      this.triggerSetting = await this.nstorage.getItem('TRIGGER_SETTING');

      this.timerInterval = await this.nstorage.getItem('TIMER_INTERVAL');
      this.timerOpertimeSetting = await this.nstorage.getItem('TIMER_OPERSETTING');
      this.timerMode = await this.nstorage.getItem('TIMER_MODE');
      this.timerBurstGap = await this.nstorage.getItem('TIMER_BURSTGAP');
      this.timerBurstNumber = await this.nstorage.getItem('TIMER_BURSTNUMBER');
      this.timerBulbExposureTime = await this.nstorage.getItem('TIMER_BULBEXPOSURE');
      this.timerVideoDuration = await this.nstorage.getItem('TIMER_VIDEODURATION');
      this.timerVideoExtension = await this.nstorage.getItem('TIMER_VIDEO_EXTENSION');
      this.pirOpertimeSetting = await this.nstorage.getItem('PIR_OPERSETTING');
      this.pirMode = await this.nstorage.getItem('PIR_MODE');
      this.pirBurstGap = await this.nstorage.getItem('PIR_BURSTGAP');
      this.pirBurstNumber = await this.nstorage.getItem('PIR_BURSTNUMBER');
      this.pirBulbExposureTime = await this.nstorage.getItem('PIR_BULBEXPOSURE');
      this.pirVideoDuration = await this.nstorage.getItem('PIR_VIDEODURATION');
      this.pirVideoExtension = await this.nstorage.getItem('PIR_VIDEOEXTENSION');
      this.pirInterTriggerTime = await this.nstorage.getItem('PIR_INTERTRIGGERTIME');
      
    }
    
    // To write the value of each characteristic to the device 
    onButtonClickWrite(event) {

      let data = this.constructArrayBufferToWrite();  
      console.log("Size of buffer being written is " + data.byteLength);    
      this.ble.write(this.peripheral.id, UUID_SENSE_PI_SERVICE, UUID_SENSE_PI_USER_SETTINGS, data).then(
        () => 
        {
          this.setStatus('Write Success');
          if(this.triggerSetting == TRIGGER_MOTION){
            this.isMotion = true;
          } else {
            this.isMotion = false;
          }
        },
        //console.log('Wrote all settings to the device = ' + data)
      )
      .catch(
        e => console.log('error in writing to device : ' + e),
      );
    }
    
    //Disconnect from the connected peripheral
    disconnectSensePiBLE() {
      if (!this.realConnection) {
        console.log("Leaving, no ble to disconnect");
        return;
      }
      console.log('ionViewWillLeave disconnecting Bluetooth');


      this.ble.disconnect(this.peripheral.id).then(
        () => console.log('Disconnected ' + JSON.stringify(this.peripheral)),
        () => console.log('ERROR disconnecting ' + JSON.stringify(this.peripheral))
      )
    }

    // To write the value of each characteristic to the device 
    onButtonClickClose(event) {
      if(this.isMotion){
        this.showToast('Red light will blink on detecting motion for 10 minutes');
      }
      this.navCtrl.pop();
    }

    // Disconnect peripheral when leaving the page
    ionViewWillLeave() {
      this.disconnectSensePiBLE();
    }

    helperBtnClick(id) {
      switch(id) {
        case HELPER_BTN_ID.CAM_TRIGGER_SETTING:
          this.showAlert(CAM_TRIGGER_SETTING_HEAD, CAM_TRIGGER_SETTING_TEXT);
          break;
        case HELPER_BTN_ID.TIMER_INTERVAL:
          this.showAlert(TIMER_INTERVAL_HEAD, TIMER_INTERVAL_TEXT);
          break;
        case HELPER_BTN_ID.OPER_MODE:
          this.showAlert(OPER_MODE_HEAD, OPER_MODE_TEXT);
          break;
        case HELPER_BTN_ID.TRIGGER_MODE_PIR:
          this.showAlert(TRIGGER_MODE_PIR_HEAD, TRIGGER_MODE_PIR_TEXT);
          break;
        case HELPER_BTN_ID.TRIGGER_MODE_TIMER:
          this.showAlert(TRIGGER_MODE_TIMER_HEAD, TRIGGER_MODE_TIMER_TEXT);
          break;
        case HELPER_BTN_ID.SENSITIVITY:
          this.showAlert(SENSITIVITY_HEAD, SENSITIVITY_TEXT);
          break;
        case HELPER_BTN_ID.INTERTRIGGERTIME:
          this.showAlert(INTERTRIGGERTIME_HEAD, INTERTRIGGERTIME_TEXT);
          break;
      }
    }

    showToast(msg: string) {
      let toast = this.toastCtrl.create({
        message: msg,
        duration: 2000,
        position: 'middle'
      });
      toast.present();
    }

    // To alert messages on the screen
    showAlert(title, message) {
      let alert = this.alertCtrl.create({
        title: title,
        subTitle: message,
        buttons: ['OK']
      });
      alert.present();
    }
    
    // Display messages in the footer
    setStatus(message) {
      console.log(message);
      this.ngZone.run(() => {
        this.statusMessage = message;
      });
    }
    
  }
