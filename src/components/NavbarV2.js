import React, { Component } from 'react';
import 'react-dom';
import {Redirect} from 'react-router-dom';
import {Typeahead} from 'react-bootstrap-typeahead';
import Autocomplete from  'react-autocomplete';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.css';
import './stylings/navBarV2.css';

class NavBar extends Component {
  constructor(props){
    super(props)
    this.state = {
      coopsId: [],
      coops: [],//[{'name':'john','id':123},{'name':'paul','id':1234}],
      coopSelected: '',
      startDate: '',
      endDate: ''
    }
    this.logout=this.logout.bind(this);
    this.getCoopsList=this.getCoopsList.bind(this);
    this.maxDate=this.maxDate.bind(this);
    this.date_1_DefaultDate=this.date_1_DefaultDate.bind(this);
    this.date_2_DefaultDate=this.date_2_DefaultDate.bind(this);
    this.date_1_minDate=this.date_1_minDate.bind(this);
    this.date_2_minDate=this.date_2_minDate.bind(this);
    this.onSelectCoop=this.onSelectCoop.bind(this);
    this.handleStartDateChange=this.handleStartDateChange.bind(this);
    this.handleEndDateChange=this.handleEndDateChange.bind(this);
    this.handleDefaultDateChange=this.handleDefaultDateChange.bind(this);
    this.getCookie=this.getCookie.bind(this);
  }

  logout(){//this is the logout fuction
    localStorage.clear();//clearing the localstorage data
    sessionStorage.clear();//clearing the localstorage data
    if(!localStorage.getItem("Token")){//checking if the token was cleared
      console.log("I was logged out");
      return (//returning to the login page
        console.log("I was redirected"),
        <Redirect exact to={'/'}/>,//redirecting to the login page
        window.location.reload()//this is used to refresh the page
      )
    }
  }
  handleChange = (event) => {this.setState({ value: event.target.value })}
  /*handleDateChange = (newDate) => {
    this.setState({startDate: newDate});
    console.log("startDate "+ this.state.startDate);
  }*/
  componentDidMount(){
    this.getCoopsList();
  }
  getCookie(sKey) {//this fuction extracts the token value from the cookie storage
    if (!sKey) { return null; }
    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
  }

  getCoopsList(){//this function populates the coops list in the search bar
    console.log("getCoopsList function has been called");
    fetch('https://emata-crmservice-test.laboremus.no/api/organisation',{
        headers: {
          'Authorization':'Bearer '+this.getCookie("ac-tn"),
          'Transfer-Encoding': 'chunked',
          'Content-Type': 'application/json;charset=UTF-8',
          'Content-Encoding': 'gzip',
          'Vary':'Accept-Encoding',
          'X-Content-Type-Options':'nosniff',
        },
        method: 'GET'
    })
    .then(response=>response.json())
    .then(res=>{
       if(!res){
        console.log("--------------No response yet--------------");
      }
      else{
        console.log("This is the feedback: ",res);
        console.log("---------------------------------------");
        console.log("Status: "+res.code);
        if(res.code===400){//please try again later alert needed
          alert('ERROR-CODE 400');
        }
        else if(res.code===500){
          console.log("------------------ERROR-CODE 500---------------------");
          console.log("StatusMessage: "+res.message);
          this.getCoopsList();
        }
        else{
          console.log(res);
          let newState = this.state;
          newState.coops = [];
          for (let i=0; i<res.length; i++) {
            if(res[i].isMainBranch){//checking if the coop is the main branch
              newState.coops[i] = {'name':res[i].name,'id':res[i].id};
            }
          }
          if(newState.coops.length>0){//this condition set the default value of the search input
            console.log("---------------setting the defaultValue for search box-------------------");
            if(sessionStorage.getItem('cp-sl-id')){//check if there was a particular coop selected(this helps retain the same coop when the page is refreshed)
              this.props.passCoopSignal(sessionStorage.getItem('cp-sl-id'),sessionStorage.getItem('cp-sl-nm'));
            }
            else{
              this.props.passCoopSignal(newState.coops[0].id,newState.coops[0].name);
            }
          }
          this.setState(newState);
          localStorage.setItem('cps',this.state.coops);
        }
      }
    })
    .catch((error)=>{
        return(error);//reject(error);
    });
  }
  
  handleStartDateChange(e){
    console.log(e.target.value);
    sessionStorage.setItem('startDt-sl',e.target.value);
    let newState = this.state;
    newState.startDate = String(e.target.value);
    this.setState(newState);
    //this.props.passDateSignal(this.state.startDate, this.state.endDate);
    console.log("startDate Change: "+ this.state.startDate);
  }
  handleEndDateChange(e){
    console.log(e.target.value);
    sessionStorage.setItem('endDt-sl',e.target.value);
    let newState = this.state;
    newState.endDate = String(e.target.value);
    this.setState(newState);
    this.props.passDateSignal(this.state.startDate, this.state.endDate);
    console.log("EndDate Change: "+ this.state.endDate);
  }
  handleDefaultDateChange(startDate,endDate){
    console.log("handleDefaultDateChange Called");
    this.props.passDateSignal(startDate, endDate);//this passes the dates props to the parent component
  }
  date_1_DefaultDate(){
    if(!sessionStorage.getItem('startDt-sl')){
      var curr = new Date();
      console.log("Default Curr date: "+curr);
      curr.setDate(curr.getDate()-7);
      var date = curr.toISOString().substr(0,10);
      sessionStorage.setItem('startDt-sl',date);
      console.log("Default 1 date: "+date);
      return date
    }
    else{return sessionStorage.getItem('startDt-sl');}
  }
  date_2_DefaultDate(){
    if(!sessionStorage.getItem('endDt-sl')){
      var currentDate = new Date();
      currentDate.setDate(currentDate.getDate());
      var date = currentDate.toISOString().substr(0,10);
      console.log("Default 2 date: "+date);
      sessionStorage.setItem('endDt-sl',date);
      return date
    }
    else{return sessionStorage.getItem('endDt-sl');}
  }
  date_1_minDate(){
    let minDate = new Date();
    minDate.setDate(1);
    minDate.setMonth(0);
    minDate.setFullYear(2018);
    minDate = minDate.toISOString().substr(0,10)
    return minDate;
  }
  date_2_minDate(){return sessionStorage.getItem('startDt-sl');}

  maxDate(){
    var curr = new Date();
    curr.setDate(curr.getDate());
    var date = curr.toISOString().substr(0,10);
    return date;
  }
  onSelectCoop(obj) {//this function gets the selected coop and saves it to local storage
    if(obj.length>0){//this checks if the obj array has a value
      console.log('onSelectCoop.call ', obj);
      console.log('onSelectCoop.name ', obj[0].name);
      let newState = this.state;
      newState.coopSelected = obj[0].name;
      this.setState(newState);
      sessionStorage.setItem('cp-sl-id',obj[0].id);//saving the selected coop id to the localStorage
      sessionStorage.setItem('cp-sl-nm',obj[0].name);//saving the selected coop name to the localStorage
      this.props.passCoopSignal(obj[0].id,obj[0].name);
    }
  }

  render(){
    return (
      <div className="navBarStyle2">
        <img className="navLogo2" src={require("./images/emata-logo.png")} alt={"logo"}/>
        <div className="pageName2">Dashboard</div>
        <Typeahead 
          bsSize = 'sm'
          className="navBarSearch2"
          labelKey="name"
          caseSensitive = {false}
          onChange={(e)=>this.onSelectCoop(e)}
          options={this.state.coops}
          placeholder="search coops..."
          emptyLabel="no match found"
          selectHintOnEnter={true}
        />
        <div className="dateBackground2">
          <input 
              id="myDate" 
              type="date" 
              className="dateBox2" 
              name="" 
              onChange={(e) => this.handleStartDateChange(e)}
              defaultValue={this.date_1_DefaultDate()} 
              min={this.date_1_minDate()} 
              max={this.maxDate()}
          /> 
        </div>
        <label className="to2"> to </label>
        <div className="dateBackground2">
          <input 
              type="date" 
              className="dateBox2" 
              name="" 
              onChange={(e) => this.handleEndDateChange(e)} 
              defaultValue={this.maxDate()} 
              min={this.date_2_minDate()}
              max={this.maxDate()}
          /> 
        </div>

        {this.handleDefaultDateChange(this.date_1_DefaultDate(),this.date_2_DefaultDate())}
        
        <img className="navBarUsernameIcon" src={require("./icons/userIcon3.png")} alt={"userIcon"}/>
        <div className="usernameLabel2">{localStorage.getItem("FirstName")}</div>
        <button className="navBarSignOutButton2" onClick={this.logout}>
          <div>
            <div className="usernameLabel2">Sign out</div>
            <img className="navBarLogoutIcon" src={require("./icons/logoutIcon2.png")} alt={"userIcon"}/>
          </div>
        </button>
      </div>
    );
  }
}

export default NavBar;