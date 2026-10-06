# 원본 저장소 백업

`git-bundles`에는 원본 저장소 6개의 모든 브랜치·태그·커밋을 보관했습니다.

복원 예시:

```bash
git clone git-bundles/javascript-assignment.bundle javascript-assignment-restored
```

`branches`에는 main 이외 브랜치의 파일을 직접 열어볼 수 있도록 보관했습니다. 브랜치별 경로는 [branches.json](./branches.json)에 있습니다.

Git 백업은 이슈, PR 대화, 저장소 설정, GitHub Pages 배포를 복원하지 않습니다.
