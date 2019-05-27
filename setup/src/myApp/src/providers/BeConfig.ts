export interface BeConfig {
  triggerMode: number;
  motion: {
    motionOpertationTime: number;
    motionSensitivity: number;
    motionTriggerTime: number;
    camConfig: CamConfig;
  };
  timer: {
    timeOperationTime: number;
    timerTimeInterval: number;
    camConfig: CamConfig;
  };
  ir: {
    IRTxTimer: number;
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
