import classNames from 'classnames';

import Highlight from 'react-highlight';

interface IAskPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  visible?: boolean;
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
const DivWrapper = ({ className, iconChevronBottom, iconChevronBottomClassName }: DomProps) => {
  console.log(className, iconChevronBottom, iconChevronBottomClassName);
  return (
    <div>
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
function AskPanel(props: IAskPanelProps) {
  const { code, visible, ...rest } = props;

  return (
    <div
      className={classNames(
        'bg-white fixed  overflow-hidden shadow-lg rounded-md w-[473px] h-[155px] min-w-80 max-w-lg min-h-40',
        `${visible ? 'visible' : 'invisible'}`,
      )}
      {...rest}>
      <div className="font-semibold bg-white px-3 py-2">
        Ask That Man <Cancel className="!absolute !left-[433px] !top-[11px]" />
      </div>
      <div className="relative w-[481px] h-[163px] left-[-4px] bg-[url(/layout.png)] bg-cover bg-[50%_50%]">
        <Send
          className="!border-[unset] !border-[unset] !absolute !left-[388px] !bg-[#00000059] !top-[117px]"
          divClassName="!left-[11px] !top-[3px]"
          text="发送 ↵"
        />
        <DivWrapper
          className="!absolute !left-[313px] !top-[117px]"
          iconChevronBottom="image.png"
          iconChevronBottomClassName="!left-[40px] !top-[9px]"
        />
        <div className="w-[437px] h-[68px] top-[40px] left-[23px] overflow-hidden border-b [border-bottom-style:solid] border-[#0000004c] absolute rounded-[5px]">
          <div className="w-[351px] top-[41px] left-[2px] text-[#00000059] text-[14px] absolute [font-family:'Inter-Regular',Helvetica] font-normal tracking-[0] leading-[normal]">
            请输入问题或要求
          </div>
        </div>
      </div>
      <div className="px-3 py-2">
        <Highlight>{code}</Highlight>
      </div>
    </div>
  );
}

export default AskPanel;
