export function getFirestoreErrorMessage(error: unknown, fallback: string): string {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? error.code
    : undefined;

  switch (code) {
    case 'permission-denied':
    case 'unauthenticated':
      return 'Firestore 접근 권한이 없습니다. Firebase Console에서 데이터베이스 보안 규칙을 확인하세요.';
    case 'unavailable':
    case 'deadline-exceeded':
      return '서버에 연결하지 못했습니다. 인터넷 연결을 확인한 뒤 다시 시도하세요.';
    case 'not-found':
      return '이 할 일은 이미 삭제되었습니다. 목록을 새로고침한 뒤 다시 시도하세요.';
    default:
      return fallback;
  }
}
