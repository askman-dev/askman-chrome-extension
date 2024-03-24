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
        'py-1 px-3 mr-2 font-medium rounded-md focus:outline-none cursor-pointer text-sky-600 border-1 border-solid border-black',
        `${visible ? 'visible' : 'invisible'}`,
        primary && 'cursor-pointer bg-black text-white',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      {...rest}>
      {children}
    </button>
  );
}

export default AskButton;
