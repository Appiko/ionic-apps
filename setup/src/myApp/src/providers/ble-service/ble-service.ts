import { Injectable } from "@angular/core";
import { BLE } from "@ionic-native/ble";
import { BeConfig, HardwareInfo } from "../BeConfig";

/*
  Generated class for the BleServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
	*/
const UUID_SENSE_BE_SERVICE = "3c73dc60-07f5-480d-b066-837407fbde0a";
const UUID_SENSE_BE_USER_SETTINGS = "3c73dc62-07f5-480d-b066-837407fbde0a";
const UUID_SENSE_BE_BOARD_SETTINGS = "3c73dc61-07f5-480d-b066-837407fbde0a";
const SENSEBE_SETTINGS_LENGTH = 19;

@Injectable()
export class BleServiceProvider {
  peripheral: any;
  config: BeConfig;

  /**
   * OFFSETS
   */
  TriggerConfigurationOffset = 0; //Mode 0- Timer only ; 1- Motion only

  /* Motion Offsets*/
  MotionOperationTimeOffset = 1; // use 01
  MotionSensitivityOffset = 2; //use Uint16 and inset value  100/250/500/1000
  MotionPreFocusAndModeOffset = 4; // PreFocus- (1 bit) ; Mode (7bits) [0-4]
  MotionParamOneOffset = 5; // 16 bits
  MotionParamTwoOffset = 7; // 8 bits
  MotionTriggerTimeOffset = 8; // 16bits

  /* Timer Offsets */
  TimerTimeIntervalOffset = 10; // 16bits
  TimerOperationTimeOffset = 12; // use 01 //TODO:  
  TimerPreFocusAndModeOffset = 13; // PreFocus- (1 bit) ; Mode (7bits) [0-4]
  TimerParamOneOffset = 14; // 16 bits
  TimerParamTwoOffset = 16; // 8 bits

  /* IR Trans */
  IRTxTimerOffset = 17;
  IRTxConfigOffset = 18; //8bit {Prefocus = 1bit, Speed = 2bits[TODO:], Distance = 2bits[TODO:]} //default values

  constructor(private ble: BLE) {
    console.log("Hello BleServiceProvider Provider");
  }
  async getData(peripheral, fn) {
    this.peripheral = peripheral;
    console.log(`Connected to  ${peripheral.name || peripheral.id}`);
    console.log(JSON.stringify(peripheral, null, 2));

    //once connected, read the current config on the device.
    this.ble
      .read(
        this.peripheral.id,
        UUID_SENSE_BE_SERVICE,
        UUID_SENSE_BE_USER_SETTINGS
      )
      .then(data => {
        console.log("DEVICE ID ===" + peripheral.id);
        console.log("read the config from the senseBe " + JSON.stringify(data)),
          console.log(
            "====================== SETTINGS READ AND LOADED FROM THE DEVICE =================="
          );
        fn(this.printAndGetConfiguration(data));
      })
      .catch(e => console.log(`Error trying to read data from service ${e}`));
  }
  getSysInfo(fn) {
    //once connected, read the current config on the device.
    this.ble
      .read(
        this.peripheral.id,
        UUID_SENSE_BE_SERVICE,
        UUID_SENSE_BE_BOARD_SETTINGS
      )
      .then(data => {
        console.log("read the sysinfo from the sensepi "),
          console.log("====================== SYSINFO READ ==================");
        fn(this.loadSysInfo(data));
      })
      .catch(e => console.log(`Error trying to read data from service ${e}`));
  }
  loadSysInfo(info): HardwareInfo {
    var dataview = new DataView(info);

    let sysinfoBattVolt = (dataview.getUint8(16) * 3.6) / 256;
    sysinfoBattVolt = parseFloat(sysinfoBattVolt.toFixed(2));
    let hardwareInfo: HardwareInfo = {
      version: `${dataview.getUint8(17)}.${dataview.getUint8(
        18
      )}.${dataview.getUint8(19)}`,
      batteryInVolts: sysinfoBattVolt
    };

    return hardwareInfo;
  }

  printAndGetConfiguration(writeBuffer: ArrayBuffer): BeConfig {
    console.log(
      Array.prototype.map
        .call(new Uint8Array(writeBuffer), x =>
          ("00" + x.toString(16)).slice(-2)
        )
        .join(" ")
    );

    let dataview = new DataView(writeBuffer);
    let motionMode = dataview.getUint8(this.MotionPreFocusAndModeOffset) >> 0x1;
    let motionParamOne = dataview.getUint16(this.MotionParamOneOffset, true);
    let timerMode = dataview.getUint8(this.TimerPreFocusAndModeOffset) >> 0x1;
    let timerParamOne = dataview.getUint16(this.TimerParamOneOffset, true);
    if (motionMode == 1 || motionMode == 2) {
      motionParamOne /= 10;
    }
    if (timerMode == 1 || timerMode == 2) {
      timerParamOne /= 10;
    }
    this.config = {
      triggerMode: dataview.getUint8(this.TriggerConfigurationOffset),
      motion: {
        motionOpertationTime: dataview.getUint8(this.MotionOperationTimeOffset),
        motionSensitivity: dataview.getUint16(
          this.MotionSensitivityOffset,
          true
        ),
        camConfig: {
          preFocus: dataview.getUint8(this.MotionPreFocusAndModeOffset) & 0x1,
          mode: motionMode,
          paramOne: motionParamOne,
          paramTwo: dataview.getUint8(this.MotionParamTwoOffset)
        },
        motionTriggerTime: dataview.getUint16(
          this.MotionTriggerTimeOffset,
          true
        )/10
      },
      timer: {
        timeOperationTime: dataview.getUint8(this.TimerOperationTimeOffset),
        timerTimeInterval: dataview.getUint16(
          this.TimerTimeIntervalOffset,
          true
        )/10,
        camConfig: {
          preFocus: dataview.getUint8(this.TimerPreFocusAndModeOffset) & 0x1,
          mode: timerMode,
          paramOne: timerParamOne,
          paramTwo: dataview.getUint8(this.TimerParamTwoOffset)
        }
      },
      ir: {
        IRTxTimer: dataview.getUint8(this.IRTxTimerOffset),
        IRTxEnabled: dataview.getUint8(this.IRTxConfigOffset) & 0x1,
        IRTxSpeed: (dataview.getUint8(this.IRTxConfigOffset) >> 1) & 0x11,
        IRtxDist: dataview.getUint8(this.IRTxConfigOffset) >> 3
      }
    };

    if (dataview.getUint8(this.MotionPreFocusAndModeOffset) >> 0x1 == 1)
      console.log(JSON.stringify(this.config, undefined, 4));
    return this.config;
  }

  disconnectBE() {
    console.log("ionViewWillLeave disconnecting Bluetooth");
    if (this.peripheral.id !== undefined) {
      this.ble
        .disconnect(this.peripheral.id)
        .then(() =>
          console.log("Disconnected " + JSON.stringify(this.peripheral))
        )
        .catch(e => {
          console.log("Error Disconnecting");
        });
    }
  }
  write(
    config: {
      triggerMode: BeConfig["triggerMode"];
      motion: BeConfig["motion"];
      timer: BeConfig["timer"];
      ir: BeConfig["ir"];
    },
    fn
  ) {
    let data = this.createArrayBufferToWrite(config);
    this.ble
      .write(
        this.peripheral.id,
        UUID_SENSE_BE_SERVICE,
        UUID_SENSE_BE_USER_SETTINGS,
        data
      )
      .then(fn(true))
      .catch(e => {
        fn(false);
        console.log(e);
      });
  }
  createArrayBufferToWrite(config: BeConfig): ArrayBuffer {
    console.log(JSON.stringify(config, undefined, 2));
    let writeBuffer = new ArrayBuffer(SENSEBE_SETTINGS_LENGTH);
    let dataview = new DataView(writeBuffer);
    let motionMode = config.motion.camConfig.mode;
    let motionParamOne = config.motion.camConfig.paramOne;
    let timerMode = config.timer.camConfig.mode;
    let timerParamOne = config.timer.camConfig.paramOne;
    if (motionMode == 1 || motionMode == 2) {
      motionParamOne *= 10;
    }
    if (timerMode == 1 || timerMode == 2) {
      timerParamOne *= 10;
    }
    dataview.setUint8(this.TriggerConfigurationOffset, config.triggerMode);
    dataview.setUint8(this.MotionOperationTimeOffset, 1);
    dataview.setUint16(
      this.MotionSensitivityOffset,
      config.motion.motionSensitivity,
      true
    );
    dataview.setUint8(
      this.MotionPreFocusAndModeOffset,
      (motionMode << 1) + config.motion.camConfig.preFocus
    );
    dataview.setInt16(this.MotionParamOneOffset, motionParamOne, true);
    dataview.setUint8(
      this.MotionParamTwoOffset,
      config.motion.camConfig.paramTwo
    );
    dataview.setUint16(
      this.MotionTriggerTimeOffset,
      10*config.motion.motionTriggerTime,
      true
    );
    dataview.setUint8(this.TimerOperationTimeOffset, 1);
    dataview.setUint16(
      this.TimerTimeIntervalOffset,
      10*config.timer.timerTimeInterval,
      true
    );
    dataview.setUint8(
      this.TimerPreFocusAndModeOffset,
      (timerMode << 1) + config.timer.camConfig.preFocus
    );
    dataview.setUint16(this.TimerParamOneOffset, timerParamOne, true);
    dataview.setUint8(
      this.TimerParamTwoOffset,
      config.timer.camConfig.paramTwo
    );
    dataview.setUint8(this.IRTxTimerOffset, 1);
    dataview.setUint8(
      this.IRTxConfigOffset,
      (config.ir.IRTxEnabled << 0) |
        (config.ir.IRTxSpeed << 1) |
        (config.ir.IRtxDist << 3)
    );

    return writeBuffer;
  }
}
