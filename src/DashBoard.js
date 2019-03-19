import React from "react";
import {Redirect} from 'react-router-dom';
import PropTypes from "prop-types";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import Loader from './components/loadingDashBoard';
import NavbarV2 from "./components/NavbarV2";
import MonthlyOverview from './components/monthlyOverview';
import DeliveryAmounts from './components/deliveryAmounts';
import Payment from './components/Payment';
import Farmers from './components/Farmers';
import UtilizationRate from './components/utilizationRate';
import './stylings/dashboard.css';

class FullWidthGrid extends React.Component{
  constructor(props){
    super(props);
    this.state={
      coopId: "",
      coopName: '',//localStorage.getItem('cp-sl-nm'),
      startDate: '',
      endDate: '',
      entries: '',
      dateRangeEntries: [],
      renewTokenDetails: {username: '', password: '', clientId:'backoffice', clientSecret:'backoffice@lug'},
      paymentMethodData: [],
      farmerGraphData: {entries: '', startDate: '', endDate: '', contacts: ''},
      showLoader: false,
      open: false //this holds the state to either show or hide the Error dialog box 
    }
    this.renewToken= this.renewToken.bind(this);
    this.verification=this.verification.bind(this);
    this.getCoopsData=this.getCoopsData.bind(this);
    this.getDataByDateRange=this.getDataByDateRange.bind(this);
    this.paymentMethod=this.paymentMethod.bind(this);
    this.getCookie=this.getCookie.bind(this);
    this.setTokenCookie = this.setTokenCookie.bind(this);
    this.getContactsData = this.getContactsData.bind(this);
  }
  handleClickOpen = () => {//this handles the show error dialog box event
    if(this.state.open===false){this.setState({ open: true });}
  };
  handleClose = () => {//this handles the close error dialog box event
    if(this.state.open===true){this.setState({ open: false });}
  };
  handleCoopSignal=(id,name)=>{
    let newState=this.state;
    newState.coopId=id;
    newState.coopName= name;
    newState.showLoader=true;
    this.setState(newState);
    //get the whole time range of the data needed from the 1st of the previous year to the current date
    let end = new Date();
    let start = new Date();
    start.setDate(1);
    start.setMonth(0);
    start.setFullYear(end.getFullYear()-1);

    //console.log("startDate: "+start+" endDate: "+end);
    console.log("ID Passed: ", this.state.coopId,"Name Passed: ", this.state.coopName);
    console.log("Start-Date Passed: ", this.state.startDate);
    console.log("End-Date Passed: ", this.state.endDate);
    this.paymentMethod(this.state.coopId);
    this.getContactsData(this.state.coopId);
    this.getCoopsData(this.state.coopId,start,end,this.state.startDate,this.state.endDate);//start and end are the dates used to populate the milk collections card
  };
  handleDateSignal=(startDate,endDate)=>{//this handles the Date signal from the navBar component
    if(this.state.startDate!==startDate || this.state.endDate!==endDate){//checking if there has been a difference between the set dates and already stored dates(in state)
      let end = new Date(); let start = new Date(); let startDateCheck = new Date(startDate);let stateDateCheck = new Date(this.state.startDate);
      start.setDate(1);start.setMonth(0);start.setFullYear(end.getFullYear()-1);
      let newState=this.state;
      newState.startDate=startDate;
      newState.endDate=endDate;
      newState.farmerGraphData.startDate=startDate;
      newState.farmerGraphData.endDate=endDate;

      if(startDateCheck.getFullYear()<start.getFullYear() && startDateCheck.getFullYear()<stateDateCheck.getFullYear()){//this checks if the selected date is beyond the date of the data collected before
        console.log("----------------DATE EXCEEDED--------------");
        this.setState(newState);
        this.getCoopsData(this.state.coopId,startDate,end,startDate,endDate);
      }
      else{
        let dataRange=this.getDataByDateRange(newState.entries,startDate,endDate);
        newState.dateRangeEntries = dataRange;
        newState.farmerGraphData.entries = dataRange;
        this.setState(newState);
        console.log("Start-Date Passed: ", this.state.startDate);
        console.log("End-Date Passed: ", this.state.endDate);
      }
      //newState.showLoader=true;
    }
  };
  showLoader(){
    console.log("showLoader Started");
    //console.log("Token-Cookie: ", this.getCookie("ac-tn"));
    if(this.state.showLoader){return <Loader/>}
  }
  getCookie(sKey) {//this fuction extracts the token value from the cookie storage
    if (!sKey) { return null; }
    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
  }
  setTokenCookie(value){//this function save the token in cookie storage
    let tokenExpDate=new Date();
    tokenExpDate.setDate(tokenExpDate.getDate()+1);//this is used to set the expiry date of the cookie/token(86400 sec = 1 day);
    document.cookie = "ac-tn="+value+"; expires="+tokenExpDate+";"
  }
  //*
  componentDidMount(){
    this.timer = setInterval(this.renewToken, 85000000);//this timer is set to run the renewToken function to get a new token when time expires
    console.log("---------------------renewTokenDetails-----------------------");
    let newState=this.state;
    newState.renewTokenDetails.password=localStorage.getItem('ps');
    newState.renewTokenDetails.username=localStorage.getItem('us');
    console.log("---------------------renewTokenDetails: ", newState.renewTokenDetails);
    this.setState(newState);
    localStorage.removeItem('ps');
    localStorage.removeItem('us');
    console.log("---------------------State-TokenDetails: ", this.state.renewTokenDetails);
  }//*/
  componentWillUnmount(){clearInterval(this.timer);}

  renewToken(){
    console.log("-------Renewing token------");
    fetch('https://emata-authservice-test.laboremus.no/users/login',{
        headers: {
          'Access-Control-Allow-Origin':'http://localhost:3000/',
          'Accept':'application/json',
          'Content-Type':'application/json',//'application/x-www-form-urlencoded',//'application/json;charset=UTF-8',
          'Content-Encoding':'gzip',
          'Access-Control-Allow-Headers':'Origin, Authorization, X-Requested-With, Content-Type, Accept, Cache-Control',
          'Access-Control-Allow-Credentials':'true',
          'Access-Control-Allow-Methods':'POST',
          'Transfer-Encoding': 'chunked',
          'Vary':'Accept-Encoding',
          'X-Content-Type-Options':'nosniff',
        },
        method:'POST',
        body: JSON.stringify(this.state.renewTokenDetails)
    })
    .then(response=>response.json())
    .then(res=>{
      //this.verification(res);
      if(res.code===500){
          console.log("---------------------------------------");
          console.log("StatusMessage: "+res.message);
          this.renewToken();
      }
      else {this.verification(res);}
    })
  }
  verification(serverResponse){
    if(!serverResponse){
      console.log("--------No response yet--------");
    }
    else{
      console.log("This is the feedback: ",serverResponse);
      console.log("---------------------------------------");
      console.log("Status: "+serverResponse.code);
      if(serverResponse.code===400){//please try again later alert needed
        alert('ERROR-CODE 400');
      }
      // else if(serverResponse.code===500){
      //     console.log("---------------------------------------");
      //     console.log("StatusMessage: "+serverResponse.message);
      //     this.renewToken();
      // }
      else{
        console.log("------------------SUCCESS NEW TOKEN RECEIVED---------------------");
        this.setTokenCookie(serverResponse.accessToken);//this is used to save the token value in a cookie
        //localStorage.setItem('Token',serverResponse.accessToken);//saving the token to local storage in the browser
        console.log("Access Token: "+serverResponse.accessToken);
      }
    }
  }
  getCoopsData(id,startDate,endDate,startDateRange,endDateRange){//this function populates the coops list in the search bar
    console.log("getCoopsData function has been called");
    fetch('https://emata-ledgerservice-test.laboremus.no/api/ledger/ledger-entries-in-period?organisationId='+id+'&entryType=1'+'&startDate='+startDate+'&endDate='+endDate,{
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
          this.handleClickOpen();
        }
        else if(res.code===500){
          console.log("------------------ERROR-CODE 500---------------------");
          console.log("StatusMessage: "+res.message);
          this.getCoopsData(id,startDate,endDate,startDateRange,endDateRange);
        }
        else{
          console.log("--------------------------------------------------------------------------------------------------------------------------------");
          console.log(res);
          let newState= this.state;
          let sortedDateArray=[];
          let dataRange='';
          sortedDateArray = res.farmerLedgerEntries;//this stores the data of only the farmers' entries
          sortedDateArray.sort(function(a,b){return new Date(a.entryDateTime) - new Date(b.entryDateTime)});
          console.log("sorted-Object-Array: ",sortedDateArray);
          dataRange=this.getDataByDateRange(sortedDateArray,startDateRange,endDateRange);//sorting by the date range and assigning it to dateRange
          newState.Gduration = newState.Gduration+0.0001;
          newState.showLoader = false;//turning off the loader component
          newState.entries = sortedDateArray;
          newState.dateRangeEntries = dataRange;
          newState.farmerGraphData.entries = dataRange;
          localStorage.setItem('dateRangeEntries', newState.dateRangeEntries);
          this.setState(newState);
          console.log("state: ", this.state);//*/
        }
      }
    })
    .catch((error)=>{
        alert('UNKOWN ERROR - Please refresh this page');
        return(error);//reject(error);
    });
  }
  getDataByDateRange(sortedDateArray,startDate,endDate){
    let start=new Date(startDate);
    let end=new Date(endDate);
    let dataRange=[];
    for(let i=0; i<sortedDateArray.length; i++){
      if((new Date(sortedDateArray[i].entryDateTime))>=start && (new Date(sortedDateArray[i].entryDateTime))<=end){
        dataRange[dataRange.length]=sortedDateArray[i];
      }
    }
    return dataRange;
  }
  getContactsData(id){
    console.log("famers function has been called");
    try{
      fetch(
        `https://emata-crmservice-test.laboremus.no/api/contact/role?OrganisationId=${id}&types=1`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("Token"),
            "Transfer-Encoding": "chunked",
            "Content-Type": "application/json;charset=UTF-8",
            "Content-Encoding": "gzip",
            Vary: "Accept-Encoding",
            "X-Content-Type-Options": "nosniff",
            "types": 1
          },
          method: "GET"
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
            this.handleClickOpen();
          }
          else if(res.code===500){
            console.log("------------------ERROR-CODE 500---------------------");
            console.log("StatusMessage: "+res.message);
            this.getContactsData(id);
          }
          else{
            let newState = this.state;
            newState.farmerGraphData.contacts = res;
            this.setState(newState);
            console.log(this.state.coopContactList);
          }
        }
      });
    }
    catch(e){console.log(e);}
  }
  paymentMethod(id){//this function populates the payment method list in the payment graph
    console.log("---------------------paymentMethod function has been called------------------------");
    fetch(" https://emata-crmservice-test.laboremus.no/api/payment/method?organisationId="+id,
    {
      headers: {
        Authorization: "Bearer " + this.getCookie("ac-tn"),
        "Transfer-Encoding": "chunked",
        "Content-Type": "application/json;charset=UTF-8",
        "Content-Encoding": "gzip",
        Vary: "Accept-Encoding",
        "X-Content-Type-Options": "nosniff"
      },
      method: "GET"
    })
    .then(response => response.json())
    .then(res=>{
      if(!res){
        console.log("--------------No response yet--------------");
      }
      else{
        console.log("This is the feedback: ",res);
        console.log("---------------------------------------");
        console.log("Status: "+res.code);
        if(res.code===400){//please try again later alert needed
          this.handleClickOpen();
        }
        else if(res.code===500){
          console.log("------------------ERROR-CODE 500---------------------");
          console.log("StatusMessage: "+res.message);
          this.paymentMethod(id);
        }
        else{
          console.log("paymentMethod Res dashboard",res);
          let newState= this.state;
          newState.paymentMethodData = res;
          this.setState(newState);
        }
      }
    })
    .catch(error => {return error;}); //reject(error);
  }

  render(){
    let classes = this.props;
    const { fullScreen } = this.props;
    console.log("Current ");
    if(!this.getCookie("ac-tn") || !localStorage.getItem("UserId")){
      return (<Redirect exact to={'/'}/>)
    }
    else{
      return <div className='parentDiv'>
        <div className="dashboardNavDiv">
          <NavbarV2 
            passCoopSignal={(id,name)=>this.handleCoopSignal(id,name)} 
            passDateSignal={(startDate,endDate)=>this.handleDateSignal(startDate,endDate)}
          />
          {this.showLoader()}
        </div>
        {/*
        <div className="titleCard">
          <p className="title">{this.state.coopName}</p>
        </div>*/}
        <div className="dashboardGraphContainer">
          <div className={classes.root}>
            <Grid container spacing={8}>
              <Grid item  sm={12}>
                <Paper className="titleCard">
                  <p className="title">{this.state.coopName}</p>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper className="monthlyOVCard">
                  <p className="cardNames">Annual Milk Collections</p>
                  <MonthlyOverview passCoopData={this.state.entries}/>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper className="deliveryDetailsCard">
                  <p className="cardNames">Deliveries</p>
                  <DeliveryAmounts passCoopData={this.state.dateRangeEntries}/>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper className="farmersCard">
                  <p className="cardNames">Farmers Demographics</p>
                  <Farmers passCoopData={this.state.farmerGraphData}/>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={3} lg={2}>
                <Paper className="utilizationCard">
                  <p className="utilizationcardName">Utilization Rate</p>
                  <UtilizationRate passCoopData={this.state.farmerGraphData}/>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper className="paymentCard">
                  <p className="cardNames">Payments</p>
                  <Payment passCoopData={this.state.paymentMethodData}/>
                </Paper>
              </Grid>
            </Grid>
          </div>
        </div>
        <Dialog
          fullScreen={fullScreen}
          open={this.state.open}
          onClose={this.handleClose}
          style={{backgroundColor: 'transparent', color:'red'}}
          overlayStyle={{backgroundColor: 'red', color:'red'}}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogContent>
            <DialogContentText>
              ERROR: Please try again later.
            </DialogContentText>
          </DialogContent>
        </Dialog>
      </div>
    }
  }
}

FullWidthGrid.propTypes = {
  classes: PropTypes.object.isRequired
};

export default FullWidthGrid;
