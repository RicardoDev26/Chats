<template>
    <section class="flex w-full h-full gap-[1px]">
      <section class="w-[580px] h-screen bg-[#212121] text-white">
        <div class="text-center p-2"> User Online </div>
        <div class="flex flex-col gap-1 px-5"> 
          <div v-for="user in sortedUsers" :key="user.id">
              {{ user.usuario }}
          </div>
        </div>

      </section>
      <section class="w-full h-screen flex flex-col">
        <div class="bg-[#212121] text-white text-center w-full h-[90px] p-3"> RoomId:  {{ salaId }}</div> 
        <div :style="{ backgroundImage: `url(${fondo})` }" class="fondotelegram bg-[#281437] bg-cover bg-center bg-no-repeat w-full h-full flex opacity-100 px-[210px]">  
          <div class="chat flex flex-col w-full gap-1 pb-4">
                <div class="mensajes h-full">
                  <div
                    v-for="message in mensajes"
                    :key="message.id"
                    :class="{'my-message': message.user_id === MyuserId, 
                    'guest-message': message.user_id !== MyuserId}"
                    :style="{
                      textAlign: message.user_id === MyuserId ? 'right' : 'left'
                    }"
                    >
                    <p class="bg-black text-white rounded-xl px-2">{{ message.usuario }} : {{ message.mensaje }}</p>
                    <span class="text-white text-xs">{{ new Date(message.timestamp).toLocaleTimeString() }}</span>
                  </div>
                </div>
                <div class="flex gap-1">
                    <input v-model="newMessage" @keyup.enter="sendMenssage" type="text" placeholder="Mensaje" class="bg-[#212121] text-white w-full h-[50px] rounded-2xl outline-none p-4">
                    <button @click="sendMenssage" class="rounded-full bg-[#7963DD] w-[45px] h-[45px] flex justify-center items-center"> <send class="text-white" /> </button>
                </div>
            </div>
        </div>
      </section>
    </section>
  </template>
  
  <script setup>
  import fondo from '../assets/descarga.png'
  import send from '../assets/send.vue'
  import { onMounted, onUnmounted, ref, computed } from 'vue';
  import { io } from 'socket.io-client'

  const mensajes = ref([])
  const MyuserId = ref(localStorage.getItem('userId') || '')
  const newMessage = ref('')
  const salaId = ref(localStorage.getItem('salaId') || '')
  const socket = io('http://localhost:3001')
  const users = ref([]) 

  const sortedUsers = computed(() => {
  const myUser = users.value.find(user => user.id === MyuserId.value)
  const otherUsers = users.value.filter(user => user.id !== MyuserId.value)
  return myUser ? [myUser, ...otherUsers] : otherUsers
})

// console.log(MyuserId.value)
// console.log(salaId.value)


    const fetchMensajes = async () => {
      try {
      const response = await fetch (`http://localhost:3001/api/mensajes/${salaId.value}`)
      if(response.ok) {
        mensajes.value = await response.json()
      } else {
        console.error('Error al cargar los mensajes')
        }
      } catch (error) {
        console.error('Error al conectar con el servidor:', error)
      }
    };

  const fetchUsuarios = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/usuarios/${salaId.value}`)
      if (response.ok) {
        users.value = await response.json()
      } else {
        console.error('Error al cargar los usuarios')
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error)
    }
};

    const sendMenssage = async () => {
      if (!newMessage.value) return

      try {
        const response = await fetch ('http://localhost:3001/api/mensajes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            salaId: salaId.value,
            userId: MyuserId.value,
            mensaje: newMessage.value
          })
        });
        if(response.ok) {
          const   newMsg = await response.json()
          mensajes.value.unshift(newMsg)
          newMessage.value = ''
        } else {
          console.error('Error al enviar el mensaje')
        }
      } catch (error) {
        console.error('Error al conectar con el servicor:', error)
      }
    };

    onMounted(() => {
  fetchMensajes()
  fetchUsuarios()

  socket.emit('join_room', salaId.value)
  socket.on('receive_message', (messageData) => {
    mensajes.value.push(messageData)
  })
  socket.on('update_users', (userList) => {
    users.value = userList
  })
})

onUnmounted(() => {
  socket.disconnect()
})

  
  
  </script>
  

<style scoped>
  input::placeholder {
    color: rgb(150, 150, 150);
    opacity: 1;
  }

  .mensajes {
  display: flex;
  flex-direction: column;
  overflow-y: auto; 
  height: calc(100vh - 120px);
  padding: 10px;
}

</style>