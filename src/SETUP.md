# Hướng dẫn thiết lập - Phase 1: Xác thực (Authentication)

## File đã tạo

1. src/screens/LoginScreen.tsx - Màn hình đăng nhập
2. src/screens/HomeScreen.tsx - Trang chủ sau đăng nhập
3. src/App.tsx - Cấu hình routing
4. package.json - Dependencies

## Cài đặt môi trường

npm install

## Cấu hình Firebase

1. Tạo project trên Firebase Console
2. Enable Email/Password auth
3. Thêm config file cho Android/iOS
4. Configure Firestore

## Chạy ứng dụng

npm run android   # Android
npm run ios       # iOS
npm run web       # Web

## Tính năng Phase 1

✓ Đăng nhập Email/Password
✓ Trang chủ với thông tin user
✓ Đăng xuất
✓ Auto routing theo auth state

## Chuẩn bị cho Phase 2

- Database Migration (Firestore)
- User Profile Management
- Chat Feature (Gemini API)
