import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { ethers } from 'ethers';
import * as bigintConversion from 'bigint-conversion';
import * as secrets from 'shamirs-secret-sharing-ts';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.component.html',
  styleUrls: ['./crear.component.css']
})
export class CrearComponent implements OnInit {
  
  mnemonic: string;
  secretoForm: FormGroup;
  claves: string[] = [];
  pulsado: Boolean = false;
  semilla: Uint8Array;
  constructor(private router: Router, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.secretoForm = this.formBuilder.group({
      numClaves: ['', Validators.required],
      numRequest: ['', Validators.required]
    }, { validator: this.checkForm })

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

  get formControls(){
    return this.secretoForm.controls;
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