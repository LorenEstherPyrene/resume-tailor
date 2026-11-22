# 部署说明

## 前提

- 已安装 `git` 和 GitHub CLI `gh`。
- 已登录有权写入 `LorenEstherPyrene/resume-tailor` 的 GitHub 账号：

```bash
gh auth login
gh auth setup-git
```

## 一键部署

在工程根目录运行：

```bash
bash scripts/deploy.sh "更新说明"
```

脚本会：

1. 创建临时目录并克隆线上仓库。
2. 将本包的 `dist/` 同步到线上仓库的 `dist/`。
3. 将 `dist/` 再镜像到仓库根目录，供 GitHub Pages 使用。
4. 同步 `server.mjs`、启动脚本和交接文档。
5. 提交并推送 `main`。

部署后检查：

```bash
gh api repos/LorenEstherPyrene/resume-tailor/pages/builds/latest --jq '[.status,.commit] | @tsv'
```

公开网址：https://lorenestherpyrene.github.io/resume-tailor/

