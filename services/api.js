// services/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// CAMBIA ESTA IP POR LA TUYA
const API_URL = 'http://192.168.110.167/api-expo';

export const AuthService = {
  async login(credentials) {
    try {
      console.log('🔐 Enviando login a:', `${API_URL}/login.php`);
      
      const response = await fetch(`${API_URL}/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        return {
          success: false,
          message: `Error del servidor: ${response.status}`
        };
      }

      const data = await response.json();
      
      // Guardar usuario en AsyncStorage si login es exitoso
      if (data.success && data.user) {
        await AsyncStorage.setItem('@user_data', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error en login:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  },

  async getStoredUser() {
    try {
      const userJson = await AsyncStorage.getItem('@user_data');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  },

  async logout() {
    try {
      await AsyncStorage.removeItem('@user_data');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  }
};