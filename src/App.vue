<script setup>
import { ref, shallowRef } from 'vue';
import Sales from './Pages/Sales.vue'
import Inventory from './Pages/Inventory.vue'
import PurchaseInventory from './Pages/PurchaseInventory.vue'
import SalesTransaction from './Pages/SalesTransaction.vue'

import PillButtons from './components/PillButtons.vue'
import {useInventoryController} from './controllers/InventoryController'

const invController = useInventoryController()
const section = ref('sales')
const activeComponent = shallowRef(Sales)

const componentMap = {
  'Sales': Sales,
  'Inventory': Inventory
}

function updateSectionValue(value){
  console.log('Active component object:', activeComponent.value)
  activeComponent.value = componentMap[value]
}
</script>

<template>
  <div class="font-bold text-2xl mb-4">Weighted Average Cost Tracker</div>
  <div class="w-full inline-block">
    <div class="w-1/6 h-28 flex flex-col border-2 float-right rounded-xl">
      <span class="text-sm">Total Inventory on Hand</span>
      <span class="flex-1 flex justify-center items-center text-center font-bold text-2xl">
        {{ invController.getInvStock }}
      </span>
    </div>
    <div class="w-1/6 h-28 flex flex-col border-2 float-right rounded-xl mr-2">
      <span class="text-sm ">Latest WAC (RM)</span>
      <div class="flex-1 flex justify-center items-center text-center p-2 font-bold text-2xl">
        {{ invController.getLatesWac }}
      </div>
    </div>
    <button class="w-24 h-24 float-left errorButton baseButton" @click="invController.clearCookies()">
      Clear All Data
    </button>
  </div>
  <div class="flex gap-2">
    <SalesTransaction class="flex-1"/>
    <PurchaseInventory class="flex-1"/>
  </div>
  <div>
    <div class="h-96 border-2 rounded-xl p-4">
      <PillButtons class="w-full h-10" @update-section="updateSectionValue"/>
      <Transition name="fade" mode="out-in">
        <component :is="activeComponent" ></component>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
