<script setup>
import { format } from 'date-fns';
import { ref } from 'vue';
import { useToast } from "vue-toastification";
import InputFields from '../components/InputFields.vue';
import { useInventoryController } from '../controllers/InventoryController';

const toast = useToast()
const invController = useInventoryController()
const inventoryForm = ref({
    date: format(new Date(), 'yyyy-MM-dd'),
    productName: 'Books',
    cost: 0,
    quantity: 0,
    balance: 0,
})

const intOnly = (val) => (
    val && Number(val) > 0 ? true : 'Must be more than 0'
);

function createInv() {
    if(checkIfInputsValid()){
        invController.setInventory({ ...inventoryForm.value, balance: inventoryForm.value.quantity})
    }
}

function checkIfInputsValid(){
    if(inventoryForm.quantity == 0 || inventoryForm.salesPrice == 0){
        toast.error("Values cannot be 0")
        return false
    }
    return true
}

function clearForm(){
    inventoryForm.value = {
        date: format(new Date(), 'yyyy-MM-dd'),
        productName: 'Books',
        cost: 0,
        quantity: 0,
        balance: 0,
    }
}
</script>

<template>
  <div class="mb-4 border-2 p-4 rounded-xl">
    <span>Purchase Inventory</span>
    <div class="grid grid-cols-2 w-full gap-2 justify-center mt-2">
        <InputFields
            v-model="inventoryForm.date"
            label="Date"
            placeholder="0"
            type="date"
            id="inputDate"
        />
        <InputFields
            v-model="inventoryForm.productName"
            label="Name"
            placeholder="0"
            :rules="[intOnly]"
            type="string"
            id="name"
            disabled
        />
        <InputFields
            v-model="inventoryForm.cost"
            label="Cost (RM)"
            placeholder="0"
            :rules="[intOnly]"
            type="number"
            id="cost"
        />
        <InputFields
            v-model="inventoryForm.quantity"
            label="Quantity"
            placeholder="0"
            :rules="[intOnly]"
            type="number"
            id="qty"
        />
    </div>
    <div class="float-right mt-4">
        <button class="mr-2 baseButton" @click="clearForm()">✕</button>
        <button class="baseButton" @click="createInv()">✔</button>
    </div>
  </div>
</template>

<style scoped>

</style>
