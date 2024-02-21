import classNames from 'classnames';
import Highlight from 'react-highlight';

interface IAskPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  visible?: boolean;
}

function AskPanel(props: IAskPanelProps) {
  const { code, visible, ...rest } = props;

  return (
    <div
      className={classNames(
        'bg-white fixed  overflow-hidden shadow-lg rounded-md w-[473px] h-[155px] min-w-80 max-w-lg min-h-40',
        `${visible ? 'visible' : 'invisible'}`,
      )}
      {...rest}>
      <div className="font-semibold text-white bg-indigo-500 px-3 py-2">
        Ask That Man <button className={classNames('text-white py-2 px-4 float-right')}>隐藏</button>
      </div>
      <div className="px-3 py-2">
        <Highlight>{code}</Highlight>
      </div>
    </div>
  );
}

export default AskPanel;
