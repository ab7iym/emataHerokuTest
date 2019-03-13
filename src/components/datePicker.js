import React from 'react';

// Import Datepicker
import { DatePicker, DatePickerInput } from 'rc-datepicker';

// Import the default style
import 'rc-datepicker/lib/style.css';
 
export default class App extends React.Component {
    constructor(props, context) {
        super(props, context);

        // Initial state with date
        this.state = {
            // or Date or Moment.js
            selectedDate: '2019-01-13'
        };

        // This binding is necessary to make `this` work in the callback
        this.onChange = this.onChange.bind(this);
    }

    onChange(date) {
    this.setState({
      selectedDate: date
    });
  }

    render() {
        return (
            <div>
                <DatePickerInput
                    onChange={this.onChange}
                    value={this.state.selectedDate}
                    className='my-custom-datepicker-component'
                />

                {/* this renders only a fixed datepicker */}
                <DatePicker onChange={this.onChange} value={this.state.selectedDate} />
            </div>
        );
    }
}