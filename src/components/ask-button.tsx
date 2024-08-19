import classNames from 'classnames';

interface AskButtonProps extends React.DOMAttributes<HTMLButtonElement>, React.HTMLAttributes<HTMLButtonElement> {
  visible?: boolean;
  primary?: boolean;
  disabled?: boolean;
  children?: React.ReactNode | string;
}

function AskButton(props: AskButtonProps) {
  const { visible = true, primary = false, className, disabled = false, children, ...rest } = props;

  return (
    <button
      className={classNames(
        'py-1 px-3 font-medium rounded-md focus:outline-none cursor-pointer text-black border-gray-300',
        `${visible ? 'visible' : 'invisible'}`,
        primary && 'cursor-pointer',
        disabled && 'cursor-not-allowed opacity-50',
        className,
        'hover:bg-gray-300'
      )}
      {...rest}>
      {children}
    </button>
  );
}

export default AskButton;
