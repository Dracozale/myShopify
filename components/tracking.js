import gql from 'graphql-tag';
import React,{useState, useEffect, useCallback} from 'react';
import { Button } from '@shopify/polaris';


const GET_SHOP = gql`
query {
  shop{
  name
  currencyCode
  billingAddress {
  id
  address1
  zip
  }
  }
  }`;


const Tracking = (connoteno) => { 

  const [Trackings,setTrackings] = useState([]); 

  const [active, setActive] = useState(false);
  const handleChange = useCallback(() => setActive(!active), [active]); 
  const activator = <Button onClick={handleChange}>Create Label</Button>;
  <Button onClick={handleChange}>Refresh list</Button>;

  
   useEffect(() => {
    var econn = connoteno.connoteno;
    console.log("result connote no: ", econn);

    const url = `https://apis.pos.com.my/apigateway/as2corporate/api/v2trackntracewebapijson/v1?id=${econn}&Culture=En`;
      fetch(url, {  
      method: "GET",
      headers: {
        "X-User-Key": "RmdJRmVESWp6NmF5SVJVd1dLdHhIRW5iQ05EQ3dvUms=",
      },
    })
      .then(data => {
        return data.json();
      })
      .then(data => {
        console.log("result data: " + JSON.stringify(data));
        //console.log("result resdata: " + JSON.stringify(data.resData));
        setTrackings(data);
      })
      .catch(err => {
        console.log('Tracking data is empty' + err);
      });
  }, []); 

  
  const connn = Trackings.map((item) => (
    <tr key={item.id}>
        <td>{item.date}</td>
        <td>{item.process}</td>
        <td>{item.office}</td>
    </tr>
  ))

   return (
      <body>
      <h1 align="left" style={{fontWeight: "bold"}}>Tracking Status For item: {connoteno.connoteno}</h1> 
      <table id="orders">
          <thead  align="center">
          <tr>
              <th scope="col">Date</th>
              <th scope="col">Event</th>
              <th scope="col">Location</th>
          </tr>
          </thead>
          <tbody>
              { connn }
          </tbody>
      </table>
      <p align='center'>{`Showing ${Trackings.length} of ${Trackings.length} results`}</p>
      
      </body>
     
  );
}
export default Tracking;