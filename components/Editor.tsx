"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { python } from "@codemirror/lang-python";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), { ssr: false });

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function Editor({ value, onChange }: Props) {
  useEffect(() => {
    if (!value) onChange(`# Write your solution here (Python)\n# e.g. def solve(input):\n#     pass\n`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="font-semibold mb-2">Editor</div>
      <div className="flex-1 border rounded overflow-hidden">
        <CodeMirror
          value={value}
          height="70vh"
          extensions={[python()]}
          onChange={(v) => onChange(v)}
        />
      </div>
    </div>
  );
}
