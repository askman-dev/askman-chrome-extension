import Highlight from 'react-highlight';
import 'highlight.js/styles/default.min.css';

interface AskCodeProps {
  code: string;
}

function AskCode(props: AskCodeProps) {
  const { code } = props;

  if (!code || code.trim() === '') {
    return null;
  }

  return (
    <div className="rounded-md bg-gray-100 p-2">
      <Highlight className="json">{code}</Highlight>
    </div>
  );
}

export default AskCode;
