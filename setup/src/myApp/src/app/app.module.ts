import { BrowserModule } from "@angular/platform-browser";
import { ErrorHandler, NgModule } from "@angular/core";
import { IonicApp, IonicErrorHandler, IonicModule } from "ionic-angular";
import { BLE } from "@ionic-native/ble";
import { NativeStorage } from "@ionic-native/native-storage";

import { MyApp } from "./app.component";
import { HomePage } from "../pages/home/home";
import { DetailPage } from "../pages/detail/detail";
import { AboutPage } from "../pages/about/about";
import { HelpPage } from "../pages/help/help";
import { TestConfigPage } from "../pages/test-config/test-config";

import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { BeDetailPage } from "../pages/be-detail/be-detail";
import { ComponentsModule } from "../components/components.module";
import { HelpModalProvider } from "../providers/help-modal/help-modal";
import { BleServiceProvider } from "../providers/ble-service/ble-service";
import { DebugPage } from "../pages/debug/debug";

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    DetailPage,
    BeDetailPage,
    AboutPage,
    HelpPage,
    TestConfigPage,
    DebugPage
  ],
  imports: [BrowserModule, ComponentsModule, IonicModule.forRoot(MyApp)],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    DetailPage,
    BeDetailPage,
    AboutPage,
    HelpPage,
    TestConfigPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    NativeStorage,
    BLE,
    HelpModalProvider,
    BleServiceProvider
  ]
})
export class AppModule {}
