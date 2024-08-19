interface KeyBindingsProps {
    text: string;
  }

export default function KeyBindings({ text }: KeyBindingsProps) {
  // className = "fixed top-36 w-56 text-right"
  
  return (
    <b className="bg-gray-100 rounded-md py-1 px-2 font-medium text-sm text-black text-opacity-50">
          {text}
    </b>
  );
}