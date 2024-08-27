<template>
    <div v-show="props.showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-[black] bg-opacity-50">
        <div class="rounded-2xl w-[450px] h-[250px] flex flex-col justify-center items-center gap-4">
            <input type="text" placeholder="Enter the room id" class=" text-black  w-[400px] text-center h-[40px] rounded-lg text-md font-bold bg-slate-100">
            <div class="flex gap-4 justify-center items-center">
                <button @click="props.cancel" class="bg-green-200 text-center w-[150px] h-[35px] rounded-md font-medium">Cancel</button>
                <button @click="props.join" class="bg-green-200 text-center w-[150px] h-[35px] rounded-md font-medium">Join</button>
            </div>
        </div>
    </div>    
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps ({
    showModal: Boolean,
    cancel: String,
    join: String,
});
</script>