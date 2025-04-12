import { createStackNavigator } from "@react-navigation/stack";
import { StyledView } from "../shared/styled";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatsView from "../Views/Chats";
import HomeView from "../Views/Home";
import { createNativeStackNavigator } from '@react-navigation/native-stack';

export type RootStackParamList = {
    Home: undefined;
    Chat: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

const Navigation = () => {
    const insets = useSafeAreaInsets

    return (
        <StyledView className="w-full h-full">
            <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
                <Stack.Screen name='Home' component={HomeView} />
                <Stack.Screen name='Chat' component={ChatsView} />
            </Stack.Navigator>

        </StyledView>
    )
}

export default Navigation