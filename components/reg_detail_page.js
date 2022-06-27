
import React,{useState, useEffect, useCallback} from 'react';
import {TextStyle, Card, IndexTable, TextField,TextContainer,Button,Page,Form,FormLayout} from '@shopify/polaris';
import PendingApprove from '../pages/register_pending_approval';

function Regdetail(accdetail) {
  const [email, setEmail] = useState('');
  const [name, setname] = useState('');
  const [phone, setphone] = useState('');
  const [toquestat, setToquestat] = useState(false);

  const handleSubmit = useCallback((_event) => {
    console.log("event : ", _event);
    console.log("name : ", name);
    console.log("email2 : ", email);
    console.log("phone : ", phone);
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("X-User-Key", "UnI3TmhLMkdZYkZwdFFqVmVqRHNpTVkydjBWbXVJckY=");
    accdetail.accdetail.email = email;
    accdetail.accdetail.name = name;
    accdetail.accdetail.phone = phone;
    var raw = JSON.stringify(accdetail.accdetail)
    console.log("raw data: ", raw);
    var savetodbOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    };
    fetch(`https://apis.pos.com.my/apigateway/as01/api/shopify_registerv2/v1`, savetodbOptions)
    .then(response => {
    return response.json() //var res=response);
    })
    .then(responsejson => {
      console.log("Register Acc res: ", responsejson.resultcd);
      if (responsejson.resultcd == "S"){
        setToquestat(true);
      }else{
        alert("Account Not Exist. Please Contact Pos Malaysia for further information.")
        //this.setState({auth: false,errorreg: true})
      }
      })
    .catch((error) => {
        this.setState({auth: false,errorreg: true})
        console.error("Error register Acc : " + error);
    });
  });

  const handleEmailChange = useCallback((value) => setEmail(value), []);
  const handlenameChange = useCallback((value) => setname(value), []);
  const handlephoneChange = useCallback((value) => setphone(value), []);
  console.log("email : ", email);
  if(toquestat == true){
    return(
      <Page>
      <PendingApprove/>
      </Page>
     );
  } else {
    return (
      <Form onSubmit={handleSubmit}>
        <FormLayout>
        <TextField
            class ="input"
            value={name}
            onChange={handlenameChange}
            label="Name to contact"
            type="name"
            helpText={
              <span>
                Please Enter Your Contact Name.
              </span>
            }
          />
        <TextField
        class ="input"
            value={phone}
            onChange={handlephoneChange}
            label="Phone"
            type="number"
            helpText={
              <span>
                Please Enter Your Contact Phone Number.
              </span>
            }
          />
          <TextField
          class ="input"
            value={email}
            onChange={handleEmailChange}
            label="Email"
            type="email"
            helpText={
              <span>
                We’ll use this email address to inform you on future changes to
                your account status.
              </span>
            }
          />
          <Button submit>Submit</Button>
        </FormLayout>
      </Form>
      );
  } 
}
export default Regdetail;
