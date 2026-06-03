#!/usr/bin/env bash
# TEMP (Phase 17 P03): external half of the cross-vendor quórum (Gemini + DeepSeek)
# for every nv-* temp variant in tests/fixtures/_nuevas-pilot-17.json.
# --write mutates validation.passes[] in place. Logged to /tmp for monitoring.
set -u
cd "$(dirname "$0")/.."
LOG=/tmp/quorum-ext-17.log
: > "$LOG"
IDS=$(node -e "const d=require('./tests/fixtures/_nuevas-pilot-17.json'); console.log(d.exercises.map(e=>e.id).join(' '))")
n=0
total=$(echo "$IDS" | wc -w | tr -d ' ')
for id in $IDS; do
  n=$((n+1))
  echo "[$n/$total] $id — gemini" | tee -a "$LOG"
  node scripts/validate-ai-pass.mjs "$id" --model=gemini-2.5-flash --fallback=deepseek-chat --write >>"$LOG" 2>&1
  echo "[$n/$total] $id — deepseek" | tee -a "$LOG"
  node scripts/validate-ai-pass.mjs "$id" --model=deepseek-chat --avoid=gemini-2.5-flash --write >>"$LOG" 2>&1
done
echo "EXTERNAL_QUORUM_DONE" | tee -a "$LOG"
