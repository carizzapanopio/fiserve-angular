import { Component, OnInit, ViewChild } from '@angular/core'; 
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {Observable, Subject, merge} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';
import { Currency } from '../Models/currency';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';  
 
 

  @Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
  })


export class HomeComponent implements OnInit {
 
  public currencyList : String[];

  public currency : Currency = new Currency("");
  public convertedRate : String[];

  public currency : Currency = new Currency(""); 
  public apiUrl : string = 'https://laravel-xoed.frb.io';


  constructor(private http : HttpClient) { 
    this.getData();
    
  }

  getData(){
    console.log(this.currency.api_url + 'rates/currencies');
    this.http.get<Currency[]>(this.currency.api_url + 'rates/currencies').subscribe(result => {
      if(result.length > 0){
        this.currencyList = [];
        for(var i =0;i<result.length;i++){ 
          let model : Currency = new Currency(result[i].code);
          this.currencyList.push(model.code); 
        }
      }
     });
  }

  ngOnInit(){
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

    console.log(this.currency.api_url + 'rates/fetch');
    this.http.get(this.currency.api_url + "rates/fetch").subscribe(data =>{
      alert("Rates Updated !");
    });
  }

  convert(){
    console.log(this.currency.api_url + "rates/convert");
    const httpOptions = {
      headers: new HttpHeaders({
       
        'Content-Type': 'application/json', 
        'Accept': 'application/json' 
      })
    };
    
    // Initialize Params Object
    let Params = new HttpParams();
    console.log(this.currency.cur_date);
    // Begin assigning parameters

    Params = Params.append('amount', this.currency.amount);
    Params = Params.append('currency', this.currency.code);
    Params = Params.append('published_at', this.currency.cur_date.year + "-" +  this.currency.cur_date.month + "-" +  this.currency.cur_date.day);

    // Params = Params.append("amount", "500");
    // Params = Params.append("currency", "AFN");
    // Params = Params.append("published_at", "2018-07-26" );
    console.log(Params.toString());
     this.http.post(this.currency.api_url + "rates/convert",{ 
            params : {amount: this.currency.amount, currency: this.currency.code, published_at: this.currency.cur_date.year + "-" +  this.currency.cur_date.month + "-" +  this.currency.cur_date.day }
            ,httpOptions , observe: 'response'
          }).subscribe(data => {
            alert(data);
            // this.currency.convered_rate = data;
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
