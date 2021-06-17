import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import * as secrets from 'shamirs-secret-sharing-ts';
import { environment } from 'src/environments/environment';
import { ethers } from 'ethers';
import * as bigintConversion from 'bigint-conversion';
import * as cryptojs from 'crypto-js';
import * as hash from 'scrypt-pbkdf';

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
  palabrasBoolean: Boolean = false;
  password: string;
  errorPassword: Boolean = false;
  constructor(private router: Router) { }

  ngOnInit(): void {
    if (localStorage.getItem('wordsEthereum') !== undefined)
      this.palabrasBoolean = true;
  }

  cargar(): void {
    if (this.password === undefined || this.password === "")
      this.errorPassword = true;

    else{
      this.errorPassword = false;
      const hashPassword: string = cryptojs.SHA256(this.password).toString();
      hash.scrypt(this.password, hashPassword, 32).then(async key => {
        const clave = await crypto.subtle.importKey(
          "raw",
          key,
          "AES-GCM",
          true,
          ["encrypt", "decrypt"]
        )
        const cifrado: ArrayBuffer = await crypto.subtle.decrypt(
          {
            name: "AES-GCM",
            iv: new Uint8Array(bigintConversion.hexToBuf(hashPassword))
          },
          clave,
          bigintConversion.hexToBuf(localStorage.getItem('wordsEthereum'))
        )
        this.palabras = bigintConversion.bufToText(cifrado);
        environment.login = true;
        const navigationExtras: NavigationExtras = {
          state: {
            palabras: this.palabras
          }
        };
        this.router.navigate(['/wallet'], navigationExtras);
      });
    }
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
