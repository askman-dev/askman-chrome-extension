import { useRef, useState, useEffect } from 'react';
import { useDebounceFn } from 'ahooks'
import AskButton from '@src/components/ask-button';
import AskPanel from '@root/src/components/ask-panel';

const ASK_BUTTON_OFFSET_X = 6; // 按钮距离左侧的偏移量

export default function App() {
  const [askButtonVisible, setAskButtonVisible] = useState<boolean>(false)
  const [askPanelVisible, setAskPanelVisible] = useState<boolean>(false)
  const targetDom = useRef<HTMLElement>(null)
  const [currentCodeSnippnet, setCurrentCodeSnippnet] = useState<string>('')
  const [parentRect, setParentRect] = useState<DOMRect>()
  const { run: handleMouseOver } = useDebounceFn((e: MouseEvent) => {
    const domEl: HTMLElement = (e.target as  HTMLElement).closest('pre')

    if (domEl?.tagName === 'PRE' || domEl?.contentEditable === 'true') {
      targetDom.current = domEl

      // calculate position
      const rect = domEl.getBoundingClientRect()
      setParentRect(rect)
      setAskButtonVisible(true)
    }

    return false
  }, {
    leading: true,
    wait: 50
  })

  const { run: hideAskButton } = useDebounceFn(() => {
    setAskButtonVisible(false)
  }, {
    leading: true,
    wait: 50
  })

  useEffect(() => {
    document.body.addEventListener('mouseover', handleMouseOver)
    window.addEventListener('scroll', hideAskButton)

    return () => {
      document.body.removeEventListener('mouseover', handleMouseOver)
      window.removeEventListener('scroll', hideAskButton)
    }
  }, []);

  const handleAsk = () => {
    console.log("🚀 ~ handleAsk ~ targetDom.current:", targetDom.current)

    if (targetDom.current) {
      // get text
      const text = targetDom.current.textContent
      setCurrentCodeSnippnet(text)
      setAskPanelVisible(true)
    }
  }

  if (!targetDom.current) return null

  return (
    <>
      <AskPanel
        visible={askPanelVisible}
        code={currentCodeSnippnet}
        style={{
          left: parentRect.left + parentRect.width + ASK_BUTTON_OFFSET_X,
          top: parentRect.top,
        }}
      />
      <AskButton
        visible={askButtonVisible}
        style={{
          left: parentRect.left + parentRect.width + ASK_BUTTON_OFFSET_X,
          top: parentRect.top,
        }}
        onClick={handleAsk}
      />
    </>
  );
}
