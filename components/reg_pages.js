import React,{useState, useEffect, useCallback,useRef} from 'react';
import App from 'next/app';
import Head from 'next/head';
import { Page, DisplayText,Label,Form } from '@shopify/polaris';
import Regdetpage from '../components/reg_detail_page';
import Errorregacc from '../pages/error_reg_acc';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import store from 'store-js';


const GET_prev_order = gql`
query order {
  orders(first:100, query:"fulfillment_status:unshipped") {
  edges {
  node {
  id
  name
  email
  displayFulfillmentStatus
  totalWeight
  displayFinancialStatus
  createdAt
  fullyPaid
  currencyCode
  createdAt
  updatedAt
  taxesIncluded
  discountCode
  customerLocale
  currentTotalTaxSet {
  shopMoney {
  amount
  }
  }
  processedAt
  presentmentCurrencyCode
  note
  totalTaxSet {
  shopMoney {
  amount
  }
  }
  totalShippingPriceSet {
  shopMoney {
  amount
  }
  }
  shippingAddress {
   firstName
    lastName
    address1
    address2
    city
    province
    country
    phone
    zip
  }
  customer{
    firstName
    lastName
    email
    phone
    defaultAddress {
      zip
      address1
      city
      province
    }
  }
  billingAddress {
  firstName
  lastName
  address1
  address2
  city
  province
  country
  phone
  zip
  }
  currentSubtotalPriceSet {
  shopMoney {
  amount
  }
  }
  }
  }
  }
  }`;

function sendexistorder(prevorder){
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("X-User-Key", "SzJDemlUYko5ZTlKaEhuVWh1MU5MV0VWZDhBYnBCZUE=");

  var prevdataoptions = {        
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify(prevorder)
    };
      
    fetch("https://apis.pos.com.my/apigateway/as01/api/shopifypreviousorder/v1",prevdataoptions)
    .then(function(response) {
    return response.json();
    }).then(resdata => {
      console.log("response prev data => ",resdata)
  }).catch((error) => {
      console.error("Error 1 Previous data : " + error);
  })
};

function Register(storedet) {

console.log(JSON.stringify(storedet));
  
/*
  let isStoreDetails=0;
  try{
    var obj = JSON.parse(storedet);
    isStoreDetails=1;
  }catch(ex){
   console.log(ex);
   isStoreDetails=0;
  }
*/

  const [value, setValue] = useState('');
  const [auth, setAuth] = useState(false);
  const [accdetails, setAccdetail] = useState('');
  const [storedetail, setStoredetail] = useState(storedet);
   
  
  const [accstorerecon, setAccstorerecon] = useState({});
  const [errorreg, setErrorreg] = useState(false);
  const [accnotfound, setAccnotfound] = useState(false);

  const logopos = 'https://www.pos.com.my/static/version1625158058/frontend/Pos1/Mcommerce1/en_US/images/Pos_Logo.svg';

  //const handleChange = useCallback((value) => setValue(value),[]);
 // const handleChange = useCallback(
 //   value => {
 //     setValue(value)
 //   }, [setValue]
 // )

  const handleChange = event => setValue(event.target.value);

  const handleSubmit = useCallback((event) => {
      
      
      /*if(isStoreDetails==1)
      {
      */

        var alldetail=storedetail;
        
        console.log()
        let headersList = {
          "X-User-Key": "dU1aMnpuZXJFU0tTYmNValhZWkM4c2xHY2JxZGlFR2M="
         }
        
        if(value=="1234567890"){
               
                let mjsonData = {"resultCd":"S","errMsg":"","resData":{"account":{"accountNo":"2002032336","customerName":"POS DEMO MERCHANT","address":"POS HQ DAYABUMI","postCode":"50050","city":"KUALA LUMPUR","state":"KUALA LUMPUR","phoneNo":"012-123456789","faxNo":"","status":"ACTIVE","email":""}}};
                
                setAccdetail(mjsonData.resData);
                
                 var myAllAccDetails = {}
                 //console.log("xxxxxxxx");
                 console.log(JSON.stringify(storedet.storedet));
                 
                 myAllAccDetails.storedet = storedet.storedet;
                 myAllAccDetails.accdet = mjsonData.resData;
                 console.log("myAllAccDetails");
                 console.log(JSON.stringify(myAllAccDetails));
                 
                
                 setAccstorerecon(myAllAccDetails);
                 setAuth(true);
                      
        }else
        {
            fetch(`https://apis.pos.com.my/apigateway/newcore/api/validatecustomeraccount/v1?accountNo=${value}`, { 
              method: "GET",
              headers: headersList
            }).then(function(response) {
              return response.text();
            }).then(resdata => {
                console.log("Register Acc res: ", JSON.stringify(resdata));
                var resjson = JSON.parse(resdata);
                
                var resjoncd = resjson.resultCd;
                console.log("ACC Rescd: ", resjoncd);
      
                if (resjoncd == "S"){
                
                setAccdetail(resjson.resData);
                //this.setState({accdetails : resjson.resData})
                
                //alldetail.accdet = this.state.accdetails;
                 var myAllAccDetails = {}
                 console.log("xxxxxxxx");
                 console.log(JSON.stringify(storedet.storedet));
                 
                 myAllAccDetails.storedet = storedet.storedet;
                 myAllAccDetails.accdet = resjson.resData;
                 console.log("myAllAccDetails");
                 console.log(JSON.stringify(myAllAccDetails));
                 
                //this.setState({accstorerecon:myAllAccDetails});
                setAccstorerecon(myAllAccDetails);
                //this.setState({accstorerecon:alldetail});
              
                //setAccdetail({accdetails : resjson.resData});
                
                //this
                //.setState({accdetails : resjson.resData})
                // alldetail.accdet = accdetails;
                // setAccstorerecon({accstorerecon:alldetail});
                 //this.setState({accstorerecon:alldetail});
              
                
                ///if(accdetail!=null){
                  //alldetail.accdet = storedet;
                 // setAccstorerecon(alldetail);
                //}          
                  setAuth(true); 
                }else{
      
                  alert("Account Not Exist. Please Contact Pos Malaysia for further information.")
                  //this.setState({auth: false,errorreg: true})
                }
                })
              .catch((error) => {
                  setAuth(false); 
                  setErrorreg(true); 
                  console.error("Error register Acc : " + error);
              });
          }  

     /* }else{
        alert('Store Address is required!\nPlease fill up your store address to continue!');
      }
*/
     
  });
  
  if(auth == false){
     if(errorreg == true){
        return(
          <Page>
            <Errorregacc/>
          </Page>
        );
        }else {
          return(
            <Query query={GET_prev_order} variables={{ids: store.get('ids')}}>
                {({data, loading, error}) => {
                  if (loading) return <div>Loading…</div>;
                  if (error) return <div></div>;
                  console.log("prev order full:",data.orders);
                  console.log("prev order data:",JSON.stringify(data.orders.edges));
                  var orderedges = data.orders.edges;
                  var i = 0;
                  for(i = 0; i < orderedges.length; i++) {
                    var shopd = storedet.storedet.shop;
                    var shopn = shopd.domains[0].url.replace(/(^\w+:|^)\/\//,'');
                    orderedges[i].shop_domain = shopn;
                    console.log("1 data:",JSON.stringify(orderedges[i]));
                    sendexistorder(JSON.stringify(orderedges[i]));
                  }
                  return(
                    <Page>
                    <Form onSubmit={handleSubmit}>
                      <div>
                      <img src={logopos}></img>
                      </div>
                      <br/>
                      <Label>
                        <DisplayText size="Large">Welcome To Pos Malaysia Plugin</DisplayText><br/> <br/>
                        Please Enter Your Pos Malaysia Registered Number
                        <br/>
                        <br/>
                        <div className="form-group">
                        <input type="number" value={value} onChange={handleChange} class="input"/>  <br/><br/>
                        <input type="submit" value="Enter" /> <br/>
                        </div>
                        </Label> 
                    </Form>
                  </Page>
                  );
            }}
        </Query>
        );
    }
  }else{
      return(
      <Page>
       <Regdetpage accdetail={accstorerecon}/>
      </Page>
      );
  }

}

export default Register
