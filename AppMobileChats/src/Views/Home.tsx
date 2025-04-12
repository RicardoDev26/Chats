import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import SendIcon from "../../assets/Icons/Send";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyledView, StyledText, StyledTouchableOpacity, StyledTextInput } from "../shared/styled";

const HomeView = () => {
  const [userName, setUserName] = useState("");
  const [roomUUID, setRoomUUID] = useState("");
  const [showUserInput, setShowUserInput] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [error, setError] = useState(null);

  const navigation = useNavigation();

  const crearSala = async () => {
    setShowUserInput(true);
  };

  const closeModal = () => {
    setShowUserInput(false);
    setShowJoinInput(false);
  };

  const registerUser = async () => {
    try {
      // Crear sala
      const response = await fetch('http://10.0.2.2:3001/api/canales/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const data = await response.json();
      const roomId = data.sala_id;
      await AsyncStorage.setItem('salaId', roomId);

      // Registrar usuario
      const userResponse = await fetch('http://10.0.2.2:3001/api/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ usuario: userName })
      });
      const userData = await userResponse.json();

      // Unir a sala
      const joinRoomResponse = await fetch('http://10.0.2.2:3001/api/canales/unirse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sala_id: roomId,
          user_id: userData.user_id,
        })
      });

      if (joinRoomResponse.ok) {
        await AsyncStorage.setItem('userId', userData.usuario);
        navigation.navigate("Chat", { salaId: roomId });
      }
    } catch (err) {
      setError("Error al registrar el usuario o unirse a la sala.");
      console.error(err);
    }
  };

  const JoinUser = async () => {
    try {
      const response = await fetch('http://10.0.2.2:3001/api/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ usuario: userName })
      });
      const userData = await response.json();

      const unirseSala = await fetch('http://10.0.2.2:3001/api/canales/unirse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sala_id: roomUUID,
          user_id: userData.user_id
        })
      });

      if (unirseSala.ok) {
        await AsyncStorage.setItem('salaId', roomUUID);
        await AsyncStorage.setItem('userId', userData.usuario);
        navigation.navigate("Chat", { salaId: roomUUID });
      }
    } catch (err) {
      setError("Error al unirse a la sala.");
      console.error(err);
    }
  };

  return (
    <StyledView className="bg-[#F45B5B] justify-center items-center w-full h-full gap-y-5">
      <SendIcon />
      <StyledText className="text-white text-2xl font-bold">Incognito Messages</StyledText>

      <StyledView className="flex-row gap-x-3">
        <StyledTouchableOpacity onPress={crearSala} className="bg-yellow-200 justify-center items-center rounded-md w-[100px] h-[27px]">
          <StyledText className="text-black">Crear Sala</StyledText>
        </StyledTouchableOpacity>
        <StyledTouchableOpacity onPress={() => setShowJoinInput(true)} className="bg-yellow-200 justify-center items-center rounded-md w-[100px] h-[27px]">
          <StyledText>Entrar Sala</StyledText>
        </StyledTouchableOpacity>
      </StyledView>

      {/* Modal para el nombre de usuario */}
      {showUserInput && (
        <StyledView className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
          <StyledView className="rounded-2xl w-[450px] h-[250px] flex flex-col justify-center items-center gap-4">
            <StyledTextInput
              value={userName}
              onChangeText={setUserName}
              placeholder="Enter Username"
              className="text-black w-[400px] text-center h-[40px] rounded-lg bg-slate-100"
            />
            <StyledView className="flex-row gap-4 justify-center items-center">
              <StyledTouchableOpacity onPress={closeModal} className="bg-green-200 w-[150px] h-[35px] justify-center items-center rounded-md font-medium">
                <StyledText>Cancel</StyledText>
              </StyledTouchableOpacity>
              <StyledTouchableOpacity onPress={registerUser} className="bg-green-200 w-[150px] h-[35px] justify-center items-center rounded-md font-medium">
                <StyledText>Register</StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>
        </StyledView>
      )}

      {/* Modal para ingresar a una sala */}
      {showJoinInput && (
        <StyledView className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
          <StyledView className="rounded-2xl w-[450px] h-[250px] flex flex-col justify-center items-center gap-4">
            <StyledTextInput
              value={roomUUID}
              onChangeText={setRoomUUID}
              placeholder="Enter the room id"
              className="text-black w-[400px] text-center h-[40px] rounded-lg bg-slate-100"
            />
            <StyledTextInput
              value={userName}
              onChangeText={setUserName}
              placeholder="Enter Username"
              className="text-black w-[400px] text-center h-[40px] rounded-lg bg-slate-100"
            />

            <StyledView className="flex-row gap-4 justify-center items-center">
              <StyledTouchableOpacity onPress={closeModal} className="bg-green-200 justify-center items-center w-[150px] h-[35px] rounded-md font-medium">
                <StyledText>Cancel</StyledText>
              </StyledTouchableOpacity>
              <StyledTouchableOpacity onPress={JoinUser} className="bg-green-200 items-center justify-center w-[150px] h-[35px] rounded-md font-medium">
                <StyledText>Join</StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>
        </StyledView>
      )}

      {/* Error Message */}
      {error && <StyledText className="text-white">{error}</StyledText>}
    </StyledView>
  );
};

export default HomeView;
