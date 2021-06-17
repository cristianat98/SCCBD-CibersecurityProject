import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { ethers } from 'ethers';
import * as bigintConversion from 'bigint-conversion';
import * as secrets from 'shamirs-secret-sharing-ts';
import { environment } from 'src/environments/environment';
import * as hash from 'scrypt-pbkdf';
import * as cryptojs from 'crypto-js';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.component.html',
  styleUrls: ['./crear.component.css']
})
export class CrearComponent implements OnInit {
  
  mnemonic: string;
  secretoForm: FormGroup;
  passwordForm: FormGroup;
  claves: string[] = [];
  pulsado: Boolean = false;
  pulsado2: Boolean = false;
  semilla: Uint8Array;
  guardarBoolean: Boolean = true;
  constructor(private router: Router, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.secretoForm = this.formBuilder.group({
      numClaves: ['', Validators.required],
      numRequest: ['', Validators.required]
    }, { validator: this.checkForm })

    this.passwordForm = this.formBuilder.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, { validator: this.checkPassword })

    this.semilla = window.crypto.getRandomValues(new Uint8Array(16));
    this.mnemonic = ethers.utils.entropyToMnemonic(this.semilla);
    environment.login = true;
  }

  checkForm(group: FormGroup) {
    if (group.value.numClaves < group.value.numRequest || group.value.numClaves < 0)
      return ({checkForm: true});
    
    else
      return null;
  }

  checkPassword(group: FormGroup) {
    if (group.value.password !== group.value.confirmPassword)
      return ({checkPassword: true})

    else
      return null;
  }

  get formControls(){
    return this.secretoForm.controls;
  }

  get formControls2(){
    return this.passwordForm.controls;
  }

  async guardar(): Promise<void> {
    this.pulsado2 = true;
    if (this.passwordForm.invalid){
      return
    }
    
    const hashPassword: string = cryptojs.SHA256(this.passwordForm.value.password).toString();
    hash.scrypt(this.passwordForm.value.password, hashPassword, 32).then(async key => {
      const clave = await crypto.subtle.importKey(
        "raw",
        key,
        "AES-GCM",
        true,
        ["encrypt", "decrypt"]
      )
      const cifrado: ArrayBuffer = await crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: new Uint8Array(bigintConversion.hexToBuf(hashPassword))
        }, 
        clave, 
        new Uint8Array(bigintConversion.textToBuf(this.mnemonic))
      )
      localStorage.setItem('wordsEthereum', bigintConversion.bufToHex(cifrado));
      this.guardarBoolean = false;
    });
  }

  generar(): void {
    this.pulsado = true;
    if (this.secretoForm.invalid){
      return
    }

    const semillaBuffer: Buffer = Buffer.from(this.semilla);
    const options = {
      shares: this.secretoForm.value.numClaves,
      threshold: this.secretoForm.value.numRequest
    }

    const shares: Uint8Array[] = secrets.split(semillaBuffer, options);
    let i: number = 0;
    this.claves = [];
    while (i<this.secretoForm.value.numClaves){
      this.claves.push(bigintConversion.bufToHex(shares[i]));
      i++;
    }
  }

  irWallet(): void {
    const navigationExtras: NavigationExtras = {
      state: {
        palabras: this.mnemonic
      } 
    };
    this.router.navigate(['/wallet'], navigationExtras);
  }
}