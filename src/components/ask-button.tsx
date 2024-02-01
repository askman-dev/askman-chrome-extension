import classNames from "classnames"

interface IAskButtonProps extends React.DOMAttributes<HTMLButtonElement>, React.HTMLAttributes<HTMLButtonElement> {
    visible: boolean
}

function AskButton(props: IAskButtonProps) {
    const { visible, ...rest } = props

    return (
        <button className={
            classNames(
                'ask-button fixed py-1 px-2 bg-indigo-500 text-white text-sm font-semibold rounded shadow focus:outline-none',
                `${visible ? 'visible' : 'invisible'}`,
            )}
            {...rest}
        >
            Ask
        </button>
    )
}

export default AskButton
