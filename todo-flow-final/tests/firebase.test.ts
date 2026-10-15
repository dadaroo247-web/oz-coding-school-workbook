import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  initializeApp: vi.fn(),
  getApp: vi.fn(),
  getApps: vi.fn(),
  getFirestore: vi.fn(),
}));

vi.mock('firebase/app', () => ({
  initializeApp: mocks.initializeApp,
  getApp: mocks.getApp,
  getApps: mocks.getApps,
}));
vi.mock('firebase/firestore', () => ({ getFirestore: mocks.getFirestore }));

// These are synthetic test values. No test connects to a Firebase project.
const testEnvironment = {
  NEXT_PUBLIC_FIREBASE_API_KEY: 'test-api-key',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'test-project.firebaseapp.com',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test-project',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'test-project.firebasestorage.app',
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '123456789',
  NEXT_PUBLIC_FIREBASE_APP_ID: 'test-app-id',
};

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
  Object.entries(testEnvironment).forEach(([key, value]) => vi.stubEnv(key, value));
  mocks.getApps.mockReturnValue([]);
  mocks.initializeApp.mockReturnValue({ name: '[DEFAULT]' });
  mocks.getFirestore.mockReturnValue({ testDatabase: true });
});

afterEach(() => vi.unstubAllEnvs());

describe('Firebase 설정 안전 처리 (SDK mock)', () => {
  it('필수 설정이 빠져도 앱을 초기화하거나 오류를 던지지 않는다', async () => {
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_API_KEY', undefined);
    const firebase = await import('@/lib/firebase');
    expect(firebase.db).toBeNull();
    expect(firebase.firebaseConfigurationError).toMatch(/\.env\.local/);
    expect(mocks.initializeApp).not.toHaveBeenCalled();
    expect(mocks.getFirestore).not.toHaveBeenCalled();
  });

  it('모든 설정이 있으면 해당 설정으로 Firestore를 초기화한다', async () => {
    const firebase = await import('@/lib/firebase');
    expect(mocks.initializeApp).toHaveBeenCalledWith({
      apiKey: 'test-api-key', authDomain: 'test-project.firebaseapp.com',
      projectId: 'test-project', storageBucket: 'test-project.firebasestorage.app',
      messagingSenderId: '123456789', appId: 'test-app-id',
    });
    expect(firebase.db).toEqual({ testDatabase: true });
    expect(firebase.firebaseConfigurationError).toBeNull();
  });

  it('이미 초기화된 기본 Firebase 앱을 재사용한다', async () => {
    const existingApp = { name: '[DEFAULT]', existing: true };
    mocks.getApps.mockReturnValue([existingApp]);
    mocks.getApp.mockReturnValue(existingApp);
    await import('@/lib/firebase');
    expect(mocks.initializeApp).not.toHaveBeenCalled();
    expect(mocks.getFirestore).toHaveBeenCalledWith(existingApp);
  });

  it('SDK 초기화 실패를 설정 안내로 전환한다', async () => {
    mocks.initializeApp.mockImplementation(() => { throw new Error('Invalid test config'); });
    const firebase = await import('@/lib/firebase');
    expect(firebase.db).toBeNull();
    expect(firebase.firebaseConfigurationError).toMatch(/초기화하지 못했습니다/);
  });
});
