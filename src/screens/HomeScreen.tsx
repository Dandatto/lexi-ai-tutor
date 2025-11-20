import React from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import auth from '@react-native-firebase/auth';

const HomeScreen = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.replace('Login');
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
    }
  };

  const currentUser = auth().currentUser;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trang chủ</Text>
      {currentUser && (
        <View style={styles.userInfo}>
          <Text style={styles.userText}>Email: {currentUser.email}</Text>
          <Text style={styles.userText}>User ID: {currentUser.uid}</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Những tính năng chính</Text>
        <FlatList
          data={[
            { id: '1', name: 'Chủ đề học' },
            { id: '2', name: 'Kiểm tra' },
            { id: '3', name: 'Sổ tập' }
          ]}
          renderItem={({ item }) => (
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>{item.name}</Text>
            </View>
          )}
          keyExtractor={item => item.id}
        />
      </View>
      <View style={styles.logoutButton}>
        <Button title="Đăng xuất" color="#d9534f" onPress={handleLogout} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  userInfo: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 20 },
  userText: { fontSize: 14, marginBottom: 4 },
  content: { flex: 1, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  featureItem: { backgroundColor: '#fff', padding: 12, marginBottom: 8, borderRadius: 6 },
  featureText: { fontSize: 16 },
  logoutButton: { marginTop: 'auto' }
});

export default HomeScreen;
