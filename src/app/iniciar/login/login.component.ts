import { Component, OnInit } from '@angular/core';
import * as data from '../../../assets/usuario.json';
import * as cryptojs from 'crypto-js';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  
  constructor(private router: Router) {}

  ngOnInit(): void { 
  }

  abrirWallet(): void{
    this.router.navigateByUrl('/abrir')
  }

  crearWallet(): void{
    this.router.navigateByUrl('/crear');
  }
}
