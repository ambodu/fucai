#!/bin/bash
# ===========================================
# FC3D 每日数据同步脚本
# 配合 crontab 使用
#
# 使用方法:
#   chmod +x scripts/cron-sync.sh
#
# crontab 配置 (每天北京时间 21:45 执行):
#   45 13 * * * /path/to/cai-shu-tong/scripts/cron-sync.sh
#   (UTC 13:45 = 北京时间 21:45)
#
# 或者使用 TZ 变量:
#   45 21 * * * TZ=Asia/Shanghai /path/to/cai-shu-tong/scripts/cron-sync.sh
# ===========================================

# 项目目录（修改为实际部署路径）
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="${PROJECT_DIR}/logs"
LOG_FILE="${LOG_DIR}/sync-$(date +%Y%m%d).log"

# 确保日志目录存在
mkdir -p "$LOG_DIR"

echo "===== Sync started at $(date -u '+%Y-%m-%d %H:%M:%S UTC') =====" >> "$LOG_FILE"

# 执行增量同步
cd "$PROJECT_DIR"
npx tsx scripts/sync-fc3d.ts >> "$LOG_FILE" 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "===== Sync completed successfully =====" >> "$LOG_FILE"
else
  echo "===== Sync failed with exit code $EXIT_CODE =====" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"

# 清理 30 天前的日志
find "$LOG_DIR" -name "sync-*.log" -mtime +30 -delete 2>/dev/null

exit $EXIT_CODE
