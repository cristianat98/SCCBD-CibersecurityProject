import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { ethers } from 'ethers';
import * as cryptojs from 'crypto-js';
import * as bigintConversion from 'bigint-conversion';
import * as fs from 'file-system';
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
    })

    const semilla: Uint8Array = window.crypto.getRandomValues(new Uint8Array(16));
    this.mnemonic = ethers.utils.entropyToMnemonic(semilla);
    environment.login = true;
  }

  generar(): void {
    this.pulsado = true;
    if (this.secretoForm.invalid){
      return
    }

    if (this.secretoForm.value.numClaves < this.secretoForm.value.numRequest){
      return;
    }
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
  /*const seed = ethers.utils.mnemonicToSeed("alien fine expire retire spoon reduce anger allow solution merry amazing top");
  const masterNodeDinero: HDNode = ethers.utils.HDNode.fromSeed(seed);
  */
}