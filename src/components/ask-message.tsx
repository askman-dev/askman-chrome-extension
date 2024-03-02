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

function AskMessage(props: AskMessageItem) {
  const { type, text, name } = props;
  let messageItem = <div>{text}</div>;

  // 根据不同的类型，渲染不同的内容
  switch (type) {
    case AskMessageType.TEXT:
      messageItem = <>{text}</>;
      break;
    case AskMessageType.CODE:
      messageItem = <AskCode code={text} />;
      break;
    default:
      break;
  }

  return (
    <div className={classNames(name === 'ai' ? 'text-gray-800 mb-2' : 'text-sky-600 mb-3', 'font-bold')}>
      {messageItem}
    </div>
  );
}

export default AskMessage;
