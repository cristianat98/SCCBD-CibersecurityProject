import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HDNode } from 'ethers/lib/utils';
import { BigNumber, ethers, Transaction, Wallet } from 'ethers';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css']
})
export class PrincipalComponent implements OnInit {

  wallet: Wallet;
  balance: string = "0 ETHS";
  address: string;
  addressBoolean: Boolean = false;
  enviarBoolean: Boolean = false;
  enviarForm: FormGroup;
  pulsado: Boolean = false;
  gasPrice: string = "0";
  constructor(private changeDetectorRef: ChangeDetectorRef, private formBuilder: FormBuilder) { }

  async ngOnInit(): Promise<void> {
    this.enviarForm = this.formBuilder.group({
      numEthers: ['', [Validators.required, this.ethersValid]],
      destAddress: ['', [Validators.required, this.checkLength]],
      confirmAddress: ['', [Validators.required, this.checkLength]]
    }, { validator: this.checkAddress});

    const palabras: string = history.state.palabras;
    const masterNode: HDNode = ethers.utils.HDNode.fromMnemonic(palabras);
    const keypair1 = masterNode.derivePath("m/44'/60'/0'/0/0");//preguntar indice 0 no da correctamente ETHERS

    //LOCALHOST -> GANACHE
    /*const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545");
    this.wallet = new Wallet(keypair1.privateKey, provider);
    await this.getBalance();
    const gasPriceBigNumber: BigNumber = await provider.getGasPrice();
    //1 gwei = 0.000000001 ether.
    this.gasPrice = ethers.utils.formatUnits(gasPriceBigNumber, "gwei");
    this.changeDetectorRef.detectChanges();*/

    //TESNET -> INFURA
    const itx = new ethers.providers.InfuraProvider(
      'ropsten',
      'e09590d7ebcc4cab9ea6b6e44ad57a24'
    );
    this.wallet = new ethers.Wallet(keypair1.privateKey, itx);
    await this.getBalanceInfura(itx);
  }

  get formControls(){
    return this.enviarForm.controls;
  }

  ethersValid(group: FormGroup) {
    if (group.value <= 0)
      return ({ethersValid: true})

    else
      return null;
  }

  checkAddress(group: FormGroup) {
    if (group.value.destAddress !== group.value.confirmAddress)
      return ({checkAddress: true});

    else
      return null;
  }

  checkLength(group: FormGroup) {
    if (group.value.length !== 42)
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
    if (this.enviarForm.invalid){
      return;
    }

    if (this.enviarForm.value.destAddress !== this.enviarForm.value.confirmAddress){
      return;
    }

    const tx = await this.wallet.sendTransaction({
      to: this.enviarForm.value.destAddress,
      value: ethers.utils.parseEther(this.enviarForm.value.numEthers.toString())
    });
  }

  async getAddress(): Promise<void> {
    this.enviarBoolean = false;
    if (!this.addressBoolean){
      this.address = await this.wallet.getAddress();
      this.addressBoolean = true;
      this.changeDetectorRef.detectChanges();
    }
  }

  async getBalance(): Promise<void> {
    const balanceBigNumber: BigNumber = await this.wallet.getBalance();
    this.balance = ethers.utils.formatEther(balanceBigNumber) + " ETHS";
    this.changeDetectorRef.detectChanges();
  }

  async getBalanceInfura(itx): Promise<void> {
    this.address = await this.wallet.getAddress();
    const response = await itx.send('relay_getBalance', [this.address])
    this.balance = response.balance;
  }
}
