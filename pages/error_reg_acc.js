import React,{useState, useEffect, useCallback} from 'react';
import { Page, DisplayText } from '@shopify/polaris';

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};
  };

  render() {
    return(
        <Page>
             <DisplayText size="extraLarge">Error Registering</DisplayText><br/>
             <DisplayText size="extrasmall">There is some issue with the registering. Please Contact POS Malaysia Digital Team</DisplayText><br/>
        </Page>
      );
    }
}

export default Index;