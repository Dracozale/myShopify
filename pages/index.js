import React,{ useState, useEffect, useCallback} from 'react';
import { AppProvider, EmptyState, Layout, Page, DisplayText,Label,Form,input} from '@shopify/polaris';
import store from 'store-js';
import Orderpage from '../components/order_page_dev_v2';
import Register from '../components/reg_pages';
import ErrorValAcc from './error_val_acc';
import PendingApprove from './register_pending_approval';
import Valapikeypage from '../components/api_key_verification';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const GET_SHOP = gql`
query {
  shop{
    domains {
      url
      id
    }
  name
  currencyCode
  billingAddress {
  phone
  id
  address1
  address2
  city
  zip
  province
  }
  }
}`;

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: '',authregister:false,auth:false,authpending:false,valapikey:false,accdetail:'',autherror:false};
  };

  setacc(data){
    this.setState({ accdetails: data})
    let gqlres = data.shop;
    let ptgurl = gqlres.domains[0].url.replace(/(^\w+:|^)\/\//,'');

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    let urlx = `https://apis.pos.com.my/apigateway/as01/api/shopify_shop/v1?shop_name=${ptgurl}`;
    console.log(urlx);
    var savetodbOptions = {
      method: 'GET',
      headers:{ "X-User-Key": "R3NTbTJlQmlrQTIwdHQ0MzkzN0JvM1RPN3FuZFZNUkM=",}
      };
      fetch(urlx, savetodbOptions)
      .then(resdata => {
      return resdata.json();
      })
      .then(resdatajson => {
        console.log("val acc res: ", resdatajson.result);
        if (resdatajson.resultcd == "S"){
          var accstat = resdatajson.result[0].status
          if(accstat.trim() == "Pending"){
            this.setState({auth: true,authpending:true})
          }
          else if(accstat.trim() == "Active"){
            this.setState({auth: true,valapikey:true})
          }
          else{
            this.setState({auth: true,authpending:false})
          }
        }
        else{
          this.setState({authregister: true,auth: false})
        }
      })
      .catch(err => {
        this.setState({authregister:false,autherror:true})
        console.log('validate acc: ' + err);
      });
  }

  render() {
  console.log("status:" ,this.state.auth,this.state.authpending)
  if(this.state.auth == false){
    return(
      <Query query={GET_SHOP} variables={{ids: store.get('ids')}} onCompleted={(e)=>this.setacc(e)}>
      {({data, loading, error}) => {
        if (loading) return <div>Loading…</div>;
        if (error) return <div></div>;
        console.log(data);
        if(this.state.authregister == true){
          
              return(
                <Page>
                  <Register storedet={data}/>
                </Page>
              );
            
        }else{
          if(this.state.autherror==true){
            return(
              <Page>
                <ErrorValAcc/>
              </Page>
            );
          }else{
            return(
              <Page>
              </Page>
            );
          }
        }
      }}
    </Query>
    )
  }else{
    return(
      <Query query={GET_SHOP} variables={{ids: store.get('ids')}} onCompleted={(e)=>this.setacc(e)}>
      {({data, loading, error}) => {
        if (loading) return <div>Loading…</div>;
        if (error) return <div></div>;
        console.log(data);

     if(this.state.auth == true && this.state.authpending == true){
       return(
        <Page>
        <PendingApprove/>
        </Page>
       );
     }
     else if(this.state.auth == true && this.state.valapikey == true){
      return(
       <Page>
       <Valapikeypage accdetail={data}/>
       </Page>
      );
     }else{
      return(
        <Page>
        <DisplayText size="extraLarge">Order Pages</DisplayText><br/>
        <DisplayText size="extrasmall">This is a central hub for POS MALAYSIA apps</DisplayText><br/>
        <Orderpage shopdetail = {data}/>
      </Page>
      );
     }
    }}
    </Query>
    );
   }
  }
}

export default Index;
