import { useEffect } from 'react';

export function usePreventOverflowHidden() {
  useEffect(() => {
    const html = document.documentElement;

    // 创建一个 MutationObserver 来监听 style 属性的变化
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'style') {
          // 如果检测到 overflow: hidden 或 padding-right，立即移除它们
          if (html.style.overflow === 'hidden' || html.style.paddingRight) {
            html.style.removeProperty('overflow');
            html.style.removeProperty('padding-right');
          }
        }
      });
    });

    // 开始观察
    observer.observe(html, {
      attributes: true,
      attributeFilter: ['style'],
    });

    // 清理函数
    return () => {
      observer.disconnect();
    };
  }, []);
}
