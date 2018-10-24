import React, { Component } from 'react'
import axios from 'axios'

export default class viewInfo extends Component {
    constructor(props) {
        super(props)
        this.state = {
            allUnitTypes: [],
            allBusiness: [],
            allLocations: [],
            showLocationDropDown: false,
            displaySelected: false,
            searchBy: '',
            searchPhrase: '',
            showInput: false,
            units: [],
            displayUnits: false
        }
    }
    componentDidMount() {
        this.refs.getButton.disabled = true;
    }
    async getLocations(location) {
        var allLocations = await axios.get('http://localhost:3003/locations/' + location);
        if (allLocations.data.length > 0) {
            this.setState({ allLocations: allLocations.data, showLocationDropDown: true });
        }
    }
    async changeSearchBy() {
        if (this.refs.search.value === 'search') {
            this.setState({ showInput: false, displayUnits: false })
        } else {
            this.setState({ displayUnits: false })
            if (this.refs.search.value === 'business') {
                var allTheBusiness = await axios.get('http://localhost:3003/businesses');
                this.setState({ allBusiness: allTheBusiness.data, showInput: true, searchBy: this.refs.search.value });
            } else if (this.refs.search.value === "unit Types") {
                var allUnitTypes = await axios.get('http://localhost:3003/unitTypes');
                this.setState({ allUnitTypes: allUnitTypes.data, showInput: true, searchBy: this.refs.search.value });
            } else {
                this.setState({ showInput: true, searchBy: this.refs.search.value })
            }
        }
    }
    handleChange() {
        switch (this.refs.select.name) {
            case "location":
                if (this.refs.select.value.length > 0) {
                    this.setState({ searchPhrase: this.refs.select.value })
                } else {
                    this.refs.getButton.disabled = true;
                    this.setState({ searchPhrase: this.refs.select.value })
                }
                break;
            case "business":
                if (this.refs.select.value === "Select Business") {
                    this.refs.getButton.disabled = true;
                } else {
                    this.setState({ searchPhrase: this.refs.select.value })
                    this.refs.getButton.disabled = false;
                }
                break;
            case "unit types":
                if (this.refs.select.value === "Select unit type") {
                    this.refs.getButton.disabled = true;
                } else {
                    this.setState({ searchPhrase: this.refs.select.value })
                    this.refs.getButton.disabled = false;
                }
                break;
            default:
                break;
        }
    }
    handleLocationChange() {
        this.setState({ searchPhrase: this.refs.locationDropDown.value })
        this.refs.getButton.disabled = false;
    }
    async getData() {
        var allUnits = await axios.get(`http://localhost:3003/allUnits/${this.state.searchBy}/${this.state.searchPhrase}`);
        if (allUnits) {
            this.setState({ units: allUnits.data, displayUnits: true });
        }
    }
    render() {
        return (
            <div className="App-container">
                <h3>View all units</h3>
                <select ref="search" onChange={() => this.changeSearchBy()}>
                    <option value="search">sort by</option>
                    <option value="business">Business</option>
                    <option value="unit Types">Unit Type</option>
                    <option value="locations">Locations</option>
                </select>
                {this.state.showInput && this.state.searchBy === "business" && (
                    <select ref="select" name="business" onChange={() => this.handleChange()}>
                        <option value="Select Business">Select Business</option>
                        {this.state.allBusiness.map(singleBusiness => {
                            return <option key={this.state.allBusiness.indexOf(singleBusiness)} value={singleBusiness.name}>{singleBusiness.name}</option>
                        })}
                    </select>)}
                {this.state.showInput && this.state.searchBy === "locations" && (
                    <div>
                        <input type="text" name="location" placeholder="location search key(country/province/town)" ref="select" onChange={() => this.handleChange()} />
                        <button onClick={() => this.getLocations(this.state.searchPhrase)}>find</button>
                    </div>
                )}
                {this.state.showLocationDropDown && (
                    <select ref="locationDropDown" name="locationDropDown" onChange={() => this.handleLocationChange()}>
                        <option value="Select locations">Select locations</option>
                        {this.state.allLocations.map(singleBusiness => {
                            return <option key={this.state.allBusiness.indexOf(singleBusiness)} value={`${singleBusiness.country},${singleBusiness.address1},${singleBusiness.address2},${singleBusiness.address3}`}>{singleBusiness.country}, {singleBusiness.address1}, {singleBusiness.address2}, {singleBusiness.address3}</option>
                        })}
                    </select>
                )}
                {this.state.showInput && this.state.searchBy === "unit Types" && (
                    <select ref="select" name="unit types" onChange={() => this.handleChange()}>
                        <option value="Select unit type">Select unit type (height, length, width)</option>
                        {this.state.allUnitTypes.map(singleUnitType => {
                            return <option key={this.state.allUnitTypes.indexOf(singleUnitType)} value={`${singleUnitType.name}, ${singleUnitType.height}, ${singleUnitType.length}, ${singleUnitType.width}`}> {singleUnitType.name} ({singleUnitType.height}, {singleUnitType.length}, {singleUnitType.width})</option>
                        })}
                    </select>)}
                <button onClick={() => this.getData()} ref="getButton">Go</button>
                {this.state.displayUnits && (
                    this.state.units.map(item =>
                        <h4>{item.name}</h4>)
                )}
            </div >
        )
    }
}