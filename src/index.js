import React, { Component} from 'react';
import ReactDOM from 'react-dom';
import {Switch,Route, BrowserRouter} from 'react-router-dom';
import ReduxStore from "./reduxStore";
import DashBoard from "./DashBoard";
import LoginPage from "./loginPage";
import Default from "./components/Default";
import * as serviceWorker from './serviceWorker';

class Login extends Component {
  constructor(props){
    super(props);
    this.state={id : 1}
  }
  render() {
    console.log("inside render");
    return <div>
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={LoginPage } />
          <Route path="/dashboard" component={DashBoard} />
          <Route component={Default} />
        </Switch>
      </BrowserRouter>
    </div>
  }
}

ReactDOM.render(<Login />, document.getElementById('just'));
serviceWorker.unregister();
