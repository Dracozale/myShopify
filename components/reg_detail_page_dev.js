import React,{useState, useEffect, useCallback} from 'react';
import {TextStyle, Card, IndexTable, TextField,TextContainer,Button,Page,Form,FormLayout} from '@shopify/polaris';
import PendingApprove from '../pages/register_pending_approval';

function Regdetail(accdetail) {
    const [email, setEmail] = useState('');
  
    const handleSubmit = useCallback((_event) => {
    console.log("event : ", _event);
    console.log("email2 : ", email);
        

    });
  
    const handleEmailChange = useCallback((value) => setEmail(value), []);
    console.log("email : ", email);
    return (
      <Form onSubmit={handleSubmit}>
        <FormLayout>
          
        <TextField
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
export default Regdetail;