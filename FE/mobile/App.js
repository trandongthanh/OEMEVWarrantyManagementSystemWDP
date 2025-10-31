import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import Toast from "react-native-toast-message";
import { AuthProvider } from './src/hooks/useAuth';
export default function App() {
  return (
    <>
    <AuthProvider>
      <AppNavigator />
      <Toast />
    </AuthProvider>
      
    </>
  );
}
