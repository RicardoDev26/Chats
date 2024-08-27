<template>
    <div v-show="props.showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-[black] bg-opacity-50">
        <div class="rounded-2xl w-[450px] h-[250px] flex flex-col justify-center items-center gap-4">
            <input v-model="localVModel" type="text" placeholder="Enter Username" class=" text-black  w-[400px] text-center h-[40px] rounded-lg text-md font-bold bg-slate-100">
            <div class="flex gap-4 justify-center items-center">
                <button @click="props.close" class="bg-green-200 text-center w-[150px] h-[35px] rounded-md font-medium">Cancel</button>
                <button @click="props.register" class="bg-green-200 text-center w-[150px] h-[35px] rounded-md font-medium">Register</button>
            </div>
        </div>
    </div>    
</template>
