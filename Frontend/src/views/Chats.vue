<template>
    <section class="flex w-full h-screen bg-[#f69d9d]">
      <section class="w-[580px] h-full bg-white">

      </section>
      <section class="w-full h-full">
        <div :style="{ backgroundImage: `url(${fondo})` }" class="fondotelegram bg-cover bg-center bg-no-repeat rounded-md w-full h-full flex opacity-40 px-[210px]">
            <div class="chat flex flex-col w-full gap-1 pb-4">
                <div class="mensajes h-full">
                  <div
                    v-for="message in mensajes"
                    :key="message.id"
                    :class="{'my-message': message.user_id === myUserId, 'guest-message': message.user_id !== myUserId}">
                    <p>{{ message.mensaje }}</p>
                    <span>{{ new Date(message.timestamp).toLocaleTimeString() }}</span>
                  </div>
                </div>
                <div class="flex gap-1">
                    <input v-model="newMessage" @keyup.enter="sendMenssage" type="text" placeholder="Mensaje" class="w-full h-[50px] rounded-2xl outline-none p-4">
                    <button @click="sendMenssage" class="rounded-full bg-[#f45b5b] w-[45px] h-[45px] flex justify-center items-center"> <send class="text-white" /> </button>
                </div>
            </div>
        </div>
      </section>
    </section>
  </template>
  
  <script setup>
  import fondo from '../assets/descarga.png'
  import send from '../assets/send.vue'
  import { onMounted, ref } from 'vue';

  const mensajes = ref([])
  const MyuserId = ref(localStorage.getItem('MyuserID') || '')
  const newMessage = ref('')
  const salaId = ref(localStorage.getItem('SalaId') || '')

console.log(MyuserId.value)
console.log(salaId.value)

  if (!MyuserId.value || !salaId.value) {
    console.error('Error EL usuario y sala no ewtas definidos')
  } else {

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
    }

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
          const  newMsg = await response.json()
          mensajes.value.push(nuevoMsg)
          newMessage.value = ''
        } else {
          console.error('Error al enviar el mensaje')
        }
      } catch (error) {
        console.error('Error al conectar con el servicor:', error)
      }
    }

    onMounted(() => {
      fetchMensajes()
    })
  }

  
  
  </script>
  

<style scoped>
  input::placeholder {
    color: rgb(150, 150, 150);
    opacity: 1;
  }

</style>