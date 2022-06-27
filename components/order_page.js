import React,{ useState, useEffect, useCallback} from 'react';
import { DataTable, Pagination, Select, TextField, Filters,  TextStyle, Card, IndexTable, useIndexResourceState, Modal,TextContainer,Button, Page} from '@shopify/polaris';
import { keys } from '@material-ui/core/styles/createBreakpoints';
import gql from 'graphql-tag';
import App from 'next/app';
import Tracking from '../components/tracking';
import Pickup from '../components/pickup_request';
import PrintRoundedIcon from '@material-ui/icons/PrintRounded';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { render } from 'react-dom';

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
    const handleChangetrack = useCallback(() => setActivetrack(!activetrack), [activetrack]);  
    ///########################

    // pickup modal
    const [activepickup, setActivepickup] = useState(false);
    const handleChangepickup = useCallback(() => setActivepickup(!activepickup), [activepickup]); 
    //####################

    //dropoff modal
    const [activedropoff, setActivedropoff] = useState(false);
    const handleChangedropoff = useCallback(() => setActivedropoff(!activedropoff), [activedropoff]); 
    //######################################

  ///////get order list
  const [orders, setOrders] = React.useState([]);
  
  
 
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
               console.log("Shop data :",shopname);
               console.log("orders data :" + JSON.stringify(data.result));
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
console.log("selectedid: ",selectedid);
const handleOnChange = useCallback((id) => {
  let selected = selectedid;
  let find = selectedid.indexOf(id);

  if(find > -1){
    selected.splice(find, 1);
  } else {
    selected.push(id);
  }
  setSelectedid(selected);
});

//###########################################

  const connn = orders.map(({ id, name, ConnoteNo, FirstName, LastName, contact_email, created_at, shopify_shop_domain,checkstat}, index) => (
    <tr key={index}>
      <td> <input
            type="checkbox"
            id={`custom-checkbox-${index}`}
            name={id}
            value={id}
            disabled={checkstat}
            onChange={() => handleOnChange(id)}
            selected={selectedid.includes(id)}
      />
      </td>
      <td>{name}</td>
      <td>{ConnoteNo}</td>
      <td>{FirstName} {LastName}</td>
      <td>{contact_email}</td>
      <td>{created_at}</td>
      <td><span>{<button align="center" class="button button4" onClick={() => getData(shopify_shop_domain,id)} 
      />}</span>
      </td>
      <td><button>btn la setan</button>
      {<ArrowForwardIosIcon style ={{ fontsize="50px" }} class="button button4" id="btnTracking" onClick={() => {
        setconnoteno(ConnoteNo);
        setActivetrack(true);} } 
      />}
      </td>
    </tr>
    ))
      //##################################
      
//console.log("selected resource: ", selectedorderid);

//############################
  return (
    <div className="container">
      <body>
        <table id="orders">
            <thead  align="center">
            <tr>
                <th></th>
                <th scope="col">Order ID</th>
                <th scope="col">Tracking No</th>
                <th scope="col">Customer Name</th>
                <th scope="col">Customer Email</th>
                <th scope="col">Date</th>
                <th></th>
                <th></th>
            </tr>
            </thead>
            <tbody>
                { connn }
            </tbody>
        </table>
        <br/>
        <p align='right'></p><button class="button buttonCPD" onClick={() => {
        setActivepickup(true);} } 
        >Create Pickup</button>
        <button class="button buttonCPD" onClick={handleChangedropoff}>DROPOFF</button>
        <br/>
        <p align='center'>{`Showing ${orders.length} of ${orders.length} results`}</p>
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
              primaryAction={{
                content: 'Close',
                onAction: handleChangepickup,
              }}
            >
            <Modal.Section>
              <Page>
              <Pickup shopname={[shopdet.shop.name,selectedid]} />
              </Page>
            </Modal.Section>
        </Modal>    
        
    </div>
    );

//   return <MDBDataTableV5 hover entriesOptions={[5, 20, 25]} entries={5} pagesAmount={4} data={datatable} fullPagination/>;
}
