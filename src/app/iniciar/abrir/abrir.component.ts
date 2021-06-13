import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import * as secrets from 'secrets.js-grempe';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-abrir',
  templateUrl: './abrir.component.html',
  styleUrls: ['./abrir.component.css']
})
export class AbrirComponent implements OnInit {

  numClaves: number = 0;
  claves: string[] = [];
  errorClaves: Boolean = false;
  palabras: string;
  errorPalabras: Boolean = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  irWallet(): void{
    if (this.palabras === "" || this.palabras === undefined){
      this.errorPalabras = true;
      return;
    }

    const arrayPalabras: string[] = this.palabras.split(' ');
    if (arrayPalabras.length !== 12){//TODO: los espacios son palabras 
      this.errorPalabras = true;
      return;
    }

    let i: number = 0;
    while (i < 12){
      if (arrayPalabras[i] === ""){
        this.errorPalabras = true;
        return;
      }
      else
        i++;
    }

    this.errorPalabras = false;
    environment.login = true;
    const navigationExtras: NavigationExtras = {
      state: {
        palabras: this.palabras
      }
    };
    this.router.navigate(['/wallet'], navigationExtras);
  }
  
  setLenClaves(): void {
  }

  getSecreto(): void {
  }
}
