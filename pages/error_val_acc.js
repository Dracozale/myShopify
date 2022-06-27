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
             <DisplayText size="extraLarge">Error</DisplayText><br/>
             <DisplayText size="extrasmall">Error validating Account Please Contact POS Malaysia Digital Team</DisplayText><br/>
        </Page>
      );
    }
}

export default Index;