export interface BeConfig {
  triggerMode: number;
  deviceSpeed: number;
  is09: boolean;
  isRx: boolean;
  motion: {
    ambientOptions: AmbientOptions;
    motionSensitivity: number;
    motionTriggerTime: number;
    camConfig: CamConfig;
  };
  timer: {
    ambientOptions: AmbientOptions;
    timerTimeInterval: number;
    camConfig: CamConfig;
  };
  ir: {
    ambientOptions: AmbientOptions;
    IRTxEnabled: number;
    IRTxSpeed: number;
    IRtxDist: number;
    IRValue: string;
  };
}
export interface CamConfig {
  preFocus: number;
  mode: number;
  paramOne: number;
  paramTwo: number;
}

export interface HardwareInfo {
  version: string;
  batteryInVolts: number;
  IRValue: string;
}

export interface AmbientOptions {
  aboveThreshold: boolean;
  threshold: number;
}
