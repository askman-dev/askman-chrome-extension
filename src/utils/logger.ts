import log from 'loglevel';

// 使用 import.meta.env 来判断环境
const isDev = import.meta.env.MODE === 'development';
log.setLevel(isDev ? 'debug' : 'error');

// 添加前缀
const originalFactory = log.methodFactory;
log.methodFactory = function (methodName, logLevel, loggerName) {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);
  
  return function (message, ...args) {
    rawMethod(`[Askman][${methodName.toUpperCase()}] ${message}`, ...args);
  };
};
log.setLevel(log.getLevel()); // 应用新的 factory

export const logger = log; 