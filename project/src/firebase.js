// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // 👈 [필수] db 객체 임포트
// import { getStorage } from "firebase/storage"; // 파일 업로드 시 필요

// 🚨🚨🚨 고객님의 실제 Firebase 설정 값을 여기에 입력해야 합니다. 🚨🚨🚨
const firebaseConfig = {
    apiKey: "AIzaSyCMxM2V1z0o3jzwFxt-Udyd0b6cl_a7_i0",
    authDomain: "github-bf29a.firebaseapp.com",
    projectId: "github-bf29a",
    storageBucket: "github-bf29a.firebasestorage.app",
    messagingSenderId: "105189502557",
    appId: "1:105189502557:web:14ed99e5faa1b201b1a7b4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); 
export const db = getFirestore(app); // 👈 [필수] db 객체 내보내기

// export const storage = getStorage(app); // 파일 업로드 시 필요