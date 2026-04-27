"use client";

import { useEffect, useRef } from "react";
import "quill/dist/quill.snow.css";

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Enter note...",
  minHeight = "250px",
}) {
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const loadQuill = async () => {
      if (!editorRef.current || quillRef.current) return;

      const QuillModule = await import("quill");
      const Quill = QuillModule.default;

      if (!mounted || !editorRef.current) return;

      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder,
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["blockquote", "code-block"],
            ["link"],
            ["clean"],
          ],
        },
      });

      if (value) {
        quillRef.current.root.innerHTML = value;
      }

      quillRef.current.on("text-change", () => {
        const html = quillRef.current.root.innerHTML;
        const text = quillRef.current.getText().trim();
        onChange?.(text ? html : "");
      });
    };

    loadQuill();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <div
        ref={editorRef}
        style={{
          minHeight,
        }}
      />
    </div>
  );
}