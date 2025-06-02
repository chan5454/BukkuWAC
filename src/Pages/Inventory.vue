<script setup>
import { ref } from 'vue'
import {useInventoryController} from '../controllers/InventoryController'

const { getInventory } = useInventoryController()

</script>

<template>
  <div class="p-4 h-[90%] overflow-auto">
    <span>Inventory</span>
    <table class="w-full" v-if="getInventory.length > 0">
      <thead class="border-b-2">
        <tr>
          <th class="w-1/6">Date</th>
          <th class="w-1/6">Product</th>
          <th class="w-1/6">Quantity</th>
          <th class="w-1/6">Balance</th>
          <th class="w-1/6">Cost (RM)</th>
          <th class="w-1/6">WAC (RM)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="inv in getInventory" :key="inv.epochDate" class="border rounded-2xl mb-2 p-1 hover:animate-pulse hover:bg-cyan-700/20">
          <th class="w-1/6">
            <span class="font-normal">{{ inv.date }}</span>
          </th>
          <th class="w-1/6">
            <span class="font-normal">{{ inv.productName }}</span>
          </th>
          <th class="w-1/6">
            <span class="font-normal">{{ inv.quantity }}</span>
          </th>
          <th class="w-1/6">
            <span class="font-normal">{{ inv.balance }}</span>
          </th>
          <th class="w-1/6">
            <span class="font-normal">{{ inv.cost.toFixed(2) }}</span>
          </th>
          <th class="w-1/6">
            <span class="font-normal">{{ inv.weightedAverageCost.toFixed(2) }}</span>
          </th>
        </tr>
      </tbody>
    </table>
    <div class="h-[90%] flex items-center justify-center" v-if="getInventory.length == 0">
      <span class="text-xl">No inventory entries found.</span>
    </div>
  </div>
</template>
