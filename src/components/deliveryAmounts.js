import React, { Component } from 'react';
import 'react-dom';
import './stylings/deliveryAmount.css';
import NoOfDeliveries from './deliveryAmounts-noOfDeliveries'
import AveDeliverySize from './deliveryAmounts-aveDeliverySize'
import AmtMilkDeliveries from './deliveryAmounts-amtMilkDeliveries'
import Highcharts from 'highcharts';
import {HighchartsChart, Chart, withHighcharts, XAxis, YAxis, Title, Legend, SplineSeries} from 'react-jsx-highcharts';

class DeliveryCard extends Component {
  constructor(props){
    super(props)
    this.state = {
      tabs:{
        tab1: true,
        tab2: false,
        tab3: false,
        actTab1: 'rgba(0, 0, 0, 0.15)',//'#9ED4E6',//activeDeliveryButtons
        actTab2: 'rgba(255, 255, 255,0.4)',//inactiveDeliveryButtons
        actTab3: 'rgba(255, 255, 255,0.4)'//inactiveDeliveryButtons
      },
      bgColor: '',
      dateRangeEntries: ''
    }
    this.showGraph=this.showGraph.bind(this);
    this.updateTheState=this.updateTheState.bind(this);
    this.checkStateChange=this.checkStateChange.bind(this);
  }

  updateTheState(number){//this function is called to update the state name of loginDetails object
      var abc = this.state.tabs;
      abc.tab1 = false; abc.tab2 = false; abc.tab3 = false;
      abc.actTab1 = 'rgba(255, 255, 255,0.4)'; abc.actTab2 = 'rgba(255, 255, 255,0.4)'; abc.actTab3 = 'rgba(255, 255, 255,0.4)';
      if(number===1){abc.tab1=true; abc.actTab1='rgba(0, 0, 0, 0.15)'}
      else if(number===2){abc.tab2=true; abc.actTab2='rgba(0, 0, 0, 0.15)'}
      else if(number===3){abc.tab3=true; abc.actTab3='rgba(0, 0, 0, 0.15)'}
      this.setState({tabs: abc});
      console.log(this.state.tabs);
  }
  checkStateChange(){//this function is called to update the state name of loginDetails object
    console.log("checkIdChange function has been called");
    console.log("DVApassed startdate:", this.props.passCoopData);
    if(this.state.dateRangeEntries===this.props.passCoopData){
      return this.showGraph();
    }
    else{
      console.log("--------------DVA condition different-Data-----------");
      let newState = this.state;
      newState.dateRangeEntries = this.props.passCoopData;
      this.setState(newState);
    }
  }
  showGraph(){
    console.log("showGraph Started");
    if(this.state.tabs.tab1){
      console.log("Tab1 is selected");
      return <NoOfDeliveries passCoopData={this.state.dateRangeEntries}/>
    }
    else if(this.state.tabs.tab2){
      console.log("Tab2 is selected");
      return <AveDeliverySize passCoopData={this.state.dateRangeEntries}/>
    }
    else{console.log("Tab3 is selected");
      return <AmtMilkDeliveries passCoopData={this.state.dateRangeEntries}/>
    }
  }
  render(){
    let className1=this.state.actTab1;
    return(
      <div>
        <div className="buttonsRow">
          <div className="btn-group-sm" role="group" aria-label="Basic example">
            <button type="button" 
              className="activeDeliveryButtons"
              onClick={(e)=>{e.preventDefault();this.updateTheState(1)}} 
              style={{background:this.state.tabs.actTab1}}
            >
              No. of deliveries
            </button>
            <button type="button" 
              className="inactiveDeliveryButtons"
              onClick={(e)=>{e.preventDefault();this.updateTheState(2)}}
              style={{background:this.state.tabs.actTab2}}
            >
              Ave. delivery size
            </button>
            <button type="button" 
              className="inactiveDeliveryButtons"
              onClick={(e)=>{e.preventDefault();this.updateTheState(3)}}
              style={{background:this.state.tabs.actTab3}}
            >
              Amt. milk deliveries
            </button>
          </div>
        </div>
        {this.checkStateChange()}
      </div>
    );
  } 
}
export default withHighcharts(DeliveryCard, Highcharts);
//(e)=>{e.preventDefault(); is used to prevent the onClick function from running by default/when the page loads/reloads

