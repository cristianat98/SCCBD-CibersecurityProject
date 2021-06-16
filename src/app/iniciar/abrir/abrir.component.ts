import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import * as secrets from 'shamirs-secret-sharing-ts';
import { environment } from 'src/environments/environment';
import { ethers } from 'ethers';
import * as bigintConversion from 'bigint-conversion';

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
  errorWallet: Boolean = false;
  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  irWallet(): void{
    if (this.palabras === "" || this.palabras === undefined){
      this.errorPalabras = true;
      return;
    }

    const arrayPalabras: string[] = this.palabras.split(' ');
    if (arrayPalabras.length !== 12){ 
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
    if (this.numClaves > 0)
      this.claves.length = this.numClaves;
  }

  getSecreto(): void {
    let i: number = 0;
    let encontrado: Boolean = false;
    this.errorWallet = false;
    while (i<this.claves.length && !encontrado){
      if (this.claves[i] === "")
        encontrado = true;

      i++;
    }

    if (encontrado){
      this.errorClaves = true;
      return
    }

    let clavesBuffer: Buffer[] = []; 
    this.claves.forEach((clave: string) => {
      clavesBuffer.push(Buffer.from(new Uint8Array(bigintConversion.hexToBuf(clave))));
    });

    const semillaBuffer: Buffer = secrets.combine(clavesBuffer);
    const semilla: Uint8Array = Uint8Array.from(semillaBuffer);
    try{
      this.palabras = ethers.utils.entropyToMnemonic(semilla);
      environment.login = true;
      const navigationExtras: NavigationExtras = {
        state: {
          palabras: this.palabras
        }
      };
      this.router.navigate(['/wallet'], navigationExtras);
    }

    catch{
      this.errorWallet = true;
    }
  }
}
