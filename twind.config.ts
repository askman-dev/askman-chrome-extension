import { defineConfig } from '@twind/core';
import presetTailwind from '@twind/preset-tailwind';
import presetAutoprefix from '@twind/preset-autoprefix';

// TODO 解决网页默认字号不是 12 的问题 https://stackoverflow.com/questions/76512129/how-to-change-the-default-padding-scale-from-rem-to-px
// https://twind.dev/migration-guides/tailwind.html
// https://design2tailwind.com/blog/change-tailwindcss-base-font-size/
// TODO 编译成常量
function rem2px(theme, baseFontSize = 14) {
  const json = JSON.stringify(theme);
  const newJson = json.replace(/((\d+\.)?\d+)(rem)/g, (match, p1) => {
    return `${(p1 * baseFontSize).toFixed(2)}px`;
  });
  const newTheme = JSON.parse(newJson);
  // console.info('new theme', newTheme)
  return newTheme;
}

const defaultConfig = defineConfig({
  hash: false,
  presets: [presetAutoprefix(), presetTailwind()],
  theme: {
    maxWidth: {
      lg: '32rem',
    },
  },
});
// console.log(defaultConfig.theme)
export default defineConfig({
  presets: [presetAutoprefix(), presetTailwind()],
  theme: rem2px(defaultConfig.theme),
});
