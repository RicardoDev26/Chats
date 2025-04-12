<template>
    <section class="bg-[#f45b5b] w-full h-screen text-white flex flex-col items-center text-center justify-center ">
      <div><enviar class="w-[150px] h-[150px]" /></div>
      <div class="text-5xl font-black mb-9">Incognito Messages</div>
      <div class="flex flex-col justify-center items-center">
        <div class="relative  flex  justify-center gap-4 ">
            <button @click="crearSala" class="w-[150px] h-[35px] rounded-md bg-yellow-200 text-black font-bold cursor-pointer hover:bg-white">Crear Sala</button>
            <button @click="OpenModal" class="w-[150px] h-[35px] rounded-md bg-yellow-200 text-black font-bold cursor-pointer hover:bg-white">Entrar Sala</button>
          <div v-if="error" class="error">{{ error }}</div>
        </div>
        <!-- <div v-show="showUserInput" class="relative mt-6">
              <input type="text" v-model="userName" placeholder="Username" class="outline-none px-4 w-[150px] h-[35px] rounded-md text-black">
              <button @click="registerUser" class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent p-0 m-0 border-none" ><send class="text-[#cdc5c4] cursor-pointer"/></button>  
        </div> -->
        <div v-show="showUserInput" class="fixed inset-0 z-50 flex items-center justify-center bg-[black] bg-opacity-50">
          <div class="rounded-2xl w-[450px] h-[250px] flex flex-col justify-center items-center gap-4">
              <input v-model="userName" type="text" placeholder="Enter Username" class=" text-black  w-[400px] text-center h-[40px] rounded-lg text-md font-bold bg-slate-100">
              <div class="flex gap-4 justify-center items-center">
                  <button @click="closeModal" class="bg-green-200 text-center w-[150px] h-[35px] rounded-md font-medium">Cancel</button>
                  <button @click="registerUser" class="bg-green-200 text-center w-[150px] h-[35px] rounded-md font-medium">Register</button>
              </div>
          </div>
        </div>  
        <div v-show="showJoinInput" class="fixed inset-0 z-50 flex items-center justify-center bg-[black] bg-opacity-50">
          <div class="rounded-2xl w-[450px] h-[250px] flex flex-col justify-center items-center gap-4">
              <input v-model="roomUUID" type="text" placeholder="Enter the room id" class=" text-black  w-[400px] text-center h-[40px] rounded-lg text-md font-bold bg-slate-100">
              <input v-model="userName" type="text" placeholder="Enter Username" class=" text-black  w-[400px] text-center h-[40px] rounded-lg text-md font-bold bg-slate-100">
              <div class="flex gap-4 justify-center items-center">
                  <button @click="closeModal" class="bg-green-200 text-center w-[150px] h-[35px] rounded-md font-medium">Cancel</button>
                  <button @click="JoinUser" class="bg-green-200 text-center w-[150px] h-[35px] rounded-md font-medium">Join</button>
              </div>
          </div>
        </div>  
      </div>
      <!-- <ModalIdRoom :showModal="showModalJoin" :cancel="closeModal" :join="entrarSala" /> -->
      <!-- <modalRegister :showModal="showModalRegister" :close="closeModal" :register="registerUser" :vmodel="userName" /> -->
    </section>
  </template>
  
  <script setup>
  import enviar from '../assets/enviar.vue'
  import send from '../assets/send.vue'
  import { useRouter } from 'vue-router'
  import { ref } from 'vue'
  // import ModalIdRoom from '../components/ModalIdRoom.vue'
  // import modalRegister from '../components/ModalRegisterUser.vue'

  // const showModalJoin = ref(false)
  // const showModalRegister = ref(false)

  
  const showUserInput = ref(false)
  const showJoinInput = ref(false)

  const OpenModal = () => {
    showJoinInput.value = true
  }

  const closeModal = () => {
    showJoinInput.value = false
    showUserInput.value = false
  }

  const router = useRouter()
  const userName = ref('')
  const roomUUID = ref('')
  const roomId = ref('')
  const error = ref(null)
 

  const crearSala = () => {
      showUserInput.value = true
  };

  const registerUser = async () => {
    try {
          const crearSalaa = await fetch ('http://localhost:3001/api/canales/crear', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
          })
          const data = await crearSalaa.json()
            roomId.value = data.sala_id
            localStorage.setItem('salaId', roomId.value)
         
          

      const response = await fetch('http://localhost:3001/api/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ usuario: userName.value }),
      })
      const userData = await response.json()

      const unirseSala = await fetch('http://localhost:3001/api/canales/unirse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sala_id: roomId.value,
        user_id: userData.user_id,
      }),
    })

    if (unirseSala.ok) {
      localStorage.setItem('salaId', roomId.value)
      localStorage.setItem('userId', userData.usuario)
      router.push({ name: 'salaChat', params: { salaId: roomId.value } })
    }
  } catch (error) {
    console.error('Error al registrar el usuario o unirse a la sala:', error)
  }
};

const JoinUser = async () => {
  try {
    const  response = await fetch ('http://localhost:3001/api/registro', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({ usuario: userName.value })
    })
    const userData = await response.json()

    const unirseSala = await fetch ('http://localhost:3001/api/canales/unirse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sala_id: roomUUID.value,
        user_id: userData.user_id
      })
    })

    if(unirseSala.ok) {
      localStorage.setItem('salaId', roomUUID.value)
      localStorage.setItem('userId', userData.usuario)
      router.push({ name: 'salaChat', params: { salaId: roomUUID.value } })
    }
  } catch (error) {
    console.error('ERror al cargar el usuario o la sala:', error)
  }
}

  </script>
  
  <style scoped>
  input::placeholder {
    color: rgb(150, 150, 150);
    opacity: 1;
  }

</style>
  