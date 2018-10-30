export function getAllBusinesses(businesses) {
    return { type: "GET_BUSINESSES", value: businesses }
};
export function changeSelectedBusiness(name) {
    return { type: "BUSINESSES_NAME", value: name }
};
export function removeError() {
    return { type: "ERROR_NOT_PRESENT" };
};
export function getBusinessesWithLocation(businesses) {
    return { type: "SET_BUSINESSES", newValue: businesses };

};
export function changeSelectedBusinessInBlocks(newBusiness) {
    return { type: "CHANGE_SELECTED_BUSINESS", newValue: newBusiness }
}
export function changeBusinessLocationsInBlocks(locations) {
    return { type: "CHANGE_SELECTED_BUSINESS_LOCATIONS", newValue: locations }
}
export function changeLocationsInBlocks(location) {
    return { type: "CHANGE_SELECTED_LOCATIONS", newValue: location }
}
