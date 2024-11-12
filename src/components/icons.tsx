interface KeyBindingProps {
  text: string;
  className?: string;
  onClick?: () => void;
}

function KeyBinding({ text, className = '', onClick }: KeyBindingProps) {
  return (
    <b
      className={`bg-gray-100 rounded-md py-1 px-2 font-medium text-sm text-black text-opacity-50 ${className}`}
      onClick={onClick}>
      {text}
    </b>
  );
}

export default KeyBinding;
