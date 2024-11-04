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
        `flex justify-between items-center  pl-[15px] rounded-md w-full bg-[hsl(43,50%,28%)] border-solid border-[hsl(43,50%,39%)] text-left font-medium text-[13px] text-[hsl(210,11%,98%)] border-1 mb-5 ${className}`,
      )}>
      <span>Askman</span>
      <button
        className="m-2 mr-[15px] rounded-lg ws-nowrap p-2 pl-4 pr-4 bg-[#90C4F9] text-black"
        onClick={() => {
          onItemClick({
            name: 'Summarize',
            text: document.getElementById('mainbar').innerText,
          });
        }}>
        提问
      </button>
    </div>
  );
}
