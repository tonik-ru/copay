import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewssearchPage } from './newssearch';

@NgModule({
  declarations: [
    NewssearchPage,
  ],
  imports: [
    IonicPageModule.forChild(NewssearchPage),
  ],
})
export class NewssearchPageModule {}
