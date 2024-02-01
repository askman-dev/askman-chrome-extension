import classNames from "classnames"
import Highlight from 'react-highlight'

interface IAskPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    code: string,
    visible?: boolean,
}

function AskPanel(props: IAskPanelProps) {
    const { code, visible, ...rest } = props

    return (
        <div className={classNames("bg-white fixed overflow-hidden shadow-lg rounded-md min-w-80 max-w-lg min-h-40 -translate-x-full -translate-y-full",
            `${visible ? 'visible' : 'invisible'}`)}
            {...rest}
        >   
            <div className="font-semibold text-white bg-indigo-500 px-3 py-2">Ask That Man</div>
            <div className="px-3 py-2">
                <Highlight>
                    {code}
                </Highlight>
            </div>
        </div>
    )
}

export default AskPanel
