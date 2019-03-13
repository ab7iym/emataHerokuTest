import React, { Component } from 'react';
import 'react-dom';
import './stylings/deliveryAmounts-noOfDeliveries.css';
import Highcharts from 'highcharts';
import {HighchartsChart, Chart, withHighcharts, XAxis, YAxis, Title, Legend, SplineSeries} from 'react-jsx-highcharts';

class NoOfDeliveriesDeliveryCard extends Component {
  constructor(props){
    super(props)
    this.state = {
      dateRangeEntries: [],
      entries: [],
      Gduration: 1500,
      dateTimeLabelFormats: {
        second: '%Y-%m-%d<br/>%H:%M:%S',
        minute: '%Y-%m-%d<br/>%H:%M',
        hour: '%Y-%m-%d<br/>%H:%M',
        day: '%Y<br/>%m-%d',
      }
    }
    this.getCoopsData=this.getCoopsData.bind(this);
    //this.calcDate=this.calcDate.bind(this);
  }

  componentDidMount(){
    //{this.calcDate(localStorage.getItem('startDt-sl'), localStorage.getItem('endDt-sl'))}
    let newState = this.state;
    newState.dateRangeEntries = this.props.passCoopData;
    this.setState(newState);
    this.getCoopsData(this.props.passCoopData);
    //this.calcDate(this.props.passStartDate, this.props.passEndDate)
  }

  // calcDate(startDate,endDate){
  //   console.log("---------------------------------------------------------Calculate Date Start----------------------------------------------------------------------"); 
  //   var start = new Date(startDate);
  //   var end = new Date(endDate);
  //   let noOfDays = (parseInt((end - start) / (24 * 3600 * 1000)))+1;//this gets the number of days between the dates
  //   console.log("startDate: "+startDate+"    endDate: "+endDate);
  //   console.log("Date Difference: "+parseInt(end - start));
  //   console.log("No. of Days: "+noOfDays);
  //   console.log("----------------------------------------------------------Calculate Date End---------------------------------------------------------------------"); 

  // }

  // getCoopsData(localStorage.getItem('cp-sl-id'))
  getCoopsData(res){//this function populates the coops list in the search bar
    console.log("getCoopsData function has been called");
    console.log("--------------------------------------------------------------------------------------------------------------------------------");
    console.log(res);
    
    let newState= this.state;
    let sortedDateArray = res;//this stores the dates from the API-endpoint to the state dates array(in date fomart)
    console.log("sorted-Object-Array: ",sortedDateArray);
    
    for(let i=0; i<sortedDateArray.length; i++){//sorting the entries by date so as to get total deliveries in one day
      let entryDate = new Date(sortedDateArray[i].entryDateTime);//getting a new date from the array;
      let prevEntryDate = '';
      
      if(newState.entries.length>0){//check if the previous date entry already exists
        prevEntryDate=newState.entries[newState.entries.length-1].entryDateTime;
        //console.log('prev-new: '+prevEntryDate.getMonth()+'-'+entryDate.getMonth()+' '+prevEntryDate.getMonth()+'-'+entryDate.getMonth()+' '+prevEntryDate.getFullYear()+' '+entryDate.getFullYear());
      }
      
      if(newState.entries.length===0){//check if the array has no value and add a value in the first position
        //console.log('array start');
        newState.entries[newState.entries.length] = {'entryDateTime': entryDate , 'noOfEntries': 1};
        //console.log("Entries: ",newState.entries);
      }
      //Adding Entries of the same date
      else if((prevEntryDate.getDate()===entryDate.getDate()) && (prevEntryDate.getMonth()===entryDate.getMonth()) && (prevEntryDate.getFullYear()===entryDate.getFullYear())){
        //console.log('array adding');
        newState.entries[(newState.entries.length)-1] = {'entryDateTime': entryDate , 'noOfEntries': (newState.entries[newState.entries.length-1].noOfEntries)+1};
        //console.log("Adding Entries: ",newState.entries);
      }
      else{//add a new entry to array
        //console.log('array new');
        newState.entries[newState.entries.length] = {'entryDateTime': entryDate , 'noOfEntries': 1};
        //console.log("New Entries: ",newState.entries);
      }
    }

    if(sortedDateArray.length){//this condition is used to get data for the days when the delivery is 0(zero)
      let firstDateOfEntry = new Date(newState.entries[0].entryDateTime);//this holds the date of the first entry made in the period selected
      let lastDateOfEntry = new Date(newState.entries[newState.entries.length-1].entryDateTime);//this holds the date of the last entry made in the period selected
      let noOfDays = (parseInt((lastDateOfEntry - firstDateOfEntry) / (24 * 3600 * 1000)))+2;//this gets the number of days between the dates
      let allDatesInRange = [];
      //console.log("firstDateOfEntry: ",firstDateOfEntry);console.log("lastDateOfEntry: ",lastDateOfEntry);
      //console.log("noOfDays: ",noOfDays);
      for(let i=0; i<noOfDays; i++){
        let date = ''
        if(i===0){date = new Date(firstDateOfEntry.setDate(firstDateOfEntry.getDate()));}
        else {date = new Date(firstDateOfEntry.setDate(firstDateOfEntry.getDate()+1));} 
        allDatesInRange.push({'entryDateTime': date , 'noOfEntries': 0});
        //console.log("allDatesInRange-curr: ",allDatesInRange[i]);
      }
      //console.log("allDatesInRange-in-loop: ",allDatesInRange);
      //*
      for(let i=0; i<allDatesInRange.length; i++){
        for(let r=0; r<newState.entries.length; r++){
          if(allDatesInRange[i].entryDateTime.getDate()===newState.entries[r].entryDateTime.getDate() && allDatesInRange[i].entryDateTime.getMonth()===newState.entries[r].entryDateTime.getMonth() && allDatesInRange[i].entryDateTime.getFullYear()===newState.entries[r].entryDateTime.getFullYear() ){
            allDatesInRange[i] = newState.entries[r];
          }
        }
      }//*/
      console.log("allDatesInRange: ",allDatesInRange);
      newState.entries=allDatesInRange;
    }
    for(let i=0; i<newState.entries.length; i++){//loop to convert the entries array date to date.UTC
      let entryDate = new Date(newState.entries[i].entryDateTime);//getting a new date from the array;
      newState.entries[i] = [Date.UTC(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate()) , newState.entries[i].noOfEntries]
      //{'entryDateTime': entryDate , 'noOfEntries': 1};
    }
    console.log('newState.entries: ',newState.entries);
    newState.Gduration = newState.Gduration+0.0001;
    this.setState(newState);
    console.log("state: ", this.state);
  };

  render(){
     //{this.getCoopsData(localStorage.getItem('cp-sl'),"2019-02-11","2019-02-11")}
    const labels= {style: {fontSize:'40px'}}
    const plotOptions = { series: {animation:{duration: this.state.Gduration}}};
    var tooltip = {valueSuffix: ''}

    return(
        <HighchartsChart  
          className="noOfDeliveriesdeliveryGraph"
          plotOptions={plotOptions} 
          tooltip={tooltip} 
          height={325}
        >
          <Chart />
          <Title></Title>
          <XAxis type = 'datetime' dateTimeLabelFormats={this.state.dateTimeLabelFormats}>
            <XAxis.Title>Date</XAxis.Title>
            <SplineSeries name="deliveries" data= {this.state.entries} />
          </XAxis>
          <YAxis>
            <YAxis.Title>No. of Deliveries</YAxis.Title>
          </YAxis>
        </HighchartsChart>
    );
  } 
}

export default withHighcharts(NoOfDeliveriesDeliveryCard, Highcharts);