declare module 'virtual:reload-on-update-in-background-script' {
  export const reloadOnUpdate: (watchPath: string) => void;
  export default reloadOnUpdate;
}

declare module 'virtual:reload-on-update-in-view' {
  const refreshOnUpdate: (watchPath: string) => void;
  export default refreshOnUpdate;
}

declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.SFC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const content: string;
  export default content;
}
declare module '*/tools.toml' {
  const content: { name: string; hbs: string }[];
  export default content;
}

declare module '*/chat-presets.toml' {
  const content: { human: string; ai: string }[];
  export default content;
}

declare module '*/models.toml' {
  const content: {
    [provider: string]: {
      [key: string]: string | number | { name: string; max_tokens: number }[];
    };
  };
  export default content;
}

declare module 'monaco-editor/esm/vs/editor/editor.api' {
  export * from 'monaco-editor';
}
