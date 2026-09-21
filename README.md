# IELTS Study Pad

一个适合 iPad Safari 的 IELTS 词汇手写练习 PWA。界面按照参考图做成“中文释义 + 英文填空格”的表格，每行都可以使用 Apple Pencil 随手写，也可以切换到保留真实笔迹的 OCR 模式。

## 使用

1. 在电脑上启动静态服务器：`node -e "..."` 或使用任意静态文件服务器。
2. 当前开发预览地址：`http://127.0.0.1:4173/`。
3. 如果要用 iPad 访问，让服务器监听 `0.0.0.0`，并在 iPad Safari 打开电脑在同一 Wi-Fi 下的局域网地址，然后通过“添加到主屏幕”安装。
4. 选择初级、中级或高级，默认练习方向是“看中文释义，手写英文单词”。
5. “随手写”模式适合 Apple Pencil Scribble；“保留笔迹”模式会在画布中保留笔画，点击“识别”后使用英文 OCR。

## OCR 说明

OCR 模式首次使用会从 jsDelivr 加载 Tesseract.js 和英文识别模型，需要网络。识别置信度低于 78% 时会标记为“请确认识别”，不会直接判错。OCR 失败时原笔迹仍然保留，可以直接在输入框修正。

## 导入完整词库

页面内置一组可立即体验的样例词卡，并显示三级累计目标：初级 2,000、中级 4,500、高级约 8,500。点击首页“导入词包”可替换为完整词库。

JSON 最小格式：

```json
[
  {"word":"ocean","meaning":"海洋；大海","level":"beginner","phonetic":"/ˈəʊʃən/","tags":["geography"],"example":"The ocean covers most of the Earth's surface."}
]
```

CSV 表头：`word,meaning,level,phonetic,tags,example`。`level` 只能使用 `beginner`、`intermediate` 或 `advanced`。完整示例见 `vocabulary-template.csv`。

## 验证

- 单元测试：`npm test`
- 语法检查：`node --check src/app.js`、`node --check sw.js`
- PWA 壳缓存页面资源；OCR 模型只在第一次识别时按需加载。
