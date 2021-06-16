import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { ethers } from 'ethers';
import * as cryptojs from 'crypto-js';
import * as bigintConversion from 'bigint-conversion';
import * as fs from 'file-system';
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
  constructor(private router: Router, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.secretoForm = this.formBuilder.group({
      numClaves: ['', Validators.required],
      numRequest: ['', Validators.required]
    }, { validator: this.checkForm })

    const semilla: Uint8Array = window.crypto.getRandomValues(new Uint8Array(16));
    this.mnemonic = ethers.utils.entropyToMnemonic(semilla);
    environment.login = true;
  }

  checkForm(group: FormGroup) {
    if (group.value.numClaves < group.value.numRequest)
      return ({checkForm: true});
    
    else
      return null;
  }

  generar(): void {
    this.pulsado = true;
    if (this.secretoForm.invalid){
      return
    }

    //Probando libreria secrets.js grempe
    var key = Buffer.from(window.crypto.getRandomValues(new Uint8Array(16)));
    const options = {
      shares: 4,
      threshold: 3
    }

    var shares = secrets.split(key, options);
    var comb = Buffer.from(secrets.combine(shares.slice(0, 4)));

    let i: number = 0;
    this.claves = [];
    while (i<this.secretoForm.value.numClaves){
      this.claves.push(i.toString());
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