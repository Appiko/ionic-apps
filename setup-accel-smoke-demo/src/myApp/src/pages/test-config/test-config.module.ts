import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TestConfigPage } from './test-config';

@NgModule({
  declarations: [
    TestConfigPage,
  ],
  imports: [
    IonicPageModule.forChild(TestConfigPage),
  ],
})
export class TestConfigPageModule {}
