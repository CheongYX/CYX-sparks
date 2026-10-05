import fm from 'front-matter';
import { marked } from 'marked';

marked.setOptions({ breaks: true });

// 自动读取 src/posts 目录下所有 .md 文件
const files = import.meta.glob('../posts/*.md', { eager: true, query: '?raw' });

const unsortedSparks = Object.entries(files).map(([filepath, module], index) => {
  const parsed = fm(module.default);
  const attrs = parsed.attributes;

  // 🌟 核心修复：拦截 Date 对象，强转为 YYYY-MM-DD 字符串
  let safeDate = attrs.date;
  if (attrs.date instanceof Date) {
    // 处理因为时区偏差导致日期往前跳一天的问题
    const offsetDate = new Date(attrs.date.getTime() - (attrs.date.getTimezoneOffset() * 60000));
    safeDate = offsetDate.toISOString().split('T')[0]; 
  }

  return {
    id: String(index + 1),
    frontmatter: {
      ...attrs,
      date: String(safeDate) // 确保传递给 React 的绝对是字符串
    },
    content: marked.parse(parsed.body)
  };
});

// 按照日期从新到旧自动排序
export const sparks = unsortedSparks.sort((a, b) => {
  return new Date(b.frontmatter.date) - new Date(a.frontmatter.date);
});