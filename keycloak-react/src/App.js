import React, { useState } from 'react';
import { Button, Card, Grid } from '@mui/material';
import './App.css';
import { httpClient } from './HttpClient';

import Keycloak from 'keycloak-js';

let initOptions = {
  url: 'http://localhost:8080/',
  realm: 'master',
  clientId: 'react-client'
}

let kc = new Keycloak(initOptions);

kc.init({
  onLoad: 'login-required', // Supported values: 'check-sso' , 'login-required'
  checkLoginIframe: true,
  pkceMethod: 'S256'
}).then((auth) => {
  if (!auth) {
    window.location.reload();
  } else {
    /* Remove below logs if you are using this on production */
    console.info("Authenticated");
     console.log('auth', auth)
    console.log('Keycloak', kc)
    console.log('Access Token', kc.token)

    /* http client will use this header in every request it sends */
    httpClient.defaults.headers.common['Authorization'] = `Bearer ${kc.token}`;

    kc.onTokenExpired = () => {
      console.log('token expired')
    }
  }
}, () => {
  /* Notify the user if necessary */
  console.error("Authentication Failed"); //
});


function App() {

  const [infoMessage, setInfoMessage] = useState('');

  /* To demonstrate : http client adds the access token to the Authorization header */
  const callBackend = () => {
    httpClient.get('https://jsonplaceholder.typicode.com/posts')
  };


  return (
    <div className="App">
      {
        console.log('kc=>', kc)
      }
     <Grid container>
     <Grid item xs={12} >
          <h1>My Secured React App</h1>
          </Grid>
      </Grid>

      <Grid container>
        <Grid item xs={6} >
          <Button onClick={() => { setInfoMessage(kc.authenticated ? 'Authenticated: TRUE' : 'Authenticated: FALSE') }}>Is Authenticated </Button><br/>
          <Button onClick={() => { kc.login() }} >Login</Button><br/>
          <Button onClick={() => { setInfoMessage(kc.token) }} >Show Access Token</Button><br/>
          <Button onClick={() => { setInfoMessage(JSON.stringify(kc.tokenParsed)) }} color="danger" variant="plain" >Show Parsed Access token</Button>   <br/>
          <Button onClick={() => { setInfoMessage(kc.isTokenExpired(5).toString()) }} >Check Token expired</Button><br/>
          <Button onClick={() => { kc.updateToken(10).then((refreshed) => { setInfoMessage('Token Refreshed: ' + refreshed.toString()) }, (e) => { setInfoMessage('Refresh Error') }) }} >Update Token (if about to expire) </Button><br/>
          <Button onClick={callBackend}>Send HTTP Request </Button><br/>
          <Button onClick={() => { kc.logout({ redirectUri: 'http://localhost:3000/' }) }}>Logout </Button><br/>
          <Button onClick={() => { setInfoMessage(kc.hasRealmRole('admin').toString()) }}>has realm role "Admin" </Button><br/>
          <Button onClick={() => { setInfoMessage(kc.hasResourceRole('test').toString()) }}>has client role "test"</Button><br/>
        </Grid>
        <Grid item xs={6}>

          <Card>
            <p style={{ wordBreak: 'break-all' }} id='infoPanel'>
              {infoMessage}
            </p>
          </Card>
        </Grid>

      </Grid>



    </div>
  );
}

export default App;
