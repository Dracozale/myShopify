import React,{ useState, useEffect, useCallback} from 'react';
import { DataTable, Pagination, Select, TextField, Filters,  TextStyle, Card, IndexTable, useIndexResourceState,Modal,TextContainer,Button,Page} from '@shopify/polaris';
import { keys } from '@material-ui/core/styles/createBreakpoints';
import gql from 'graphql-tag';
import App from 'next/app';
import Tracking from '../components/tracking';
import Pickup from '../components/pickup_request';
import PrintRoundedIcon from '@material-ui/icons/PrintRounded';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { render } from 'react-dom';
import { AddAlertRounded } from '@material-ui/icons';
import Alert from '@material-ui/lab/Alert';

export default function Orderpage (shopdetail) {

  var shopdet = shopdetail.shopdetail;
  getOrderlist(shopdet.shop.name);

    ///print label modal
    const [base64, setbase64] = useState([]); 
    const [active, setActive] = useState(false);
    
    const handleChangemodal = useCallback((e) =>{ 
    console.log("e data",e); 
    //getOrderlist(shopdet.shop.name);
    window.location.reload(true);
    setActive(!active), [active]
    });
    //#####################

    /// tracking modal
    const [connoteno, setconnoteno] = useState("");
    const [activetrack, setActivetrack] = useState(false);
    const [activeerror, setActiveerror] = useState(false);
    const handleChangetrack = useCallback(() => setActivetrack(!activetrack), [activetrack]);  
    const handleChangeerror = useCallback(() => setActiveerror(!activeerror), [activeerror]);  
    ///########################

    // pickup modal
    const [activepickup, setActivepickup] = useState(false);
    // const handleChangepickup = useCallback(() => {
    //   if(selectedid.length < 5){
    //     console.log("kurang 5: ",selectedid.length);
    //     alert("checked item less than 5!")
    //   }else{
    //     setActivepickup(!activepickup), [activepickup]
    //   }
    // }); 
    const handleChangepickup = useCallback(() => setActivepickup(!activepickup), [activepickup]); 
    //####################

    //dropoff modal
    const handlesubmitdropoff = useCallback(() => {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("X-User-Key", "QXhrS2NJVExVQWNtbmNsa0c5eWhzRXpTbXo0d0QwN2c=");
      var raw = {shopname:shopdet.shop.name,orderid:selectedid}
      var data = JSON.stringify(raw);
      console.log("Dropoff Data data: ", data);
      var pickupoptions = {
      method: 'POST',
      headers: myHeaders,
      body: data,
      redirect: 'follow'
      };
      fetch(`https://apis.pos.com.my/apigateway/as01/api/shopify_dropoff/v1`, pickupoptions)
      .then(function(response) {
      return response.text();
      }).then(resdata => {
      var resjson = JSON.parse(resdata);
      var resjoncd = resjson.Dropoffresult;
      console.log("response dropoff request: ",resjoncd)
      if(resjoncd = "Ready to dropoff"){
        alert("selected item ready to dropoff")
        setSelectedid([]);
        window.location.reload(true);
      }else{
        alert("Error sending data to POS Malaysia. please contact POS malaysia!")
      }
      })
      .catch((error) => {
      console.error("Error pickup request : " + error);
        });
    }); 
    //######################################

///////get order list
const [orders, setOrders] = React.useState([]);
const [acctno, setacctno] = React.useState([]);
  
function getOrderlist(shopname){
    React.useEffect(() => {    const url = 
      `https://apis.pos.com.my/apigateway/as01/api/shopify_orderwithcustomer/v1?shopdomain=${shopname}.myshopify.com`     
           fetch(url, {  
           method: "GET", 
           headers: {
             "X-User-Key": "SWJ3WkVlVEt6TkxiUkU5T3FTU2N5V3RGZnRKY3BYNTc=",
           },

           })
           .then(data => {
               return data.json();
           })
           .then(data => {
               console.log("orders data :" + JSON.stringify(data.result));
               setacctno(data.result[0].acctno);
               let datas = data.result;
               let Ldata = datas.length;
               setOrders(data.result);
               
           })
           .catch(err => {
               console.log('data is empty');
           });
       }, []);
  }
//#################################
  
/// get label
function getData(shopname,orderid){
    const url = `https://apis.pos.com.my/apigateway/as01/api/shopify_preacceptancev2/v1?shopname=${shopname}&orderid=${orderid}`
          fetch(url, {  
            method: "GET", 
            headers: {
              "X-User-Key": "OUVjMXdBY2psdlExV2R3cHp3aVFVNmEyZWlqTDRXeWc=",
            },
            })
            .then(data => {
              return data.json();
            })
            .then(data => {
              var jsondata = data;
              var datapdf = jsondata.ress.pdf;
              setbase64(datapdf);
              setActive(true);
          })
            .catch(err => {
                console.log('No Data Requested', err);
            });
    }
/////########################################
   
//############## base 64 converter
  var bin = base64;
  var labeltorpint;
  console.log("base64: ",bin);

  //console.log('File Size:', Math.round(bin.length / 1024), 'KB');
  const meta = 'data:application/pdf;base64,';
  const data = meta + base64.toString();  
  
  const img = 'https://www.pos.com.my/media/wysiwyg/Rectangle_32_1.png';

  if (base64 == '') {
    labeltorpint = img
  } else {
    labeltorpint = data;
  }

  //###################################  
 
 //checkbox function
const [selectedid, setSelectedid] = useState([]);
const [selectedcon, setSelectedcon] = useState([]);

console.log("selectedid: ",selectedid);
console.log("selectedcon: ",selectedcon);

const handleOnChange = useCallback((id,ConnoteNo) => {
  let selected = selectedid;
  let selected2 = selectedcon;
  let find = selectedid.indexOf(id);
  let find2 = selectedcon.indexOf(ConnoteNo);
  
  if(find > -1 && find2 > -1){
    selected.splice(find, 1);
    selected2.splice(find2, 1);
  } else {
    selected.push(id);
    selected2.push(ConnoteNo);
  }  
 
  setSelectedid(selected);   
  setSelectedcon(selected2);  
 
});

function checkselectcheckbox () {

     console.log(selectedid.length)
     let t = selectedid.length;
     if (t < 5) {
     console.log("minimum is 5 for pickup") 
     //alert("minimum item for pickup is 5")
     setActiveerror(true);
    } else if (t >= 5) {
    console.log("ok") 
         setActivepickup(true);
    }  
    
    console.log("selectedid " + selectedid)
    console.log("selectedcon " + selectedcon)
}

//###########################################

  const connn = orders.map(({ id, name, ConnoteNo, FirstName, LastName, contact_email, created_at, shopify_shop_domain,checkstat,pickup_status,color,status,status_date}, index) => (
  
    <tr key={index}>
      <td> <input
            type="checkbox"
            id={`custom-checkbox-${index}`}
            name={id}
            value={id,ConnoteNo}
            disabled={checkstat != '1'}
            onChange={() => handleOnChange(id,ConnoteNo)}
            selected={selectedid.includes(id,ConnoteNo)}

      />
      </td>
      <td>{name}</td>
      <td>{ConnoteNo}</td>
      <td>{FirstName} {LastName}</td>
      <td>{contact_email}</td>
      <td>{created_at}</td>
      <td>{status}</td>
      <td>{status_date}</td>
      <td>{
      <button onClick={() => getData(shopify_shop_domain,id)}><i></i>< img width="20px" src ="https://freeiconshop.com/wp-content/uploads/edd/print-outline.png"/></button>
      }</td>
      <td>{
      <button onClick={() => {
        setconnoteno(ConnoteNo);
        setActivetrack(true);} } ><i></i><img width="20px"  src="https://freeiconshop.com/wp-content/uploads/edd/document-search-flat.png"/></button>
      }</td>    
       
    </tr>
    ))
      //##################################
      
      
      
//console.log("selected resource: ", selectedorderid);

//############################
  return (
    <div className="container responsive">
      <body>
        <table id="orders">
            <thead  align="center">
            <tr>
                <th></th>
                <th scope="col">Order ID</th>
                <th scope="col">Tracking No</th>
                <th width = "100px" scope="col">Customer Name</th>
                <th scope="col">Customer Email</th>
                <th scope="col">Date</th>
                <th scope="col">Status</th>
                <th scope="col">Status Date</th>
                <th scope="col">Label</th>
                <th scope="col">Track N Trace</th>
            </tr>
            </thead>
            <tbody>
                { connn }
            </tbody>
        </table>
        <br/>
      <button class="" onclick={() => previouspage }>{'< Previous'}</button>
      <button onclick={() => nextpage }>{'Next >'}</button>
      <br/>
      <p align='center'>{`Showing ${orders.length} of ${orders.length} results`}</p>
        <br/>
        <p align='right'></p><button class="button button3" onClick={() => {
        //setActivepickup(true);} } 
        checkselectcheckbox()} } 
        >Create Pickup</button>
        <button class="button button3" onClick={handlesubmitdropoff}>DROPOFF</button>
        <br/>
        </body>
        <br/>
        <div style={{center: '300px'}}>
        <Modal
              large = "100px"
              open={active}
              onClose={handleChangemodal}
              title="Poslaju Label"
              primaryAction={{
                content: 'Close',
                onAction: handleChangemodal,
              }}
            >
        <iframe src={labeltorpint} 
          width="800px"
          height="700px"
        />
        </Modal>
        </div>  
        <Modal
              large = "100px"
              open={activetrack}
              onClose={handleChangetrack}
              title="Tracking Item"
              primaryAction={{
                content: 'Close',
                onAction: handleChangetrack,
              }}
            >
            <Modal.Section>
              <Page>
              <Tracking connoteno={connoteno} />
              </Page>
            </Modal.Section>
        </Modal>

         <Modal
              large = "Max"
              open={activepickup}
              onClose={handleChangepickup}
              title="Create Pickup"
              //className="special_modal"
              style={{color: 'white'}}
              primaryAction={{
                content: 'Close',
                onAction: handleChangepickup,
              }}
            >
            
            <Modal.Section>
              <Page>
              <Pickup shopname={[shopdet.shop.name,selectedid,shopdetail,selectedcon,acctno]} />
              </Page>
            </Modal.Section>
        </Modal>    
        
       <Modal
              //large = "Max"
              open={activeerror}
              onClose={handleChangeerror}
              title="Alert!"
              primaryAction={{
                content: 'Close',
                onAction: handleChangeerror,
              }}
            >
            
            <Modal.Section>
              <Page>
              <div><strong>minimum for pickup is 5 item</strong></div>
              </Page>
            </Modal.Section>
        </Modal>  
        
    </div>
    );

//   return <MDBDataTableV5 hover entriesOptions={[5, 20, 25]} entries={5} pagesAmount={4} data={datatable} fullPagination/>;
}
