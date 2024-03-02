import classNames from 'classnames';
interface ToolDropdownProps {
  className: string;
  onItemClick: (tool: PageActionButtonInterface) => void;
}

export interface PageActionButtonInterface {
  name: string;
  text: string;
}

export default function PageGithubReadmeToolDropdown({ className, onItemClick }: ToolDropdownProps) {
  // className = "fixed top-36 w-56 text-right"
  return (
    <div className={classNames(`mr-1 ${className}`)}>
      <button
        onClick={() => {
          onItemClick({
            name: '总结',
            text: document.getElementsByTagName('article')[0].innerText,
          });
        }}>
        总结
      </button>
    </div>
  );
}
