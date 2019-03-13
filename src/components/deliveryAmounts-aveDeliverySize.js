import React, { Component } from 'react';
import 'react-dom';
import './stylings/deliveryAmounts-aveDeliverySize.css';
import Highcharts from 'highcharts';
import {HighchartsChart, Chart, withHighcharts, XAxis, YAxis, Title, Legend, SplineSeries} from 'react-jsx-highcharts';

class AveDeliverySizeDeliveryCard extends Component {
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
  }

  componentDidMount(){
    //{this.calcDate(localStorage.getItem('startDt-sl'), localStorage.getItem('endDt-sl'))}
    let newState = this.state;
    newState.dateRangeEntries = this.props.passCoopData;
    this.setState(newState);
    this.getCoopsData(this.props.passCoopData);
  }

  // getCoopsData(localStorage.getItem('cp-sl-id'),sendDate,endDate)
  getCoopsData(res){//this function populates the coops list in the search bar
    console.log("getCoopsData function has been called");
    console.log("--------------------------------------------------------------------------------------------------------------------------------");
    console.log(res);
    //console.log("the deliveries: "+res.noOfEntries);
    
    let newState= this.state;
    let sortedDateArray = res//this stores the dates from the API-endpoint to the state dates array(in date fomart)
    console.log("sorted-Object-Array: ",sortedDateArray);
    for(let i=0; i<sortedDateArray.length; i++){//sorting the entries by date so as to get total deliveries in one day
      let entryDate = new Date(sortedDateArray[i].entryDateTime);//getting a new date from the array;
      let amountOfMilk = sortedDateArray[i].milkDelivered.quantity;
      let prevEntryDate = '';
      console.log("--------------------------------------------------------------------------------------------------------------------------------");
      console.log('sortarray length: '+sortedDateArray.length);
      console.log('forloop interation: '+i);
      if(newState.entries.length>0){prevEntryDate=newState.entries[newState.entries.length-1].entryDateTime;
        console.log('prev-new: '+prevEntryDate.getMonth()+'-'+entryDate.getMonth()+' '+prevEntryDate.getMonth()+'-'+entryDate.getMonth()+' '+prevEntryDate.getFullYear()+' '+entryDate.getFullYear());
      }//check if the previous date entry already exists
      
      if(newState.entries.length===0){
        console.log('array start');
        newState.entries[newState.entries.length] = {'entryDateTime': entryDate , 'noOfEntries': 1, 'amountOfMilk': amountOfMilk};
        console.log("Entries: ",newState.entries);
      }
      //Adding Entries of the same date
      else if((prevEntryDate.getDate()===entryDate.getDate()) && (prevEntryDate.getMonth()===entryDate.getMonth()) && (prevEntryDate.getFullYear()===entryDate.getFullYear())){
        console.log('array adding');
        newState.entries[(newState.entries.length)-1] = {'entryDateTime': entryDate , 'noOfEntries': (newState.entries[newState.entries.length-1].noOfEntries)+1, 'amountOfMilk': (newState.entries[newState.entries.length-1].amountOfMilk)+amountOfMilk};
        console.log("Adding Entries: ",newState.entries);
      }
      else{//add a new entry to array
        console.log('array new');
        newState.entries[newState.entries.length] = {'entryDateTime': entryDate , 'noOfEntries': 1, 'amountOfMilk': amountOfMilk};
        console.log("New Entries: ",newState.entries);
      }
    }
    if(sortedDateArray.length){//this condition is used to data for the days when the delivery is 0(zero)
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
        allDatesInRange.push({'entryDateTime': date , 'noOfEntries': 0, 'amountOfMilk': 0});
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
      let ave ='';
      if(newState.entries[i].noOfEntries===0){ave=0}
      else{ave=newState.entries[i].amountOfMilk/newState.entries[i].noOfEntries}
      newState.entries[i] = [Date.UTC(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate()) , ave]
      //{'entryDateTime': entryDate , 'noOfEntries': 1};
    }
    console.log('newState.entries: ',newState.entries);
    newState.Gduration = newState.Gduration+0.0001;
    this.setState(newState);
    console.log("state: ", this.state);
  };

  render(){
    const labels= {style: {fontSize:'40px'}}
    const plotOptions = { series: {animation:{duration: this.state.Gduration}}};
    var tooltip = {valueSuffix: ''}
    return(
      <HighchartsChart  
        className="aveDeliverySizeDeliveryGraph"
        plotOptions={plotOptions} 
        tooltip={tooltip} 
        height={325}
      >
        <Chart />
        <Title></Title>
        <XAxis type = 'datetime' dateTimeLabelFormats={this.state.dateTimeLabelFormats}>
          <XAxis.Title>Date</XAxis.Title>
          <SplineSeries name="ave. amount Of Milk" data= {this.state.entries} />
        </XAxis>
        <YAxis>
          <YAxis.Title>ave. Milk Quantity (ltr)</YAxis.Title>
        </YAxis>
      </HighchartsChart>
    );
  } 
}

export default withHighcharts(AveDeliverySizeDeliveryCard, Highcharts);