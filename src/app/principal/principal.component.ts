import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HDNode } from 'ethers/lib/utils';
import { BigNumber, ethers, Wallet } from 'ethers';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  pulsado: Boolean = false;
  gasPrice: number = 0;
  gasPriceString: string = "Cargando...";
  estimacionGas: number = 0;
  provider;
  constructor(private changeDetectorRef: ChangeDetectorRef, private formBuilder: FormBuilder, private router: Router) { }

  async ngOnInit(): Promise<void> {
    this.enviarForm = this.formBuilder.group({
      numEthers: ['', [Validators.required, this.ethersValid]],
      destAddress: ['', [Validators.required, this.checkLength]],
      confirmAddress: ['', [Validators.required, this.checkLength]]
    }, { validator: this.checkAddress});

    const palabras: string = history.state.palabras;

    try{
      const masterNode: HDNode = ethers.utils.HDNode.fromMnemonic(palabras);
      const keypair1: HDNode = masterNode.derivePath("m/44'/60'/0'/0/0");//preguntar indice 0 no da correctamente ETHERS
  
      //LOCALHOST -> GANACHE
      /*this.provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545");*/
  
      //TESNET -> INFURA
      this.provider = new ethers.providers.InfuraProvider(
        'ropsten',
        'e09590d7ebcc4cab9ea6b6e44ad57a24'
      );
      this.wallet = new Wallet(keypair1.privateKey, this.provider);
      await this.getGas();
      await this.getBalance();
      //await this.getBalanceInfura();
    }
    
    catch{
      this.router.navigate(['/abrir']);
    }
  }

  get formControls(){
    return this.enviarForm.controls;
  }

  ethersValid(group: FormGroup) {
    if (group.value <= 0)
      return ({ethersValid: true})

    else{
      /*console.log(this.gasPrice);
      this.estimacionGas = (21000 * this.gasPrice)/0.000000001;*/
      return null;
    } 
  }

  checkAddress(group: FormGroup) {
    if (group.value.destAddress !== group.value.confirmAddress)
      return ({checkAddress: true});

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
    if (this.enviarForm.invalid){
      return;
    }

    const tx = await this.wallet.sendTransaction({
      to: this.enviarForm.value.destAddress,
      value: ethers.utils.parseEther(this.enviarForm.value.numEthers.toString()),
      gasPrice: this.gasPrice
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

  async getGas(): Promise<void> {
    const gasPriceBigNumber: BigNumber = await this.provider.getGasPrice();
    //1 gwei = 0.000000001 ether
    this.gasPrice = parseInt(ethers.utils.formatUnits(gasPriceBigNumber, "gwei"));
    this.gasPriceString = this.gasPrice.toString() + " GWEI (1 GWEI = 0.000000001 ETHER)";
    this.changeDetectorRef.detectChanges();
  }

  async getBalanceInfura(): Promise<void> {
    this.address = await this.wallet.getAddress();
    const response = await this.provider.send('relay_getBalance', [this.address]);
    console.log(response);
    //this.balance = response.balance + " ETHS";
    //this.changeDetectorRef.detectChanges();
  }
}
