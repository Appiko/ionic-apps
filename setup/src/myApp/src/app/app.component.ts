import { Component, ViewChild } from "@angular/core";
import { Nav, Platform, App } from "ionic-angular";
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";

import { HomePage } from "../pages/home/home";
import { AboutPage } from "../pages/about/about";
import { HelpPage } from "../pages/help/help";
import { TestConfigPage } from "../pages/test-config/test-config";
import { BleServiceProvider } from "../providers/ble-service/ble-service";

@Component({
  templateUrl: "app.html"
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  pages: Array<{ title: string; component: any }>;

  constructor(
    public platform: Platform,
    public app: App,
    public bleService: BleServiceProvider,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen
  ) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: "Home", component: HomePage },
      { title: "About", component: AboutPage },
      { title: "Help", component: HelpPage },
      { title: "Test Config", component: TestConfigPage }
    ];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  // Adding functionality to the Android back button
  openPage(page) {
    if (page.component == HomePage) {
      this.nav.setRoot(HomePage);
    } else {
      this.nav.push(page.component);
    }
  }
}
