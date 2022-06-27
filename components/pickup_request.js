import React,{Fragment,useState, useEffect, useCallback} from 'react';
import {TextStyle, Card, IndexTable, useIndexResourceState, Modal,TextContainer,Button,Page} from '@shopify/polaris';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import {
  KeyboardTimePicker,
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import moment from 'moment';
import Orderpage from './order_page_dev';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
}));

function disableWeekends(date) {
  return date.getDay() === 0 || date.getDay() === 6;
}

const Setpickup = (data) => { 
const [selectedDate, setSelectedDate] = React.useState(new Date());
const shopname = data.shopname[0];
const orderidlist = data.shopname[1];
const [closemodal, setClosemodal] = useState(false);
const connotelist = data.shopname[3];
const [base64, setbase64] = useState([]); 
const [active, setActive] = useState(false);
const [loading, setloading] = useState(false);

const handleChangesubmitpickup = useCallback(() => {
  var myHeaders = new Headers();
  var year = selectedDate.getFullYear();
  var month = ("0" + (selectedDate.getMonth() + 1)).slice(-2);
  var day = ("0" + (selectedDate.getDay() + 1)).slice(-2);
  var pickupdate = year + "-" + month + "-" + day;


  //var hours = selectedDate.getHours();
  //var minutes = selectedDate.getMinutes();
  //var ampm = hours >= 12 ? 'pm' : 'am';
  //hours = hours % 12;
  //hours = hours ? hours : 12; // the hour '0' should be '12'
  //hours = ("0" + (hours)).slice(-2);
  //sminutes = minutes < 10 ? '0'+minutes : minutes;
  //var strTime = hours + ':' + minutes + ' ' + ampm;  
  //console.log("time" + hours + ':' + minutes + ' ' + ampm)
  
  var d = new Date();
  var dd = d.getHours()
  var mm = d.getMinutes()
  var cc = dd >= 12 ? 'pm' : 'am'
  dd = dd % 12;
  dd = dd ? dd : 12;
  dd = ("0" + (dd)).slice(-2);
  mm = mm < 10 ? '0'+mm : mm;
  var hr = dd + ":" + mm + " " + cc;
  var strTime = hr
  console.log(strTime)
  
  console.log("selected date: ", year + "-" + month + "-" + day );
  console.log("selected time: ", strTime);
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("X-User-Key", "ODJPTFZKUm5kSzRjek5WZEFKaXB1T1JtTGRuTnhaZzc=");
  var shopn = shopname;
  var raw = {shopname:shopn,orderid:orderidlist,pickupdate:pickupdate,pickuptime:strTime,connote:connotelist}
  var data = JSON.stringify(raw);
  console.log("raw data: ", data);  
  
  var pickupoptions = {
  method: 'POST',
  headers: myHeaders,
  body: data,
  redirect: 'follow'
  };
  
  fetch(`https://apis.pos.com.my/apigateway/as01/api/shopify_createpickup/v1`, pickupoptions)
  .then(function(response) {
  return response.text();
  }).then(resdata => {
  var resjson = JSON.parse(resdata);
  console.log("resjson " + resjson);
  var resjoncd = resjson.Pickupresult;
  console.log("response pickup request: ",resjoncd)  
  if(resjoncd = "pickup created"){
  epl9();
  //window.location.reload(true);
  }else{
    window.location.reload(false);
  }
  })
  .catch((error) => {
      console.error("Error pickup request : " + error);
        });
  
  //fetch(`https://apis.pos.com.my/apigateway/as01/api/shopify_createpickup/v1`, pickupoptions)
  //.then(function(response) {
  //return response.text();
  //}).then(resdata => {
  //var resjson = JSON.parse(resdata);
  //var resjoncd = resjson.Pickupresult;
  //console.log("response pickup request: ",resjoncd)  
  //if(resjoncd = "pickup created"){
  //  window.location.reload(true);
  //}else{
  //  window.location.reload(false);
  //}
  //})
  //.catch((error) => {
  //    console.error("Error pickup request : " + error);
   //     });
// setActive(!active), [active]

  //fetch(`https://apis.pos.com.my/apigateway/as01/api/shopify_createpickup/v1`, pickupoptions)
  //.then(function(response) {
  //return response.text();
  //}).then(resdata => {
  //var resjson = JSON.parse(resdata);
  //var resjoncd = resjson.Pickupresult;
  //console.log("pickup item: ",resjoncd)
  //})
  

}); 


const submitpickup = <Button color="white" onClick={handleChangesubmitpickup}>Submit Pickup</Button>;

const classes = useStyles();

const handleDateChange = (date) => {
  setSelectedDate(date);
};

console.log("alolo" + data.shopname[1])
console.log("data: ", data.shopname[2].shopdetail.shop.billingAddress)
console.log("connote: ", data.shopname[3])
console.log("Nama Kedai Aku :", data)
console.log("acctno: ", data.shopname[4])
var address1 = data.shopname[2].shopdetail.shop.billingAddress.address1;
var address2 = data.shopname[2].shopdetail.shop.billingAddress.address2;
var city = data.shopname[2].shopdetail.shop.billingAddress.city;
var zip = data.shopname[2].shopdetail.shop.billingAddress.zip;
var state = data.shopname[2].shopdetail.shop.billingAddress.province;
var phone = data.shopname[2].shopdetail.shop.billingAddress.phone;
var acctno = data.shopname[4];
var orderid = data.shopname[1];
const con = data.shopname[3];
var qty = con.length;
var text = "";
for (let i = 0; i < con.length; i++) {
  text += con[i] + "\n";
} 
console.log(text)


function epl9(){

setloading(true);

  console.log("print epl9")
  console.log("orderid " + orderid)
  
  let epl9 = "shopifytest"
 
  var myHeaders = new Headers();
  myHeaders.append("X-User-Key", "Rks0OU81ajlPSGpGQ3pyN1JRZllHTUZ0bmtvMm1WWEc=");
  myHeaders.append("Content-Type", "application/json");
  var shopn = shopname;
  var raw ={epl9no:epl9,accountno:acctno,sendername:shopname,address1:address1,address2:address2,city:city,state:state,postcode:zip,notel:phone,qtyofitem:qty,orderid:orderid};
            
  var data = JSON.stringify(raw);
  console.log("raw data: ", data);  
  
  var pickupoptions = {
  method: 'POST',
  headers: myHeaders,
  body: data,
  redirect: 'follow'
  };
  fetch(`https://apis.pos.com.my/apigateway/as01/api/epl9_label/v1`, pickupoptions)
  .then(function(response) {
  return response.json();
  }).then(jsondata => {
  setloading(false);
    //console.log(jsondata);
    //var jsondata = JSON.parse(resdata);
    var datapdf = jsondata.pdf;
    setbase64(datapdf);
    //console.log('pdf ', datapdf);
    setActive(true);
  })
  .catch((error) => {
   setloading(false);
       console.log('No Data Requested', error);
  });

    
}

  var bin = base64;
  var labeltorpint;
  const meta = 'data:application/pdf;base64,';
  const data2 = meta + base64.toString();  
  
  const img = 'https://www.pos.com.my/media/wysiwyg/Rectangle_32_1.png';

  if (base64 == '') {
    labeltorpint = img
  } else {
    labeltorpint = data2;
  }
  
  const handleChangemodal = useCallback((e) =>{ 
    console.log("e data",e); 
    //getOrderlist(shopdet.shop.name);
    window.location.reload(true);
    setActive(!active), [active]
    });

// if(closemodal == true){
//   return(
//     <Page>
//         <Orderpage shopdetail = {data.shopname[2].shopdetail}/>
//     </Page>
//   );
// }else{
  return (
    <div>
    <h1 align="left" style={{fontWeight: "bold"}}>Shop Name : {shopname.toUpperCase() }</h1>
    <h1 align="left" style={{fontWeight: "bold"}}>Pickup Address : {address1.toUpperCase() + ' ' + address2.toUpperCase()  + ' ' + city.toUpperCase()  + ' ' + zip}</h1> 
    <h1 align="left" style={{fontWeight: "bold"}}>Pickup Request Item : {text}</h1> 
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Grid container justifyContent="space-around">
        <KeyboardDatePicker
          clearable
          margin="normal"
          id="date-picker-dialog"
          label="Pickup Date"
          shouldDisableDate={disableWeekends}
          value={selectedDate}
          onChange={handleDateChange}
          minDate={new Date()}
          maxDate={moment().add(7,'days')}
          format="yyyy-MM-dd"
          KeyboardButtonProps={{
            'aria-label': 'change time',
          }}
        />
          </Grid>          

         </MuiPickersUtilsProvider>
    {submitpickup}
    
   <Modal
              large = "100px"
              open={active}
              onClose={handleChangemodal}
              title="e-pl9 Label"
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
        
         <Modal
              Transparent={true}
              large = "100px"
              open={loading}
              //title="Loading"            
            >    
            <div><strong>LOADING !! <img width="20px" src="https://upload.wikimedia.org/wikipedia/commons/b/b9/Youtube_loading_symbol_1_(wobbly).gif"/>  </strong></div>
        </Modal>
    
    </div>
    
    );
//}
}
export default Setpickup;
