import React,{useState, useEffect, useCallback} from 'react';
import {TextStyle, Card, IndexTable, TextField,TextContainer,Button,Page,Form,FormLayout} from '@shopify/polaris';
import Orderpage from './order_page_dev_v2';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import store from 'store-js';
//import server from '../server/server.js';



async function sendexistorder(prevorder){
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("X-User-Key", "SzJ");

  var prevdataoptions = {        
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify(prevorder)
    };
      
    await fetch("https://apis.pos.com.my/apigateway/as01/api/shopifypreviousorder/v1",prevdataoptions)
    .then(function(response) {
    return response.json();
    }).then(resdata => {
      console.log("response prev data => ",resdata)
  }).catch((error) => {
      console.error("Error 1 Previous data : " + error);
  })
};

function valapikey(accdetail) {
    const [apikey, setApikey] = useState('');
    const [valresult, setValresult] = useState(false);

    const handleSubmit = useCallback ((_event) => {
        console.log("Apikey : ", apikey);
        console.log("Accdetail : ", accdetail.accdetail.shop.name);
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("X-User-Key", "Mmo3d");
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
        
        
         fetch(`https://apis.pos.com.my/apigateway/mobile/api/validate_apikey_shopify/v1`, valapikeyoptions)
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
        <Query query={GET_prev_order} variables={{ids: store.get('ids')}}>
            {({data, loading, error}) => {
              if (loading) return <div>Loading…</div>;
              if (error) return <div></div>;
              console.log("prev order full:",data.orders);
              console.log("prev order data:",JSON.stringify(data.orders.edges));
              var orderedges = data.orders.edges;
              var i = 0;
              for(i = 0; i < orderedges.length; i++) {
                var shopd = accdetail.accdetail.shop;
                var shopn = shopd.domains[0].url.replace(/(^\w+:|^)\/\//,'');
                orderedges[i].shop_domain = shopn;
                console.log("1 data:",JSON.stringify(orderedges[i]));
                sendexistorder(JSON.stringify(orderedges[i]));
              }
          return(
            <Page>
                <Orderpage shopdetail = {accdetail.accdetail}/>
            </Page>
          );
        }}
        </Query>
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
