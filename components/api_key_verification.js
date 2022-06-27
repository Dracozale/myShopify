import React,{useState, useEffect, useCallback} from 'react';
import {TextStyle, Card, IndexTable, TextField,TextContainer,Button,Page,Form,FormLayout} from '@shopify/polaris';
import Orderpage from './order_page_dev_v2';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import store from 'store-js';

function valapikey(accdetail) {
    const [apikey, setApikey] = useState('');
    const [valresult, setValresult] = useState(false);

    const handleSubmit = useCallback ((_event) => {
        console.log("Apikey : ", apikey);
        console.log("Accdetail : ", accdetail.accdetail.shop.name);
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("X-User-Key", "N3cxTUpZUk1RdjZM");
        console.log("nak kuar:", accdetail.accdetail.shop);
        var shopd = accdetail.accdetail.shop;
        var shopn = shopd.domains[0].url.replace(/(^\w+:|^)\/\//,'');
        var raw = {shopname:shopn,apikey:apikey}
        var jraw = JSON.stringify(raw);
        console.log("raw data: ", raw);
        var valapikeyoptions = {        
        method: 'POST',
        headers: myHeaders,
        body: jraw,
        redirect: 'follow'
        };
        
        
         fetch(`https://apis.pos.com.my/apigateway/as01/api/shopify_validatekey/v1`, valapikeyoptions)
          .then(function(response) {
          return response.json();
          }).then(resdata => {
            //console.log("toyol => ",resdata)
            //console.log("Api key Validation: ", resdata.results);
            if (resdata.results == "ok"){
                setValresult(true);
            }else{
            alert("Problem with Key registration key Please check with pos malaysia");        
            }
        }).catch((error) => {
            console.error("Error register Acc : " + error);
        });
  
    });
  
    const handleApiChange = useCallback((value) => setApikey(value), []);
    
    if(valresult == true){
      return(
        <Page>
            <Orderpage shopdetail = {accdetail.accdetail}/>
        </Page>
      );
    }else{
        return (
            <Form onSubmit={handleSubmit}>
              <FormLayout>
              <TextField
                  value={apikey}
                  onChange={handleApiChange}
                  label="API Key"
                  type="Key"
                  helpText={
                    <span>
                      Please Insert API Key Provided in your email from POS Malaysia Berhad.
                    </span>
                  }
                />
                <Button submit>Submit</Button>
              </FormLayout>
            </Form>
          );
    }
    
  }
export default valapikey
