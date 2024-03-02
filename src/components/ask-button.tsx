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
        'py-1 px-3 text-sm font-bold rounded focus:outline-none cursor-pointer text-blue-500 border-1 border-solid border-blue-500',
        `${visible ? 'visible' : 'invisible'}`,
        primary && 'border-none bg-blue-500 text-white focus:bg-blue-700',
        disabled && 'cursor-not-allowed opacity-50 focus:bg-blue-700',
        className,
      )}
      {...rest}>
      {children}
    </button>
  );
}

export default AskButton;
