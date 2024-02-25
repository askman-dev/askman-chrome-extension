import classNames from 'classnames';

import Highlight from 'react-highlight';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { QuoteAgent, QuoteContext } from '../agents/quote';
import { myObject } from '../agents/llm';
import React from 'react';

interface IAskPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  visible?: boolean;
  quotes?: Array<Promise<QuoteContext>>;
}
interface DomProps {
  className?: string;
  divClassName?: string;
  text?: string;
  iconChevronBottom?: string;
  iconChevronBottomClassName?: string;
}

export const Send = ({ className, divClassName, text = '解释 ↵' }: DomProps): JSX.Element => {
  return (
    <div className={`relative w-[69px] h-[25px] bg-black rounded-[5px] border border-solid border-black ${className}`}>
      <div
        className={`absolute top-[2px] left-[10px] [font-family:'Inter-Regular',Helvetica] font-normal text-white text-[14px] text-right tracking-[0] leading-[normal] ${divClassName}`}>
        {text}
      </div>
    </div>
  );
};
const ToolBtn = ({ className, iconChevronBottom, iconChevronBottomClassName }: DomProps) => {
  console.log(className, iconChevronBottom, iconChevronBottomClassName);
  return (
    <div className={`${className}`}>
      <div>工具</div>
    </div>
  );
};

interface CancelProps {
  className: string;
}
const Cancel = ({ className }: CancelProps): JSX.Element => {
  return (
    <div className={classNames(`relative w-[24px] h-[15px] ${className}`)}>
      <div className="absolute -top-px left-0 [text-shadow:0px_4px_4px_#00000040] [font-family:'Inter-Regular',Helvetica] font-normal text-[#0000008c] text-[12px] text-right tracking-[0] leading-[normal]">
        隐藏
      </div>
    </div>
  );
};

interface QuoteComponentProps {
  quotePromise: Promise<QuoteContext>;
}
/**
 * Represents a component that displays a quote.
 */
class QuoteComponent extends React.Component<QuoteComponentProps> {
  state = {
    isLoading: true,
    data: null as null | QuoteContext,
  };

  constructor(props: QuoteComponentProps) {
    super(props);
    props.quotePromise.then(value => {
      this.setState({
        isLoading: false,
        data: value,
      });
    });
  }

  componentDidMount() {
    this.setState({ isLoading: true });
  }

  render() {
    if (this.state.isLoading) {
      return (
        <div className="border-l border-black">
          <div className="text-black text-xs font-normal px-2">
            {'const { OpenAI } = require("@langchain/openai");'}
          </div>
        </div>
      );
    }

    return (
      <div className="border-l border-black">
        <div className="text-black text-xs font-normal px-2">{this.state.data?.selection}</div>
      </div>
    );
  }
}

function AskPanel(props: IAskPanelProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { code, visible, quotes, ...rest } = props;
  React.useEffect(() => {
    if (quotes && quotes.length) {
      Promise.all(quotes).then(quoteContexts => {
        // 所有的 quotes 都准备好了，可以执行相应的操作
        console.log(quoteContexts);
        myObject.askWithQuotes(quoteContexts, '解释');
      });
    }
  }, [quotes]);

  // myObject.test('你是谁');

  return (
    <div
      className={classNames(
        'bg-white fixed  overflow-hidden border-2 border-solid rounded-md w-[473px] min-w-80 max-w-lg min-h-[155px]',
        `${visible ? 'visible' : 'invisible'}`,
      )}
      {...rest}>
      <div className="font-semibold bg-white px-3 py-2">
        Ask That Man <Cancel className="!absolute !left-[433px] !top-[11px]" />
      </div>
      <div className="px-3 py-2">
        <Highlight>{code}</Highlight>
      </div>

      <div className="relative w-[481px] left-[-4px] bg-[url(/layout.png)] bg-cover bg-[50%_50%]">
        <div className="w-full relative flex-col justify-start items-start inline-flex text-left px-2">
          {quotes && quotes.map((quote, index) => <QuoteComponent key={index} quotePromise={quote} />)}
        </div>
        <div className="w-full h-[68px] overflow-hidden p-3">
          <textarea
            className="rounded border-solid border border-b [border-bottom-style:solid] border-[#0000004c] rounded-[5px] text-[#00000095] text-[14px] w-full h-full [font-family:'Inter-Regular',Helvetica] font-normal tracking-[0] leading-[normal]"
            placeholder="请输入问题或要求"></textarea>
        </div>
        <div className="w-full h-25">
          <Send
            className="float-right !border-[unset] !border-[unset] !bg-[#00000059]"
            divClassName="!left-[11px] !top-[3px]"
            text="发送 ↵"
          />
          <ToolBtn
            className="float-right"
            iconChevronBottom="image.png"
            iconChevronBottomClassName="!left-[40px] !top-[9px]"
          />
        </div>
      </div>
    </div>
  );
}

export default AskPanel;
