import classNames from 'classnames';
import AskCode from './ask-code';

export enum AskMessageType {
  TEXT = 'text',
  IMAGE = 'image',
  CODE = 'code',
}

interface AskMessageItem {
  type: AskMessageType | string;
  text: string;
  name?: string;
}

const TextWithLineBreaks = text => {
  let quoteStart = false;
  let quoteText = '';
  // console.log('text', text, 'lines', text.split('\n'));
  // 先解决 quote 的格式

  return (
    <div>
      {text.split('\n').map((line, idx) => {
        if (!quoteStart && line.startsWith('> [!QUOTE')) {
          quoteStart = true;
          return;
        }
        if (quoteStart && !quoteText) {
          quoteText = '引用 ' + line.replace('> ', '');
          return (
            <b key={`${idx}-${line}`}>
              {quoteText}
              <br />
            </b>
          );
        }
        if (quoteStart && line.startsWith('>')) {
          return;
        } else {
          quoteStart = false;
        }
        // console.log('quoteEnd, line content is ', line);
        return (
          <span key={`${idx}-${line}`}>
            {line}
            <br />
          </span>
        );
      })}
    </div>
  );
};
function AskMessage(props: AskMessageItem) {
  const { type, text, name } = props;
  let messageItem = <div>{text}</div>;

  // 根据不同的类型，渲染不同的内容
  switch (type) {
    case AskMessageType.TEXT:
      messageItem = <>{TextWithLineBreaks(text)}</>;
      break;
    case AskMessageType.CODE:
      messageItem = <AskCode code={text} />;
      break;
    default:
      break;
  }

  return (
    <div className={classNames(name === 'ai' ? 'text-gray-800 mb-3' : 'text-sky-600 mb-2', 'font-bold')}>
      {messageItem}
    </div>
  );
}

export default AskMessage;
