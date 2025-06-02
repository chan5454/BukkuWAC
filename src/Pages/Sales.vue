<script setup>
import { ref } from 'vue'
import {useInventoryController} from '../controllers/InventoryController'

const { getSales, deleteSales } = useInventoryController()
</script>

<template>
  <div class="p-4 h-[90%] overflow-auto">
    <span>Sales History</span>
    <table class="w-full" v-if="getSales.length > 0">
      <thead class="border-b-2">
        <tr>
          <th class="w-1/6">Date</th>
          <th class="w-1/6">Product</th>
          <th class="w-1/6">Quantity</th>
          <th class="w-1/6">Sales Price per Unit (RM)</th>
          <th class="w-1/6">Total Amount (RM)</th>
          <th class="w-1/6">Total Cost (RM)</th>
          <th class="w-1/6"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(inv, index) in getSales" :key="inv.epochDate" class="border rounded-2xl mb-2 p-1 hover:animate-pulse hover:bg-cyan-700/20">
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
            <span class="font-normal">{{ inv.salesPrice.toFixed(2) }}</span>
          </th>
          <th class="w-1/6">
            <span class="font-normal">{{ inv.totalAmt.toFixed(2) }}</span>
          </th>
          <th class="w-1/6">
            <span class="font-normal">{{ inv.totalCost.toFixed(2) }}</span>
          </th>
          <th class="w-1/6">
            <div class="font-normal p-2 cursor-pointer duration-300 ease-in-out hover:scale-115" @click="deleteSales(inv)">✕</div>
          </th>
        </tr>
      </tbody>
    </table>
    <div class="h-[90%] flex items-center justify-center" v-if="getSales.length == 0">
      <span class="text-xl">No Sales entries found.</span>
    </div>
  </div>
</template>
