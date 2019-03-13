import React, { Component } from 'react';
import 'react-dom';
import './stylings/utilization.css';
import Highcharts from 'highcharts';
import {HighchartsChart, Chart, withHighcharts, Title, Legend, PieSeries} from 'react-jsx-highcharts';

class UtilizationCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      noOfEntries: 1,//this makes the default appearance of the chart to fill-up on one side
      noOfEntriesLabel: 0,
      percentage: 0,
      contacts: [],
      activeFarmers: '',
      activeFarmersList: [],
      inactiveFarmers: '',
      object:[],
      obj:[],
      Gduration: 1500
    };
  }
  //calcaulating the number of days within the range
  mydiff = (date1,date2,interval) =>{
    var second=1000, minute=second*60, hour=minute*60, day=hour*24, week=day*7;
    date1 = new Date(date1);
    date2 = new Date(date2);
    var timediff = date2 - date1;
    if (isNaN(timediff)) return NaN;
    switch (interval) {
      case "years": return date2.getFullYear() - date1.getFullYear();
      case "months": return (
        ( date2.getFullYear() * 12 + date2.getMonth() )
        -
        ( date1.getFullYear() * 12 + date1.getMonth() )
      );
      case "weeks"  : return Math.ceil(timediff / week);
      case "days"   : return Math.floor(timediff / day); 
      case "hours"  : return Math.floor(timediff / hour); 
      case "minutes": return Math.floor(timediff / minute);
      case "seconds": return Math.floor(timediff / second);
      default: return undefined;
    }
  }

  static getDerivedStateFromProps(newProp=this.props.passCoopData, state=this.state){
    console.log("------------Farmers Card received props-------------");
    let newState = state;
    newState.contacts = newProp.passCoopData.contacts;
    newState.object = newProp;
    return newState;
  }

  setgraphData = (object,activeFarmersList) =>{
    console.log("UT-OBJECT RECEIVED: ",object);
    console.log("UT-activeFarmersList RECEIVED: ",activeFarmersList);
    let entries = object.passCoopData.entries;
    let graphData = [];
    let counter=0;
    let percentage=0;
    console.log("UTentries-Farmer entries: ",entries);
    console.log("UTentries.length: ",entries.length);
    if(entries.length){//check if the entries.length is not null
      if(activeFarmersList.length>0){
        for(let i=0; i<entries.length; i++){//sorting the entries by date so as to get total deliveries in one day
          let farmerId = entries[i].farmerId;//getting a new date from the array;
          console.log("UTfarmerId: ",farmerId)
          //console.log("UTactiveFarmersList-Check: ",activeFarmersList[0])
          function checkFarmerId() {
            let present= false;
            for(let z=0; z<activeFarmersList.length; z++){
              if(farmerId===activeFarmersList[z]){
                present=true;
                break;
              }
            }
            return present;
          }
          console.log("UTFunction-Result: ",checkFarmerId());
          if(checkFarmerId()){//Adding Entries of the same date
            counter=counter+1;  
          }
        }
        console.log("UTGraphData-Counter: ",counter);
        percentage = (counter/entries.length)*100;
        percentage = parseFloat(percentage.toFixed(1))
        console.log("UTGraphData-Percentage: ",percentage);
        let newState = this.state;
        if(percentage && entries.length){//check if percentage && entries.length are not null values
          newState.percentage = percentage;
          newState.noOfEntriesLabel = entries.length;
          if(entries.length===0){newState.noOfEntries = 1;}//this makes the default appearance of the chart to fill-up on one side
          else{newState.noOfEntries = entries.length;}
        }
        newState.Gduration = newState.Gduration+0.0001;
        return newState;
      }
      else{
        percentage = 0;
        let newState = this.state;
        newState.percentage = percentage;
        newState.noOfEntriesLabel = 0;//this sets the entry labels to zero
        newState.noOfEntries = 1//this makes the appearance of the chart to fill-up on one side
        newState.Gduration = newState.Gduration+0.0001;
        return newState;
      }
    }
    else{
      percentage = 0;
      let newState = this.state;
      newState.percentage = percentage;
      newState.noOfEntriesLabel = 0;//this sets the entry labels to zero
      newState.noOfEntries = 1//this makes the appearance of the chart to fill-up on one side
      newState.Gduration = newState.Gduration+0.0001;
      return newState;
    }
  };

  handleFarmersData = (object)=>{
    //this.getContactsData();
    let startDate = "";
    let endDate = "";
    let weeks = "";
    let graphData = [];
    let temperyDate = new Date();
    let activeFarmers = '';
    let activeFarmersList = [];
    let inactiveFarmers = this.state.contacts.length;

    //changing the start and end date into days, weeks//
    if(object.passCoopData.startDate){
      let formateDate; 
      let dateRange;
      startDate = object.passCoopData.startDate;
      endDate = object.passCoopData.endDate;
      dateRange = this.mydiff(startDate,endDate,"days");
      weeks = this.mydiff(startDate,endDate,"weeks");
      console.log(weeks," weeks");
    }

    //passing the coopdates and coopdata from the API to populate the farmers Id//
    if(object.passCoopData){
      let i=0;
      let j=0;
      let p=0;
      let days = [];
      let found = 0;
      let obj = object.passCoopData.entries;
      let dt= "";
      let flag = 0;
      let contacts = [];
      activeFarmers = 0;

      for(i=0;i<obj.length;i++){//checking if the contact is equal to farmerId
        let id = obj[i].farmerId;
        // contacts.push(id);
        for(let j=0;j<=obj.length;j++){
          if(contacts[j] === id){
            flag = 1;
            break;        
          }  
        }
        if(flag === 0){//if the flag is 0 push the id into the contact array
          contacts.push(id);
        }
        else{
          flag = 0;
        }
      }

      if(contacts.length !== 0){//check if the contact array is not equal to zero
        function addDays(date, days) {
          var result = new Date(date);
          result.setDate(result.getDate() + days);
          return result;
        }
        for(i=0;i<contacts.length;i++){//loop though the array to get contacts Id
          let contact = contacts[i];
          let contactActive = false;
          let contactActiveCounter = 0;
          let weekDelivery = 0;
          let activeness = 0;
          inactiveFarmers = this.state.contacts;

          let tempStartDate = new Date(startDate);
          let tempEndDate = addDays(tempStartDate,7);

          for(j=0;j<=obj.length;j++,tempStartDate = addDays(tempEndDate,1)){//loop though the inner loop get set the temporary date and add 7 days 
            tempEndDate = addDays(tempStartDate,7);
            let lastWeekFlag = 1;
            for(p=0;p<obj.length;p++){// loop the array to get the length of entry date time
              let entryDateTime = new Date(obj[p].entryDateTime);
              if(contact && contact === obj[p].farmerId && entryDateTime >= tempStartDate && entryDateTime <= tempEndDate){//checking if the contact is equal to farmerId and entry date time is greater or equal to temporary start and end date
                if(lastWeekFlag === 1 || weekDelivery === 1){//checking for last week and this week delivery if is equal to 1, 0
                  contactActiveCounter++;
                  lastWeekFlag = 1;
                  break;
                }
                else{
                  lastWeekFlag = 0;
                }
                weekDelivery = 1
              }
              else{
                weekDelivery = 0;
              }
            }

          }

          activeness = (contactActiveCounter/weeks)*100 //calculating the activeness of a farmer
          activeness = Math.round(activeness); //rounding the whole number 
          if (activeness <60) activeFarmers = activeFarmers
          else{activeFarmers = activeFarmers + 1; activeFarmersList.push(contact)};//checking if the farmer deliver is over 60%
          inactiveFarmers = (this.state.contacts.length) - (activeFarmers);//calculating the inactive farmer 
          console.log("activeFarmersList: ", activeFarmersList)
          console.log("Farmer id = ",contact,"consistence detection = ",contactActiveCounter,"Consistence = ",activeness,"%");
          console.log(activeFarmers,"Active farmers");  
          console.log(inactiveFarmers,"Inactive farmer") 
        }     
      }
      //console.log(contacts); 
    }
    let newState = this.state;
    newState.activeFarmersList = activeFarmersList;
    newState.activeFarmers = activeFarmers;
    newState.inactiveFarmers = inactiveFarmers;
    this.setgraphData(object,activeFarmersList);

    return newState;
  };
  render(){
    let farmerData=this.handleFarmersData(this.state.object);
    const pieData = [
      {name: 'utilized',y: this.state.percentage,  color: "#1AB394"},
      {name: 'Not-utilized',y: (100-this.state.percentage),  color: "#e05757"}
    ];
    const plotOptions = {
      series: {animation:{duration: this.state.Gduration}}
    };
    var tooltip = {valueSuffix: '%'}
    return(
      <div>
        <HighchartsChart  
          className="utilizationGraph"
          plotOptions={plotOptions} 
          tooltip={tooltip} 
          height={325}
        >
          <Chart />
          <Title></Title>
          <Legend/>
          <PieSeries name="utilization" data={pieData} size={120} showInLegend={false} />
          
        </HighchartsChart>
        <div>
          <div className="textUtilizationCards">
            <label className="contentUtilizationNumber1">{this.state.noOfEntriesLabel}</label>
            <label className="contentUtilization">, records</label>
          </div>
          <div className="textUtilizationCards">
            <label className="contentUtilizationNumber2">{this.state.percentage}</label>
            <label className="contentUtilization">% utilization</label>
          </div>
        </div>
        </div>
    );
  } 
}
export default withHighcharts(UtilizationCard, Highcharts);

