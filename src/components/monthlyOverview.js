import React, { Component } from 'react';
import 'react-dom';
import './stylings/monthlyOverview.css';
import Highcharts from 'highcharts';
import {HighchartsChart, Chart, withHighcharts, XAxis, YAxis, Title, Legend, ColumnSeries, SplineSeries} from 'react-jsx-highcharts';

class MonthlyOverview extends Component {
	constructor(props){
	    super(props)
	    this.state = {
	      entries: '',
	      prevYearLabel: '',
	      currYearLabel: '',
	      prevYearEntries: [],
	      currYearEntries: [],
	      aveOfEntries: [],
	      Gduration: 1500,
	    }
	    this.getCoopsData=this.getCoopsData.bind(this);
	}
	componentDidMount(){
		console.log("------------Milk Collection Mounted-------------");
		let newState = this.state;
		newState.entries = this.props.passCoopData;
		this.setState(newState);
		//this.getCoopsData(this.props.passCoopData);
	}
	static getDerivedStateFromProps(newProp=this.props.passCoopData, state=this.state){
		console.log("------------Milk Collection received props-------------");
		let newState = state;
		newState.entries = newProp.passCoopData;
		return newState;
	}
	componentDidUpdate(){
		console.log('New State: ',this.state);
		//this.getCoopsData(this.props.passCoopData);
	}
	// getCoopsData(localStorage.getItem('cp-sl-id'),sendDate,endDate)
	getCoopsData(res){//this function populates the coops list in the search bar
		console.log("---------------------------------------------------------getCoopsData Start----------------------------------------------------------------------");
		console.log('Res: ',res);
		//get the whole time range of the data needed from the 1st of the previous year to the current date
	    var endDate = new Date();
	    var startDate = new Date();
	    startDate.setDate(1);
	    startDate.setMonth(0);
	    startDate.setFullYear(endDate.getFullYear()-1);
		  
		let newState= this.state;
		console.log("New-state",newState);
		newState.prevYearEntries = [];//reset the array to empty
		newState.currYearEntries = [];//reset the array to empty
		let sortedDateArray = res;//this stores the dates from the API-endpoint to the state dates array(in date fomart)
		console.log("sorted-Object-Array: ",sortedDateArray);
		for(let i=0; i<sortedDateArray.length; i++){//sorting the entries of the previous year by month so as to get total Milk collections/deliveries in one day (in ltr)
		  let entryDate = new Date(sortedDateArray[i].entryDateTime);//getting a new date from the array;
	      let amountOfMilk = sortedDateArray[i].milkDelivered.quantity;
		  let prevEntryDate = '';
			if(entryDate.getFullYear()===startDate.getFullYear()){
		    	//console.log("----------------------------------------------");
		    	//console.log('Prev sortarray length: '+sortedDateArray.length + " Iteration: "+i);
			    if(newState.prevYearEntries.length>0){prevEntryDate=newState.prevYearEntries[newState.prevYearEntries.length-1].entryDateTime;}//check if the previous date entry already exists
			    
			    if(newState.prevYearEntries.length===0){
			      newState.prevYearEntries[newState.prevYearEntries.length] = {'entryDateTime': entryDate , 'amountOfMilk': amountOfMilk};
			      //console.log("Prev Entries: ",newState.prevYearEntries);
			    }
			    //Adding Entries of the same date
			    else if(prevEntryDate.getMonth()===entryDate.getMonth()){
			      newState.prevYearEntries[(newState.prevYearEntries.length)-1] = {'entryDateTime': entryDate , 'amountOfMilk': (newState.prevYearEntries[newState.prevYearEntries.length-1].amountOfMilk)+amountOfMilk};
			      //console.log("Prev Adding Entries: ",newState.prevYearEntries);
			    }
			    else{//add a new entry to array
			      //console.log('array new');
			      newState.prevYearEntries[newState.prevYearEntries.length] = {'entryDateTime': entryDate , 'amountOfMilk': amountOfMilk};
			      //console.log("Prev New Entries: ",newState.prevYearEntries);
			    }
			}
		}

		for(let i=0; i<sortedDateArray.length; i++){//sorting the entries of the current year by month so as to get total Milk collections/deliveries in one day (in ltr)
		    let entryDate = new Date(sortedDateArray[i].entryDateTime);//getting a new date from the array;
	    	let amountOfMilk = sortedDateArray[i].milkDelivered.quantity;
		    let prevEntryDate = '';
		    console.log('Curr year: '+endDate.getFullYear(), 'curr year entryDate year: '+entryDate.getFullYear());
		    if(entryDate.getFullYear()===endDate.getFullYear()){
		    	//console.log("--------------------------------------------------------------------------------------------------------------------------------");
		    	//console.log('Curr sortarray length: '+sortedDateArray.length);
			    if(newState.currYearEntries.length>0){
			    	prevEntryDate=newState.currYearEntries[newState.currYearEntries.length-1].entryDateTime;
			    }//check if the previous date entry already exists
			    
			    if(newState.currYearEntries.length===0){
			      newState.currYearEntries[newState.currYearEntries.length] = {'entryDateTime': entryDate , 'amountOfMilk': amountOfMilk};
			      //console.log("Curr Entries: ",newState.currYearEntries);
			    }
			    //Adding Entries of the same date
			    else if(prevEntryDate.getMonth()===entryDate.getMonth()){
			      newState.currYearEntries[(newState.currYearEntries.length)-1] = {'entryDateTime': entryDate , 'amountOfMilk': (newState.currYearEntries[newState.currYearEntries.length-1].amountOfMilk)+amountOfMilk};
			      //console.log("Curr Adding Entries: ",newState.currYearEntries);
			    }
			    else{//add a new entry to array
			     // console.log('array new');
			      newState.currYearEntries[newState.currYearEntries.length] = {'entryDateTime': entryDate , 'amountOfMilk': amountOfMilk};
			      //console.log("Curr New Entries: ",newState.currYearEntries);
			    }
			}
	  	}
		let holdingArray = [];
		for(let i=0; i<newState.prevYearEntries.length; i++){//loop to populate the entries array data to only milk amounts
			let entryDate = new Date(newState.prevYearEntries[i].entryDateTime);//getting a new date from the array;
			for(let r=0; r<12; r++){
				if(entryDate.getMonth()===r){//if value at entryDate.getMonth() matches the position r(0-11 the months of the year), fill it with amountOfMilk
					//console.log("Plotting Month Match: "+entryDate.getMonth()+ " r-value: "+r);
					holdingArray[r] = newState.prevYearEntries[i].amountOfMilk;
				}
				else{
					//console.log("Plotting Month No-Match: "+entryDate.getMonth()+ " r-value: "+r);
					if(!holdingArray[r]){holdingArray[r] = 0;}//if value at holdingArray[r] is NULL, replace it with 0(zero)
				}
			}
		    //newState.prevYearEntries[i] = newState.prevYearEntries[i].amountOfMilk;
		}
		newState.prevYearEntries = holdingArray;//set the newState.prevYearEntries.
		holdingArray=[];//this resets the array so that it can be used for the next for-loop.

		for(let i=0; i<newState.currYearEntries.length; i++){//loop to populate the entries array data to only milk amounts
			let entryDate = new Date(newState.currYearEntries[i].entryDateTime);//getting a new date from the array;
			for(let r=0; r<12; r++){
				if(entryDate.getMonth()===r){//if value at entryDate.getMonth() matches the position r(0-11 the months of the year), fill it with amountOfMilk
					//console.log("Plotting Month Match: "+entryDate.getMonth()+ " r-value: "+r);
					holdingArray[r] = newState.currYearEntries[i].amountOfMilk;
				}
				else{
					//console.log("Plotting Month No-Match: "+entryDate.getMonth()+ " r-value: "+r);
					if(!holdingArray[r]){holdingArray[r] = 0;}//if value at holdingArray[r] is NULL, replace it with 0(zero)
				}
			}
		    //newState.currYearEntries[i] = newState.currYearEntries[i].amountOfMilk;
		}
		newState.currYearEntries = holdingArray;//set the newState.prevYearEntries.
		holdingArray=[];//this resets the array

		for(let i=0; i<12; i++){//this for-loop computes the average of the entries from currYearEntries and prevYearEntries
			newState.aveOfEntries[i]=(newState.currYearEntries[i]+newState.prevYearEntries[i])/2;
		}
		console.log('newState.prevYearEntries: ',newState.prevYearEntries);
		console.log('newState.currYearEntries: ',newState.currYearEntries);
		console.log('newState.aveOfEntries: ',newState.aveOfEntries);
		newState.prevYearLabel = startDate.getFullYear();//set the legends of the graph
		newState.currYearLabel = endDate.getFullYear();//set the legends of the graph
		newState.Gduration = newState.Gduration+0.0001;
		console.log("---------------------------------------------------------getCoopsData End----------------------------------------------------------------------");
		return newState;
		//this.setState(newState);
		//console.log("state: ", this.state);
	};
 	render(){
 		console.log("------------Milk Collection Rendering-------------");
 		const categories= ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  		const labels= {style: {fontSize:'40px'}}
	 	const plotOptions = {series: {animation:{duration: this.state.Gduration}}};
  		var tooltip = {valueSuffix: 'ltrs'}
  		let res=this.getCoopsData(this.state.entries)
  		console.log("resState: ",res);
  		console.log("Actual-State: ",this.state);
	    return(
	        <HighchartsChart  
	          className="graph"
			  plotOptions={plotOptions} 
		      tooltip={tooltip} 
		    >
	          <Chart />
	          <Legend />
	          <XAxis categories={categories} lable = {labels}>
	          	<XAxis.Title >Months</XAxis.Title>
	          </XAxis>
	          <YAxis>
	          	<YAxis.Title >Quantity (ltrs)</YAxis.Title>
	            <ColumnSeries name={this.state.currYearLabel} data={this.state.currYearEntries} />
	            <ColumnSeries name={this.state.prevYearLabel} data={this.state.prevYearEntries} />
	            <SplineSeries name="Average" data={this.state.aveOfEntries} />
	          </YAxis>
	        </HighchartsChart>
	    );
    } 
}

export default withHighcharts(MonthlyOverview, Highcharts);

	//<ColumnSeries name="2018" data={[9,2,1,3,4,7,9,6,1,11,17,15]} />
	//<ColumnSeries name="2017" data={[7,3,5,7,6,9,5,3,4,8,10,9]} />
	//<SplineSeries name="Average" data={[8,2.5,3,5,5,8,7,4.5,2.5,9.5,13.5,12]} />