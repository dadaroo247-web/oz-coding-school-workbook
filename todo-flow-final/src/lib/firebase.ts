import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Next.js가 브라우저 번들에 포함할 수 있도록 환경 변수는 정적으로 참조합니다.
// 실제 값은 .env.local.example을 복사한 .env.local에서만 설정하세요.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const hasConfiguration = Object.values(firebaseConfig).every(
  (value) => typeof value === 'string' && value.trim().length > 0,
);

let database: Firestore | null = null;
let configurationError: string | null = null;

if (!hasConfiguration) {
  configurationError = 'Firebase 설정이 필요합니다. README의 연결 방법에 따라 .env.local을 설정한 뒤 서버를 다시 시작하세요.';
} else {
  try {
    // HMR에서 기본 앱을 중복 생성하지 않습니다.
    const app = getApps().some((app) => app.name === '[DEFAULT]')
      ? getApp()
      : initializeApp(firebaseConfig);
    database = getFirestore(app);
  } catch {
    configurationError = 'Firebase를 초기화하지 못했습니다. .env.local의 설정값을 확인한 뒤 서버를 다시 시작하세요.';
  }
}

// 설정 전에도 페이지를 열거나 빌드할 수 있고, 실제 DB 작업만 비활성화됩니다.
export const db = database;
export const firebaseConfigurationError = configurationError;
