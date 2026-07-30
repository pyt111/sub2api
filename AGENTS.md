# 项目协作说明

## 分支边界

- `main` 只镜像 `Wei-Shaw/sub2api` 官方 `main`，禁止直接提交定制代码。
- `mali` 是长期定制和候选构建分支。
- `sync/upstream-*` 只用于把新的官方 Release 合入 `mali`。
- 功能开发从 `mali` 创建短分支，通过 PR 合并。

## 项目事实

- 后端位于 `backend/`，使用 Go；版本以 `backend/go.mod` 为准。
- 前端位于 `frontend/`，使用 Vue 3、TypeScript、Vite 和 pnpm。
- 前端依赖必须使用 `frontend/pnpm-lock.yaml`，不要改用 npm。
- 根目录 `Dockerfile` 会依次构建前端和 Go 后端。

## 验证命令

- 后端单元测试：`cd backend && make test-unit`
- 后端集成测试：`cd backend && make test-integration`
- 前端检查：`pnpm --dir frontend install --frozen-lockfile && make test-frontend`
- 完整镜像：`docker build -t sub2api-mali:local .`

## 修改规则

- 全程使用中文文档和注释。
- 新增生产依赖前必须先确认。
- 优先新增独立模块，减少直接改动官方公共文件。
- 每项定制保持单一职责，并同步记录到 `.mali/README.md`。
- 不提交密钥、运行数据、账号信息或生产配置。
