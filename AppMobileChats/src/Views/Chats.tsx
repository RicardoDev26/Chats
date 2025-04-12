import React, { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from "socket.io-client";
import { useNavigation } from "@react-navigation/native";
import { StyledView, StyledText, StyledTextInput, StyledTouchableOpacity, StyledImageBackground } from "../shared/styled"; // Asegúrate de que estos componentes estén definidos correctamente en tu proyecto.

const fondo = require("../../assets/fondoChat.png");
const socket = io("http://localhost:3001");
const navigation = useNavigation

const ChatsView = ({ route }) => {

  type Message = {
    id: string;
    user_id: string;
    mensaje: string;
    timestamp: number;
  };
  const [mensajes, setMensajes] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [salaId, setSalaId] = useState<string>("");
  const [myUserId, setMyUserId] = useState<string>("");


    // UseEffect para el user id con localstorege, adaptando despues se metera en redux

  useEffect(() => {
    const  fetchUserId = async () => {
        const userId = await AsyncStorage.getItem("userId")
        setMyUserId(userId || "")
    }

    fetchUserId()
  }, [])

  // UseEffect para el salaid con localstorege, adaptando despues se metera en redux

  useEffect(() => {
    if (myUserId && salaId) {
        socket.emit("JoinRoom", { salaId, userId: myUserId})
        const handleReceiveMessage = (messageData: Message) => {
            setMensajes((prevMensajes) => [...prevMensajes, messageData])
        }
        socket.on("Recieve_message", handleReceiveMessage)

        return () => {
            socket.off("recieve_message", handleReceiveMessage)
            socket.disconnect()
        }
    }
  },[salaId,myUserId])

  const fetchMensajes = async () => {
    try {
        const response = await fetch(`http://10.0.2.2:3001/api/mensajes/${salaId}`);
      if (response.ok) {
        const data = await response.json();
        setMensajes(data);
      } else {
        console.error("Error al cargar los mensajes");
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage) return;

    try {
      const response = await fetch("http://10.0.2.2:3001/api/mensajes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          salaId,
          userId: myUserId,
          mensaje: newMessage,
        }),
      });

      if (response.ok) {
        setNewMessage(""); // Clear the input field after sending
      } else {
        console.error("Error al enviar el mensaje");
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
    }
  };

  const renderItem = ({ item }: {item: Message}) => (
    <StyledView
      className={`flex flex-col mb-4 ${
        item.user_id.toLowerCase() === myUserId.toLowerCase() ? "items-end" : "items-start"
      }`}
    >
      <StyledText className="text-white font-black text-lg">{item.user_id}:</StyledText>
      <StyledText className="text-white max-w-[450px] rounded-xl px-2 break-words bg-[#212121]">
        {item.mensaje}
      </StyledText>
      <StyledText className="text-white text-xs">
        {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </StyledText>
    </StyledView>
  );

  return (
    <StyledView className="w-full h-full flex-col">
      <StyledView className="bg-[#212121] w-full h-[90px] p-3 justify-center items-center">
        <StyledText className="text-white text-xl font-bold">{salaId}</StyledText>
      </StyledView>

      <StyledImageBackground
        className="flex-1 bg-[#281437] bg-cover bg-center bg-no-repeat px-10"
        source={fondo} style={{flex: 1}}
      >

        <StyledView className="w-full h-full mb-10 pb-4">
          <StyledView className="h-3/4">
            <StyledView>
              {mensajes.map((message) => (
                <StyledView key={message.id} className="flex-col mb-4">
                  <StyledText className="text-white font-black text-lg">{message.user_id}:</StyledText>
                  <StyledText className="text-white max-w-[450px] rounded-xl px-2 break-words bg-[#212121]">
                    {message.mensaje}
                  </StyledText>
                  <StyledText className="text-white text-xs">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </StyledText>
                </StyledView>
              ))}
            </StyledView>
          </StyledView>

          <StyledView className=" z-10 w-full h-1/4 mt-4">
            <StyledTextInput
              value={newMessage}
              onChangeText={setNewMessage}
              onSubmitEditing={sendMessage}
              placeholder="Mensaje"
              className="bg-[#212121] text-white w-full h-[50px] rounded-2xl outline-none p-4"
            />
            <StyledTouchableOpacity onPress={sendMessage} className="rounded-full bg-[#7963DD] w-[45px] h-[45px] justify-center items-center">
              <StyledText className="text-white">SEND</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>
      </StyledImageBackground>
    </StyledView>
  );
};

export default ChatsView;
