/**
 * DO NOT USE import someModule from '...';
 *
 * @issue-url https://github.com/askman-dev/askman-chrome-extension/issues/160
 *
 * Chrome extensions don't support modules in content scripts.
 * If you want to use other modules in content scripts, you need to import them via these files.
 *
 */
import('@pages/content/ui/root');
import('highlight.js/styles/monokai.min.css')
