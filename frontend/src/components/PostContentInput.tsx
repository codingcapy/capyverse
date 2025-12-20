import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { FaBold } from "react-icons/fa6";
import { FaItalic } from "react-icons/fa6";
import { FaUnderline } from "react-icons/fa6";
import { FaStrikethrough } from "react-icons/fa6";
import { FaList } from "react-icons/fa6";
import { FaListOl } from "react-icons/fa6";
import { FaLink } from "react-icons/fa6";

export function PostContentInput(props: {
  content: string;
  onChange: (value: string) => void;
}) {
  const content = props.content;
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      BulletList,
      OrderedList,
      ListItem,
      Link.configure({ openOnClick: true }),
      Placeholder.configure({
        placeholder: "Content (optional)",
        showOnlyWhenEditable: false,
        showOnlyCurrent: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      props.onChange(editor.getHTML());
    },
  });

  function handleLink() {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  }

  return (
    <div className="border border-[#c4c4c4] rounded-xl my-2">
      <div className="p-2 flex gap-2 text-white">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-4 rounded-full hover:bg-[#383838] ${editor.isActive("bold") ? "bg-[#383838]" : ""} cursor-pointer`}
        >
          <FaBold size={12} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-4 rounded-full hover:bg-[#383838] ${editor.isActive("italic") ? "bg-[#383838]" : ""} cursor-pointer`}
        >
          <FaItalic size={12} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-4 rounded-full hover:bg-[#383838] ${editor.isActive("underline") ? "bg-[#383838]" : ""} cursor-pointer`}
        >
          <FaUnderline size={12} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-4 rounded-full hover:bg-[#383838] ${editor.isActive("strike") ? "bg-[#383838]" : ""} cursor-pointer`}
        >
          <FaStrikethrough size={12} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-4 rounded-full hover:bg-[#383838] ${editor.isActive("bulletList") ? "bg-[#383838]" : ""} cursor-pointer`}
        >
          <FaList size={12} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-4 rounded-full hover:bg-[#383838] ${editor.isActive("orderedList") ? "bg-[#383838]" : ""} cursor-pointer`}
        >
          <FaListOl size={12} />
        </button>
        <button
          type="button"
          onClick={handleLink}
          className={`px-4 rounded-full hover:bg-[#383838] ${editor.isActive("link") ? "bg-[#383838]" : ""} cursor-pointer`}
        >
          <FaLink size={12} />
        </button>
      </div>
      <div className="h-[200px] px-5 outline-none">
        <EditorContent
          editor={editor}
          className="content-input custom-editor outline-none h-[200px]"
          placeholder="Content (optional)"
        />
      </div>
    </div>
  );
}
