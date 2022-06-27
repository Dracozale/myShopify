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


const handleChangesubmitpickup = useCallback(() => {
  var myHeaders = new Headers();
  var year = selectedDate.getFullYear();
  var month = ("0" + (selectedDate.getMonth() + 1)).slice(-2);
  var day = ("0" + (selectedDate.getDay() + 1)).slice(-2);
  var pickupdate = year + "-" + month + "-" + day;

  var hours = selectedDate.getHours();
  var minutes = selectedDate.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  hours = ("0" + (hours)).slice(-2);
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;

  console.log("selected date: ", year + "-" + month + "-" + day );
  console.log("selected time: ", strTime);
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("X-User-Key", "ODJPTFZKUm5kSzRjek5WZEFKaXB1T1JtTGRuTnhaZzc=");
  var shopn = shopname + ".myshopify.com";
  var raw = {shopname:shopn,orderid:orderidlist,pickupdate:pickupdate,pickuptime:strTime}
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
  var resjoncd = resjson.Pickupresult;
  console.log("response pickup request: ",resjoncd)  
  if(resjoncd = "pickup created"){
    window.location.reload(true);
  }else{
    window.location.reload(false);
  }
  })
  .catch((error) => {
      console.error("Error pickup request : " + error);
        });
// setActive(!active), [active]

  fetch(`https://apis.pos.com.my/apigateway/as01/api/shopify_createpickup/v1`, pickupoptions)
  .then(function(response) {
  return response.text();
  }).then(resdata => {
  //var resjson = JSON.parse(resdata);
  //var resjoncd = resjson.Pickupresult;
  //console.log("pickup item: ",resjoncd)
  })
  

}); 


const submitpickup = <Button onClick={handleChangesubmitpickup}>Submit Pickup</Button>;

const classes = useStyles();

const handleDateChange = (date) => {
  setSelectedDate(date);
};

console.log("data: ", data.shopname[2].shopdetail.shop.billingAddress)
console.log("connote: ", data.shopname[3])
console.log("Nama Kedai Aku :", shopname)
var address1 = data.shopname[2].shopdetail.shop.billingAddress.address1;
var address2 = data.shopname[2].shopdetail.shop.billingAddress.address2;
var city = data.shopname[2].shopdetail.shop.billingAddress.city;
var zip = data.shopname[2].shopdetail.shop.billingAddress.zip;
let con = data.shopname[3].toString();
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
    <h1 align="left" style={{fontWeight: "bold"}}>Pickup Request Item : {con}</h1> 
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
        <KeyboardTimePicker
            margin="normal"
            id="time-picker"
            label="Pickup Time"
            value={selectedDate}
            onChange={handleDateChange}
            KeyboardButtonProps={{
              'aria-label': 'change time',
            }}
          />
          </Grid>          

         </MuiPickersUtilsProvider>
    <br/>
    <br/>
    {submitpickup}
    </div>
    );
//}
}
export default Setpickup;
