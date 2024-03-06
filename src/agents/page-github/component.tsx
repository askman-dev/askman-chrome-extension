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
    <div className={classNames(`askman-chrome-extension-content-action-button-wrap mr-1 ${className}`)}>
      <button
        className="text-sm p-1.5 rounded-sm hover:bg-gray-100"
        onClick={() => {
          onItemClick({
            name: '总结',
            text: document.getElementsByTagName('article')[0].innerText,
          });
        }}>
        问那个人
      </button>
    </div>
  );
}