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
  public errorMessages : String[];
  public API_URL : string = 'https://laravel-xoed.frb.io/api/';
  // public API_URL : string = "http://localhost/fiserve/public/api/";

  constructor(private http : HttpClient) { 
    this.getData();
    
  }

  getData(){
    this.http.get<Currency[]>(this.API_URL + 'rates/currencies').subscribe(result => {
      if(result.length > 0){
        this.currencyList = [];
        for(var i =0;i<result.length;i++){ 
          let model : Currency = new Currency(result[i].code);
          this.currencyList.push(model.code); 
        }
      }else{
        this.currencyList = ['None'];
      }
     });
  }

  ngOnInit(): void{
    this.getData();
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
    this.http.get(this.API_URL + "rates/fetch").subscribe(data =>{
      alert("Rates Updated !");
    });
  }

  convert($event){

    if(this.validateFields($event)){

      const httpOptions = {
        headers: new HttpHeaders({
         
          'Content-Type': 'application/json', 
          'Accept': 'application/json' 
        })
      };

      let published_at = Object.values(this.currency.cur_date).join('-');

      this.http.post(this.API_URL + "rates/convert",{ 
            params : {
              amount: this.currency.amount,
              currency: this.currency.code, 
              published_at: published_at 
            },
            httpOptions,
            observe: 'response'
          }).subscribe(data => {
            this.currency.converted_rate = JSON.stringify(data);

          }, error => {
            this.errorMessages = [];
            for (var key in error.error) {
              this.errorMessages.push( error.error[key][0].replace('params.','') );
            }
          });

    }
    
  }


  // Format Number
  validateAmount($event){
    var valid = /^\d{0,4}(\.\d{0,2})?$/.test(this.currency.amount),
    val = this.currency.amount;
  
    if(!valid) { 
      var val_split = val.toString().split('.',2);

      if(val_split[1].length >= 2){
        this.currency.amount = val_split[0] + "." + val_split[1].substr(0,2);
      }
    }
    this.convert($event);
    
  }


  validateFields($event){
    this.errorMessages = [];

    if(! this.currency.cur_date){
      this.errorMessages.push("The <b>date</b> field is required.");
    }

    if(! this.currency.code){
      this.errorMessages.push("The <b>code</b> field is required.");
    }

    if(! this.currency.amount){
      this.errorMessages.push("The <b>amount</b> field is required.");
    }

    if(this.errorMessages.length == 0){
      return true;
    }else{
      return false;
    }
  }

  clear(){
    this.errorMessages = [];
    this.currency.converted_rate = null;
  }

  valueChange($event){
    if(this.currency.cur_date || this.currency.code || this.currency.amount){
      this.currency.converted_rate = null;
      this.convert($event);
    }else{
      this.currency.converted_rate = null;
    }
  }
}

