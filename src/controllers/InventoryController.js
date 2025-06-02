import { ref, computed } from 'vue';
import { parseISO } from 'date-fns';
import { useToast } from "vue-toastification";

//Intialize all the required variables for inventory and sales
let inventoryArray = ref([])
let salesArray  = ref([])
let transactionsObject = {}
let currentInvStock = ref(0)
const toast = useToast()

const getInventory = computed(() => inventoryArray.value);
const getSales = computed(() => salesArray.value);
const getInvStock = computed(() =>currentInvStock.value);
const getLatesWac = computed(() =>
    inventoryArray.value.length > 0 ? inventoryArray.value[inventoryArray.value.length-1].weightedAverageCost : 0
);
const getFirstInvDate = computed(() =>
  inventoryArray.value.length > 0 ? inventoryArray.value[0].date : ''
);

function bake_cookie(name, value) {
    var cookie = [
        name, '=', JSON.stringify(value),
        '; path=/;',
        window.location.hostname !== 'localhost' ? ' domain=' + window.location.hostname + ';' : ''
    ].join('');
    document.cookie = cookie;
}

function saveCookies(){
    bake_cookie('salesArray', salesArray.value)
    bake_cookie('inventoryArray', inventoryArray.value)
    bake_cookie('transactionsObject', transactionsObject)
    bake_cookie('currentInvStock', currentInvStock.value)
}

function read_cookie(name) {
    var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
    result && (result = JSON.parse(result[1]));
    return result;
}

function clearCookies(){
    document.cookie.split(";").forEach(cookie => {
        const name = cookie.split("=")[0].trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    inventoryArray.value = []
    salesArray.value = []
    transactionsObject = {}
    currentInvStock.value = 0
    toast.success('Data cleared successfully')
}

// Check if there is any existing Cookies
inventoryArray.value = read_cookie('inventoryArray') || []
salesArray.value = read_cookie('salesArray') || []
transactionsObject = read_cookie('transactionsObject') || {}
currentInvStock.value = read_cookie('currentInvStock') || 0

//To check exisiting transaction dates without 
//looping through the sales and inventory array everytime
function checkExistingTransDate(dateStr){
    const epochDate = parseISO(dateStr).getTime();
    if (transactionsObject[epochDate]) {
        toast.error(`There is an existing ${transactionsObject[epochDate]} transaction on this date`);
        return null;
    }
    return epochDate
}

// Binary search to add the row according to the epochDate time
function insertSorted(array, newItem) {
    let low = 0, high = array.length;
    while (low < high) {
        let mid = Math.floor((low + high) / 2);
        if (array[mid].epochDate < newItem.epochDate) {
        low = mid + 1;
        } else {
        high = mid;
        }
    }
    array.splice(low, 0, newItem);
    return low; 
}

// Binary search to find the earliest inventory row available
//  based on the sales date
function findEpochFloor(newItem) {
    let arrValue = inventoryArray.value
    let low = 0, right = arrValue.length - 1;
    if (newItem.epochDate >= arrValue[right].epochDate) return right; 
    while (low <= right) {
        let mid = Math.floor((low + right) / 2);
        if (mid === arrValue.length - 1) {
            return mid;
        }
        if(arrValue[mid].epochDate <= newItem.epochDate && newItem.epochDate < arrValue[mid + 1].epochDate ){
            return mid
        }
        else if(newItem.epochDate < arrValue[mid].epochDate) {
            right = mid - 1;
        } else {
            low = mid + 1;
        }
    }
    return -1; 
}

// Update the wac starting from a certain index
function updateWACFrom( startIndex = 0, salesTransaction = false) {
    let runningQty = 0;
    let runningCost = 0;

    if (startIndex > 0) {
        let wac = parseFloat(inventoryArray.value[startIndex - 1].weightedAverageCost);
        for (let i = 0; i < startIndex; i++) {
            runningQty += inventoryArray.value[i].balance;
            //Calculate based on wac if sales if not it will use cost for inventory
            runningCost += inventoryArray.value[i].balance * (salesTransaction ? wac : inventoryArray.value[i].cost);
        }
    }

    for (let i = startIndex; i < inventoryArray.value.length; i++) {
        let entry = inventoryArray.value[i]
        runningQty += entry.balance;
        runningCost += entry.balance * entry.cost;
        inventoryArray.value[i].weightedAverageCost = (Math.ceil((runningCost / runningQty) * 100) / 100);
    }
}

// check if there is enough balance by going thru startIndex
// and going back from there
function checkFrombalance(startIndex, remaining){
    let costArray = [];
    // Used to track which inventory batch was it deleted from
    let epochAmtTracking = []
    const wac = parseFloat(inventoryArray.value[startIndex].weightedAverageCost);
    for(let index = startIndex; index >= 0 && remaining > 0; index--){
        const current = inventoryArray.value[index];

        if (current.balance <= 0) continue;

        // Will check if remaining exceeds the balance at a batch row
        if(current.balance < remaining){
            costArray.push({
                balance: 0,
                cost: current.balance * wac,
                index: index,
                amountDeducted: current.balance
            })
            epochAmtTracking.push({
                amountDeducted: current.balance,
                epochDate: current.epochDate
            })
            remaining -= current.balance;
        }else{
            costArray.push({
                balance: current.balance - remaining,
                cost: remaining * wac,
                index: index,
                amountDeducted: remaining
            })
            epochAmtTracking.push({
                amountDeducted: remaining,
                epochDate: current.epochDate
            })
            remaining = 0;
            return {
                cost: costArray,
                epochTracking: epochAmtTracking
            }
        }
    }

    toast.error("Insufficient Stock");
    return null;
}

// Is to deduct the balance from the inventory Array
function deductFromBalance(arr){
    let totalCost = 0
    for(let values in arr){
        const index = arr[values].index
        const balance = arr[values].balance
        totalCost = totalCost + arr[values].cost
        inventoryArray.value[index].balance = balance
    }
    return totalCost
}

// Used to create an inventory row
function setInventory(value){
    let epochDate = checkExistingTransDate(value.date, 'Inventory')
    if(epochDate == null){
        return
    }
    value.epochDate = epochDate;

    transactionsObject[epochDate] = "Inventory";
    const index = insertSorted(inventoryArray.value , value)
    currentInvStock.value += value.quantity
    updateWACFrom(index)
    
    //Used to store values into the cookies acting as a local DB
    saveCookies()
    toast.success("Inventory entry added");
}

// Used to create a sales row
function setSales(value){
    // Check if there is an existing transaction on a given date
    let epochDate = checkExistingTransDate(value.date, 'Sales')
    if(epochDate == null){
        return
    }
    value.epochDate = epochDate;

    //Check if theres inventory beforehand
    if(inventoryArray.value.length < 1){
        toast.error("Please purchase inventory before creating sales");
        return;
    }

    if( value.epochDate < inventoryArray.value[0].epochDate){
        toast.error("No stock is available on the selected sales date");
        return;
    }

    //Find the floor of the inventoryArray index
    const invIndex = findEpochFloor(value)

    if(inventoryArray.value[invIndex].weightedAverageCost > value.salesPrice){
        toast.error(`Sales price is lower than WAC at ${inventoryArray.value[invIndex].date}`);
        return;
    }
    //Adding the sales to the salesArray
    let totalCost = 0
    let costObject = checkFrombalance(invIndex, value.quantity)
    if(costObject != null){
        //Deduct from the inventoryArray balance
        totalCost = deductFromBalance(costObject.cost)
        const tempSalesObj = {
            ...value, 
            'totalCost': totalCost,
            'totalAmt': value.salesPrice * value.quantity,
            'epochAmtArrays': costObject.epochTracking
        }
        const salesIndex = insertSorted(salesArray.value, tempSalesObj)
        currentInvStock.value -= value.quantity
        //Update the WAC for any later inventory rows
        if(invIndex + 1 != inventoryArray.value.length){
            updateWACFrom(invIndex + 1, true)
        }

        toast.success("Sales entry added");

        //Used to store values into the cookies acting as a local DB
        transactionsObject[epochDate] = "Sales";
        saveCookies()
    }
}

function deleteSales(salesArrayRow, index){
    // Created a map to prevent double for loops
    const inventoryMap = new Map();
    inventoryArray.value.forEach((inv, idx) => {
        inventoryMap.set(inv.epochDate, { inv, idx });
    });

    let lastIndex = 0;

    for (const epochAmt of salesArrayRow.epochAmtArrays) {
        const match = inventoryMap.get(epochAmt.epochDate);
        if (match) {
            match.inv.balance += epochAmt.amountDeducted;
            lastIndex = match.idx;
        }
    }

    //Recalculate WAC and delete from arrays
    updateWACFrom(lastIndex, true)
    salesArray.value.splice(index, 1);
    delete transactionsObject[salesArrayRow.epochDate]
    currentInvStock.value += salesArrayRow.quantity

    saveCookies()
    toast.success("Sales deleted successfully")
}

export function useInventoryController(){
    return {
        bake_cookie,
        read_cookie,
        setInventory,
        setSales,
        checkExistingTransDate,
        clearCookies,
        deleteSales,
        getInventory,
        getSales,
        getInvStock,
        getFirstInvDate,
        getLatesWac
    }
}