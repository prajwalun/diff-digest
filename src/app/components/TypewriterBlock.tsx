"use client";

import { useTypewriter, Cursor } from "react-simple-typewriter";
import { useEffect, useState } from "react";

interface Props {
  text: string;
}

export default function TypewriterBlock({ text }: Props) {
  const [typedText, setTypedText] = useState("");
  const [isDone, setIsDone] = useState(false);

  const [typewriterText] = useTypewriter({
    words: [text],
    loop: 1,
    typeSpeed: 15,
    deleteSpeed: 0,
    delaySpeed: 1000,
    onLoopDone: () => setIsDone(true),
  });

  useEffect(() => {
    setTypedText(typewriterText);
  }, [typewriterText]);

  return (
    <span>
      {typedText}
      {!isDone && <Cursor cursorStyle="|" />}
    </span>
  );
}
