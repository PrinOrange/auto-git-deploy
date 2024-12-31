# AUTO-GIT-DEPLOY

—— 自动拉取 Github 远程仓库更新并部署。

**NOTE: 本项目目前在 Alpha 测试阶段，请勿在生产环境中使用。**

> 试想一个场景：你从 Github 的远程仓库上 Clone 了一个前端项目到自己的服务器上部署（如 next.js）。但是，每次修改仓库中的代码时，你都必须重新登录服务器，在服务器的本地仓库上拉取更新、再重新构建部署的繁琐步骤。

所以本项目就致力于解决这个问题，它会当你的 Github 仓库代码更新后，不必再手动登录到服务器拉取更新、重新构建、重新部署。

而是会向你的服务器发送通知，让服务器自动从 github 上拉取更新，并自动重新构建、部署流程，让你服务器中的项目时刻与 Github 上的仓库保持更新，省去人工操作流程。

在项目开始之前，你需要具备以下知识：

+ 有一定的 Linux 运维操作基础
+ 熟悉 SSL、反向代理的配置

本项目以来的消息通知机制是 Github Webhook。

[Github Webhook](https://docs.github.com/en/webhooks/about-webhooks) 是 Github 提供的一种消息通知机制，允许在仓库发生更新（如 `push` 或 `merge` 操作）时，将更新信息发送到指定的地址。

简单来说，当你为一个 API（例如 `https://example.com/webhook`）配置 Webhook 后，Github 会在你的仓库发生变化时，向这个地址发送一个 POST 请求，通知你更新详情。

举个例子，假设你在 Github 上有一个仓库：`https://github.com/YourAccount/your-repo.git`，并为它配置了 Webhook 地址为 `https://example.com/webhook`。  
当你对这个仓库执行 `push`、`merge` 等操作时，Github 会自动向 `https://example.com/webhook` 发送一个通知，告知 `YourAccount/your-repo` 仓库发生了更新。

## 快速开始

我们以 next.js 项目为例。我有一个仓库 test-repo，里面是一个 next.js 程序。

在开始之前，我们首先要对监听的仓库申请 Github Webhook。首先在 Github 上转到要监听的仓库，点击 Settings 选项卡，Webhook 选项卡，再点击 Add Webhook 来添加 Webhook. 如图所示

![](https://raw.githubusercontent.com/codemetic/pictures-host/main/images1735402197185.webp)

然后填写如下 Github Webhook 信息。注意：Payload URL 中的域名填写你自己的域名。Secret 字段用于验证 Webhook 来源，在这里假设你的 Secret 为 "yoursecret"。这里假设你的域名为 example.com。其他字段按下图填写即可。在这里，我们只监听仓库的 push 更新事件。

![](https://raw.githubusercontent.com/codemetic/pictures-host/main/images20241229001440.webp)

首先安装依赖（推荐全局安装）

```bash
npm i auto-git-deploy --save-dev # or
npm i auto-git-deploy -g --save-dev
```

然后转到你的 next.js 项目的根目录，初始化配置项

```bash
autodeploy init
```

程序会自动在目录下生成 `autodeploy.config.json` 配置文件：

```json
{
  "PORT": 3300,
  "COMMANDS": [],
  "SECRET": null
}
```

其中的 `secret` 字段填入刚才所设置的 “yoursecret”，`command` 字段为拉取到 Github 更新后，依次执行的命令操作。在这里，即重新安装依赖、重新构建再部署。

然后执行，

```bash
autodeploy
```

它会首先执行一遍 `actions` 里的命令序列。执行完后会提示如下信息：

```plaintext
Server started at http://localhost:3300
```

然后再利用反向代理软件（如 nginx），将 https://example.com/webhook 映射到 http://localhost:3300。
