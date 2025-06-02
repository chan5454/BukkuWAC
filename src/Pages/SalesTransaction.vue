<script setup>
import { ref } from 'vue'
import { format } from 'date-fns';
import {useInventoryController} from '../controllers/InventoryController'
import { useToast } from "vue-toastification";
import InputFields from '../components/InputFields.vue';

const toast = useToast()
const invController = useInventoryController()

// const required = (val) => (val ? true : 'This field is required');
const intOnly = (val) => (
    val && Number(val) > 0 ? true : 'Must be more than 0'
);

const salesForm = ref({
    date: format(new Date(), 'yyyy-MM-dd'),
    productName: 'Books',
    quantity: 0,
    dateEpoch: 0,
    salesPrice: 0,
})

function createSales() {
    if(checkIfInputsValid()){
        invController.setSales({ ...salesForm.value})
    }
}

function checkIfInputsValid(){
    if(salesForm.value.quantity == 0 || salesForm.value.salesPrice == 0){
        toast.error("Values cannot be 0")
        return false
    }
    return true
}

function clearForm(){
    salesForm.value = {
        date: format(new Date(), 'yyyy-MM-dd'),
        productName: 'Books',
        quantity: 0,
        dateEpoch: 0,
        salesPrice: 0,
    }
}

</script>

<template>
  <div class="mb-4 border-2 p-4 rounded-xl">
    <span>New Sales Transaction</span>
    <div class="grid grid-cols-2 w-full gap-2 justify-center mt-2">
        <InputFields
            v-model="salesForm.date"
            label="Date"
            :min="invController.getFirstInvDate.value"
            type="date"
            id="inputDate"
        />
        <InputFields
            v-model="salesForm.productName"
            label="Product Name"
            placeholder="0"
            :rules="[intOnly]"
            disabled
            id="name"
        />
        <InputFields
            v-model="salesForm.quantity"
            label="Quantity"
            placeholder="0"
            :rules="[intOnly]"
            type="number"
            id="qty"
        />
        <InputFields
            v-model="salesForm.salesPrice"
            label="Sales Price per Unit (RM)"
            placeholder="0"
            :rules="[intOnly]"
            type="number"
            id="price"
        />
    </div>
    <div class="float-right mt-4">
        <button class="mr-2 baseButton" @click="clearForm()">✕</button>
        <button class="baseButton" @click="createSales()">✔</button>
    </div>
  </div>
</template>

<style scoped>

</style>
