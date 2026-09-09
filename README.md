# Shadcn 管理后台

基于 Shadcn 和 Vite 打造的管理后台 UI，注重响应式设计和无障碍访问。

![alt text](public/images/shadcn-admin.png)

[![Sponsored by Clerk](https://img.shields.io/badge/Sponsored%20by-Clerk-5b6ee1?logo=clerk)](https://go.clerk.com/GttUAaK)

我在工作和个人项目中创建了很多管理后台 UI，一直想做一套可复用的后台 UI 组件集合供未来项目使用，现在终于实现了。虽然我自己创建了一些自定义组件，但部分代码直接改编自 ShadcnUI 官方示例。

> 注意：这不是一个起始项目（模板），未来可能会做一个。

## 功能特性

- 🌓 亮色/暗色模式
- 📱 响应式设计
- ♿ 无障碍访问
- 📁 内置侧边栏组件
- 🔍 全局搜索命令
- 📄 10+ 页面
- 🧩 额外自定义组件
- 🔄 RTL（从右到左）支持

<details>
<summary>自定义组件说明（点击展开）</summary>

本项目使用 Shadcn UI 组件，但部分组件为了更好地支持 RTL（从右到左）和其他改进做了轻微修改。这些自定义组件与原版 Shadcn UI 有所不同。

如果你想通过 Shadcn CLI 更新组件（例如 `npx shadcn@latest add <component>`），对于未自定义的组件通常是安全的。对于下面列出的自定义组件，你可能需要手动合并更改，以保留项目的修改并避免覆盖 RTL 支持或其他更新。

> 如果你不需要 RTL 支持，可以放心通过 Shadcn CLI 更新"RTL 更新组件"，因为这些更改主要是为了 RTL 兼容性。"已修改组件"可能有其他需要考虑的自定义内容。

### 已修改组件

- scroll-area（滚动区域）
- sonner（通知提示）
- separator（分隔线）

### RTL 更新组件

- alert-dialog（警告对话框）
- calendar（日历）
- command（命令面板）
- dialog（对话框）
- dropdown-menu（下拉菜单）
- select（选择器）
- table（表格）
- sheet（抽屉）
- sidebar（侧边栏）
- switch（开关）

**说明：**

- **已修改组件**：这些组件有通用更新，可能包括 RTL 调整。
- **RTL 更新组件**：这些组件有专门针对 RTL 语言支持的更改（如布局、定位）。
- 实现细节请查看 `src/components/ui/` 目录下的源文件。
- 项目中所有其他 Shadcn UI 组件都是标准版本，可以安全地通过 CLI 更新。

</details>

## 技术栈

| 类别 | 技术 |
|------|------|
| **UI 框架** | [ShadcnUI](https://ui.shadcn.com)（TailwindCSS + RadixUI） |
| **构建工具** | [Vite](https://vitejs.dev/) |
| **路由** | [TanStack Router](https://tanstack.com/router/latest) |
| **类型检查** | [TypeScript](https://www.typescriptlang.org/) |
| **代码规范** | [ESLint](https://eslint.org/) & [Prettier](https://prettier.io/) |
| **图标** | [Lucide Icons](https://lucide.dev/icons/)、[Tabler Icons](https://tabler.io/icons)（仅品牌图标） |
| **认证（部分）** | [Clerk](https://go.clerk.com/GttUAaK) |

## 本地运行

克隆项目

```bash
git clone https://github.com/satnaing/shadcn-admin.git
```

进入项目目录

```bash
cd shadcn-admin
```

安装依赖

```bash
pnpm install
```

启动开发服务器

```bash
pnpm run dev
```

## 赞助本项目 ❤️

如果你觉得这个项目有帮助，或者在自己的工作中使用了它，欢迎[赞助我](https://github.com/sponsors/satnaing)以支持开发和维护。你也可以[请我喝杯咖啡](https://buymeacoffee.com/satnaing)。不用担心，每一分钱都有帮助。谢谢！🙏

如有问题或赞助咨询，请随时联系 [satnaingdev@gmail.com](mailto:satnaingdev@gmail.com)。

### 当前赞助商

- [Clerk](https://go.clerk.com/GttUAaK) - 现代 Web 的身份认证和用户管理

## 作者

由 [@satnaing](https://github.com/satnaing) 用 🤍 打造

## 许可证

基于 [MIT 许可证](https://choosealicense.com/licenses/mit/) 开源
