// services/session.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SessionService = {
  async saveUser(userData) {
    await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
  },
  async getStoredUser() {
    const userJson = await AsyncStorage.getItem('@user_data');
    return userJson ? JSON.parse(userJson) : null;
  },
  async logout() {
    await AsyncStorage.removeItem('@user_data');
  }
};