export function getAllBusinesses(businesses) {
    return { type: "GET_BUSINESSES", value: businesses }
}
export function changeSelectedBusiness(name) {
    return { type: "BUSINESSES_NAME", value: name }
}
