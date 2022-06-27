import React,{useState, useEffect, useCallback,useRef} from 'react';
import App from 'next/app';
import Head from 'next/head';
import { Page, DisplayText,Label,Form } from '@shopify/polaris';
import Regdetpage from '../components/reg_detail_page';
import Errorregacc from '../pages/error_reg_acc';


function Register(storedet) {
 
  const [value, setValue] = useState('');
  const [auth, setAuth] = useState(false);
  const [accdetail, setAccdetail] = useState('');
  const [storedetail, setStoredetail] = useState(storedet);
  const [accstorerecon, setAccstorerecon] = useState({});
  const [errorreg, setErrorreg] = useState(false);
  const [accnotfound, setAccnotfound] = useState(false);

  const logopos = 'https://www.pos.com.my/static/version1625158058/frontend/Pos1/Mcommerce1/en_US/images/Pos_Logo.svg';

  const handleChange = useCallback((value) => setValue(value), []);

  const handleSubmit = useCallback((event) => {
      var alldetail=storedetail;
      let headersList = {
        "X-User-Key": "dU1aMnpuZXJFU0tTYmNValhZWkM4c2xHY2JxZGlFR2M="
       }
      fetch(`https://apis.pos.com.my/apigateway/newcore/api/validatecustomeraccount/v1?accountNo=${value}`, { 
        method: "GET",
        headers: headersList
      }).then(function(response) {
        return response.text();
      }).then(resdata => {
          console.log("Register Acc res: ", JSON.stringify(resdata));
          var resjson = JSON.parse(resdata);
          console.log("ACC Rescd: ", resjson.resultCd);
          var resjoncd = resjson.resultCd;
          setAccdetail(resjson.resData);
          alldetail.accdet = accdetail;
          setAccstorerecon(alldetail);
          if (resjoncd == "S"){
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
                <input type="number" value={value} onChange={handleChange} />  <br/><br/>
                <input type="submit" value="Enter" /> <br/>
                </div>
                </Label> 
            </Form>
          </Page>
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

  // handleSubmit = (event) => {
  //       console.log("gqldata: "+this.state.accdetails.shop + " " + this.state.value)
  //       var accstorerecon=this.state.accdetails;
  //       accstorerecon.accountno=this.state.value;
  //       console.log("accstorerecon:" + JSON.stringify(accstorerecon));
  //       var myHeaders = new Headers();
  //       myHeaders.append("Content-Type", "application/json");
  //       myHeaders.append("X-User-Key", "aWp5MFlQc2VZYjFYUHBicmMwNUg2dmxMTXJ5SVNOSm8=");
  //       var raw = JSON.stringify(accstorerecon)
  //       var savetodbOptions = {
  //       method: 'POST',
  //       headers: myHeaders,
  //       body: raw,
  //       };
  //        fetch(`https://apis.pos.com.my/apigateway/as01/api/shopify_register/v1`, savetodbOptions)
  //        .then(response => {
  //         return response.json() //var res=response);
  //         })
  //         .then(responsejson => {
  //           console.log("Register Acc res: ", responsejson.resultcd);
  //      if (responsejson.resultcd == "S"){
  //             this.setState({auth:true});
  //           }else{
  //             alert("Account Not Exist. Please Contact Pos Malaysia for further information.")
  //             //this.setState({auth: false,errorreg: true})
  //           }
  //           })
  //         .catch((error) => {
  //             this.setState({auth: false,errorreg: true})
  //             console.error("Error register Acc : " + error);
  //         });
  //   }
