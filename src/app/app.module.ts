import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './iniciar/login/login.component';
import { PrincipalComponent } from './principal/principal.component';
import { CrearComponent } from './iniciar/crear/crear.component';
import { AbrirComponent } from './iniciar/abrir/abrir.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PrincipalComponent,
    CrearComponent,
    AbrirComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
