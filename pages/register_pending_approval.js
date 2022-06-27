import React from 'react';
import { Page, DisplayText } from '@shopify/polaris';


class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};
  };

  render() {
    return(
        <Page>
             <DisplayText size="extraLarge">Pending Account Approval</DisplayText><br/>
             <DisplayText size="extrasmall">Please Wait While your request is being approve by POS MALAYSIA BERHAD</DisplayText><br/>
        </Page>
      );
    }
}

export default Index;
