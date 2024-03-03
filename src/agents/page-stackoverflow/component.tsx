import classNames from 'classnames';
interface ToolDropdownProps {
  className: string;
  onItemClick: (tool: PageActionButtonInterface) => void;
}

export interface PageActionButtonInterface {
  name: string;
  text: string;
}

export default function PageStackoverflowToolDropdown({ className, onItemClick }: ToolDropdownProps) {
  // className = "fixed top-36 w-56 text-right"
  return (
    <div
      className={classNames(
        `flex justify-between items-center  pl-[15px] rounded-md w-full bg-[hsl(43,50%,28%)] border-[hsl(43,50%,39%)] text-left font-medium text-[13px] text-[hsl(210,11%,98%)] border-1 mb-5 ${className}`,
      )}>
      <span>问那个人</span>
      <button
        className="m-2 mr-[15px] ws-nowrap s-btn s-btn__filled"
        onClick={() => {
          onItemClick({
            name: '总结',
            text: document.getElementById('mainbar').innerText,
          });
        }}>
        提问
      </button>
    </div>
  );
}
