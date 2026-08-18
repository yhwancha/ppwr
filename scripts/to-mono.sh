#!/usr/bin/env bash
# 이 repo(ppwr 단독)의 커밋을 restudio-mono/ppwr 로 이송한다.
#
#   front/**  ->  ppwr/front/**
#
# 디렉터리 복사가 아니라 커밋 단위 patch 적용이다.
# mono 에는 여기 없는 작업(모노레포 전용 설정·후속 심사 커밋)이 있어서
# 통째로 덮으면 회귀한다. MONO-SYNC.md 참고.
#
#   사용법: scripts/to-mono.sh mono-sync [mono-경로]
#     기준점은 mono-sync 태그 (MONO-SYNC.md 의 SYNC POINT). hash 는 쓰지 않는다.
#     <base>..HEAD 구간만 이송된다.
set -euo pipefail

BASE="${1:?사용법: scripts/to-mono.sh mono-sync [mono-경로]}"
MONO="${2:-/Users/ycha/Desktop/blast/restudio-mono}"
OUT="$(mktemp -d)"

SRC="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SRC"

# --relative=front : front/ 기준 상대경로로 patch 생성
git format-patch "${BASE}..HEAD" --relative=front -o "$OUT" >/dev/null
if ! ls "$OUT"/*.patch >/dev/null 2>&1; then
  echo "이송할 커밋 없음 (${BASE}..HEAD 가 비어있음)"; exit 0
fi

echo "== 이송 대상 =="
git log --oneline "${BASE}..HEAD" | cat
echo
echo "== mono: $MONO =="
cd "$MONO"
if [ -n "$(git status --porcelain)" ]; then
  echo "중단: mono 작업트리가 더럽다. 먼저 정리할 것."; exit 1
fi
echo "현재 브랜치: $(git branch --show-current)"
echo
# --directory=ppwr/front : 상대경로 앞에 다시 프리픽스를 붙인다
echo "다음을 실행하라 (3-way 로 충돌 표면화):"
echo "  cd $MONO && git am --3way --directory=ppwr/front $OUT/*.patch"
echo
echo "충돌 시:  git am --show-current-patch=diff  /  해결 후 git am --continue  /  포기는 git am --abort"
