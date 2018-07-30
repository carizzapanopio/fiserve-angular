import { Component, OnInit, ViewChild } from '@angular/core'; 
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {Observable, Subject, merge} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';
import { Currency } from '../Models/currency';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';  
// import {FormGroup, FormControl, Validators} from '@angular/forms';
 
 

  @Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
  })


export class HomeComponent implements OnInit {
 
  public currencyList : String[];

  public currency : Currency = new Currency("");
  public convertedRate : String[];
  // public API_URL : string = 'http://laravel-xoed.frb.io/api/';
  public API_URL : string = "http://localhost/fiserve/public/api/";

  constructor(private http : HttpClient) { 
    this.getData();
    
  }

  getData(){
    console.log(this.API_URL + 'rates/currencies');
    this.http.get<Currency[]>(this.API_URL + 'rates/currencies').subscribe(result => {
      if(result.length > 0){
        this.currencyList = [];
        for(var i =0;i<result.length;i++){ 
          let model : Currency = new Currency(result[i].code);
          this.currencyList.push(model.code); 
        }
      }
     });
  }

  ngOnInit(): void{
    // this.currency = new FormGroup({
      
    // })
  }
  
  @ViewChild('instance') instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();


  search = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(100), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;
    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? this.currencyList : this.currencyList.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
    );
  }

  updateRates()  {  

    console.log(this.API_URL + 'rates/fetch');
    this.http.get(this.API_URL + "rates/fetch").subscribe(data =>{
      alert("Rates Updated !");
    });
  }

  convert(){
    console.log(this.API_URL + "rates/convert");
    const httpOptions = {
      headers: new HttpHeaders({
       
        'Content-Type': 'application/json', 
        'Accept': 'application/json' 
      })
    };
    
    // Initialize Params Object
    let Params = new HttpParams();
    // console.log(this.currency.cur_date.join(''));
    // Begin assigning parameters

    // Params = Params.append('amount', this.currency.amount);
    // Params = Params.append('currency', this.currency.code);
    // Params = Params.append('published_at', this.currency.cur_date.year + "-" +  this.currency.cur_date.month + "-" +  this.currency.cur_date.day);
    // let publishedAt = "";
    // var obj = this.currency.cur_date;
    // if(Object.keys(obj).length != 0){
    //   console.log('yow');
    //   publishedAt = this.currency.cur_date.year + "-" +  this.currency.cur_date.month + "-" +  this.currency.cur_date.day;
    // }
    // Params = Params.append("amount", "500");
    // Params = Params.append("currency", "AFN");
    // Params = Params.append("published_at", "2018-07-26" );
    // console.log(Params.toString());
    // let currency = this;
    let published_at = Object.values(this.currency.cur_date).join('-');
     console.log(published_at);
     this.http.post(this.API_URL + "rates/convert",{ 
            params : {amount: this.currency.amount, currency: this.currency.code, published_at: published_at }
            ,httpOptions , observe: 'response'
          }).subscribe(data => {
            // alert(JSON.stringify(data));
            this.currency.converted_rate = JSON.stringify(data);
          });

  }

  // Format Number
  validateAmount(){
    var valid = /^\d{0,4}(\.\d{0,2})?$/.test(this.currency.amount),
    val = this.currency.amount;
 
    if(!valid){ 
        this.currency.amount = val.substr(0, val.length - 1);
    }
  }
}
