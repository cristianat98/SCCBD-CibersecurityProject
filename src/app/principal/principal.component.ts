import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HDNode } from 'ethers/lib/utils';
import { BigNumber, ethers, Wallet } from 'ethers';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bigintConversion from 'bigint-conversion';
import * as cryptojs from 'crypto-js';
import * as hash from 'scrypt-pbkdf';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css']
})
export class PrincipalComponent implements OnInit {

  wallet: Wallet;
  balance: string = "Cargando...";
  address: string;
  addressBoolean: Boolean = false;
  enviarBoolean: Boolean = false;
  enviarForm: FormGroup;
  passwordForm: FormGroup;
  pulsado: Boolean = false;
  gasPrice: number = 0;
  gasPriceString: string = "Cargando...";
  provider;
  estimacionGas: number = 0;
  informacion: string = "";
  errorTransaccion: Boolean = false;
  guardarBoolean: Boolean = false;
  guardadoBoolean: Boolean = false;
  pulsadoPasswords: Boolean = false;
  palabras: string;
  errorBorrar: Boolean = false;
  passwordAntigua: string;
  constructor(private changeDetectorRef: ChangeDetectorRef, private formBuilder: FormBuilder, private router: Router, private zone: NgZone) { }

  async ngOnInit(): Promise<void> {
    this.palabras = history.state.palabras;

    if (localStorage.getItem('wordsEthereum') !== null)
      this.guardadoBoolean = true;

    try{
      const masterNode: HDNode = ethers.utils.HDNode.fromMnemonic(this.palabras);
      const keypair1: HDNode = masterNode.derivePath("m/44'/60'/0'/0/0");//preguntar indice 0 no da correctamente ETHERS
  
      //LOCALHOST -> GANACHE
      /*this.provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545");*/
  
      //TESNET -> INFURA
      this.provider = new ethers.providers.InfuraProvider(
        'ropsten',
        'e09590d7ebcc4cab9ea6b6e44ad57a24'
      );

      this.wallet = new Wallet(keypair1.privateKey, this.provider);
      this.address = await this.wallet.getAddress();
      /*await this.getBalanceGanache();
      await this.getGasGanache();*/
      await this.getBalanceInfura();
      await this.getGasInfura();
      
      this.enviarForm = this.formBuilder.group({
        numEthers: ['', [Validators.required, this.ethersValid]],
        gasPrice: [this.gasPrice, [Validators.required, this.gasValid]],
        destAddress: ['', [Validators.required, this.checkLength]],
        confirmAddress: ['', [Validators.required, this.checkLength]]
      }, { validator: this.checkAddress });

      this.passwordForm = this.formBuilder.group({
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required]
      }, { validator: this.checkPassword })
    }
    
    catch{
      this.zone.run(() =>{
        this.router.navigate(['/abrir']);
      });
    }
    await this.getBalanceInfura();
  }

  get formControls(){
    return this.enviarForm.controls;
  }

  get formControls2(){
    return this.passwordForm.controls;
  }

  ethersValid(group: FormGroup) {
    if (group.value <= 0)
      return ({ethersValid: true})

    else{
      return null;
    } 
  }

  gasValid(group: FormGroup) {
    if (group.value <= 0)
      return ({ethersValid: true})

    else{
      return null;
    } 
  }

  calcularGas(): number {
    this.estimacionGas = 21000*this.enviarForm.value.gasPrice*0.000000001
    return this.estimacionGas;
  }

  checkAddress(group: FormGroup) {
    if (group.value.destAddress !== group.value.confirmAddress)
      return ({checkAddress: true});

    else
      return null;
  }

  checkPassword(group: FormGroup) {
    if (group.value.password !== group.value.confirmPassword)
      return ({checkPassword: true})

    else
      return null;
  }

  checkLength(group: FormGroup) {
    if (group.value.length < 39 || group.value.length > 42 || group.value.length === 41)
      return ({checkLength: true})

    else
      return null;
  }

  formEthers(): void {
    this.addressBoolean = false;
    this.enviarBoolean = true;
  }

  async enviarEthers(): Promise<void> {
    this.pulsado = true;
    this.errorTransaccion = false;
    this.informacion = "";
    if (this.enviarForm.invalid){
      return;
    }

    try{
      const tx = await this.wallet.sendTransaction({
        to: this.enviarForm.value.destAddress,
        value: ethers.utils.parseEther(this.enviarForm.value.numEthers.toString()),
        gasPrice: ethers.utils.parseUnits(this.enviarForm.value.gasPrice.toString(), "gwei")
      });
      
      this.informacion = "Transacción enviada";
      this.pulsado = false;
      setInterval(() => {
        this.informacion = "";
        this.changeDetectorRef.detectChanges();
      }, 5000);

      this.enviarForm.controls['numEthers'].setValue('');
      this.enviarForm.controls['gasPrice'].setValue(1);
      this.enviarForm.controls['destAddress'].setValue('');
      this.enviarForm.controls['confirmAddress'].setValue('');
      this.changeDetectorRef.detectChanges();
    }

    catch{
      this.errorTransaccion = true;
      this.changeDetectorRef.detectChanges();
      setInterval(() => {
        this.errorTransaccion = false;
        this.changeDetectorRef.detectChanges();
      }, 5000)
    }
    
  }

  getAddress(): void {
    this.enviarBoolean = false;
    this.addressBoolean = true;
  }

  getSave(): void {
    this.guardarBoolean = true;
  }

  guardar(): void {
    this.pulsadoPasswords = true;
    if (this.passwordForm.invalid){
      return
    }
    
    this.informacion = "Cargando...";
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
        new Uint8Array(bigintConversion.textToBuf(this.palabras))
      )
      localStorage.setItem('wordsEthereum', bigintConversion.bufToHex(cifrado));
      this.guardarBoolean = false;
      this.informacion = "";
    });
  }

  borrar(): void {
    if (this.passwordAntigua === undefined || this.passwordAntigua === "")
      this.errorBorrar = true;

    else{
      this.errorBorrar = false;
      this.informacion = "Cargando...";
      const hashPassword: string = cryptojs.SHA256(this.passwordAntigua).toString();
      hash.scrypt(this.passwordAntigua, hashPassword, 32).then(async key => {
        const clave = await crypto.subtle.importKey(
          "raw",
          key,
          "AES-GCM",
          true,
          ["encrypt", "decrypt"]
        )
        try{
          const cifrado: ArrayBuffer = await crypto.subtle.decrypt(
            {
              name: "AES-GCM",
              iv: new Uint8Array(bigintConversion.hexToBuf(hashPassword))
            },
            clave,
            bigintConversion.hexToBuf(localStorage.getItem('wordsEthereum'))
          )
          this.informacion = "";
          this.guardadoBoolean = false;
          localStorage.clear();
        }
        catch{
          this.errorBorrar = true;
          this.passwordAntigua = "";
          this.informacion = "";
        }
      });
    }
  }

  async getBalanceGanache(): Promise<void> {
    const balanceBigNumber: BigNumber = await this.wallet.getBalance();
    this.balance = ethers.utils.formatEther(balanceBigNumber) + " ETHS";
    this.changeDetectorRef.detectChanges();
  }

  async getBalanceInfura(): Promise<void> {
    const response = await this.provider.send('eth_getBalance', [this.address, "latest"]);
    this.balance = parseInt(response)*0.000000000000000001 + " ETHS";
    this.changeDetectorRef.detectChanges();
  }

  async getGasGanache(): Promise<void> {
    const gasPriceBigNumber: BigNumber = await this.provider.getGasPrice();
    //1 gwei = 0.000000001 ether
    this.gasPrice = parseInt(ethers.utils.formatUnits(gasPriceBigNumber, "gwei"));
    this.gasPriceString = this.gasPrice.toString() + " GWEI (1 GWEI = 0.000000001 ETHER)";
    this.changeDetectorRef.detectChanges();
  }

  async getGasInfura(): Promise<void> {
    const response = await this.provider.send('eth_gasPrice');
    this.gasPrice = parseInt(response)*0.000000001;
    this.gasPriceString = this.gasPrice + " GWEI (1 GWEI = 0.000000001 ETHER)";
  }

  async getTransactions(): Promise<void> {
    const count = await this.provider.send('eth_subscribe', ["newHeads"]);
    console.log(count);
    /*const response = await this.provider.send('eth_getTransactionCount', "later")
    const transactions = await this.wallet.getTransactionCount();
    console.log(transactions);*/
  }
}