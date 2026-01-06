
import React, { useEffect, useRef, useState } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Quote, Heading1, Heading2, Minus } from 'lucide-react';

interface RichEditorProps {
  initialContent: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichEditor: React.FC<RichEditorProps> = ({ initialContent, onChange, placeholder, className = '' }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(!initialContent || initialContent === '<p></p>' || initialContent === '<br>');

  useEffect(() => {
    if (editorRef.current) {
      if (initialContent !== editorRef.current.innerHTML) {
        editorRef.current.innerHTML = initialContent;
        checkEmpty();
      }
    }
  }, [initialContent]);

  const checkEmpty = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText.trim();
      setIsEmpty(text === '');
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      checkEmpty();
      onChange(html);
    }
  };

  const exec = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) editorRef.current.focus();
    handleInput();
  };

  const ToolbarButton = ({ command, icon: Icon, arg }: any) => (
    <button
      type="button"
      onMouseDown={(e) => { 
        e.preventDefault(); 
        exec(command, arg); 
      }}
      className="p-2 text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
    >
      <Icon size={18} strokeWidth={2.5} />
    </button>
  );

  return (
    <div className={`flex flex-col relative ${className}`}>
      
      {/* Floating Toolbar */}
      <div className="sticky top-0 z-20 py-2 mb-6">
        <div className="flex items-center gap-1 p-1 bg-white/90 dark:bg-black/90 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm w-fit">
          <ToolbarButton command="formatBlock" arg="h2" icon={Heading1} />
          <ToolbarButton command="formatBlock" arg="h3" icon={Heading2} />
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-800 mx-1" />
          <ToolbarButton command="bold" icon={Bold} />
          <ToolbarButton command="italic" icon={Italic} />
          <ToolbarButton command="underline" icon={Underline} />
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-800 mx-1" />
          <ToolbarButton command="insertUnorderedList" icon={List} />
          <ToolbarButton command="insertOrderedList" icon={ListOrdered} />
          <ToolbarButton command="formatBlock" arg="blockquote" icon={Quote} />
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-800 mx-1" />
          <ToolbarButton command="insertHorizontalRule" icon={Minus} />
        </div>
      </div>

      {/* Editor Area */}
      <div className="relative flex-1 cursor-text">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="w-full h-full min-h-[50vh] outline-none prose prose-lg dark:prose-invert max-w-none font-serif leading-loose text-black dark:text-white focus:outline-none"
          style={{ caretColor: 'var(--color-primary-600)' }}
          onBlur={handleInput}
        />
        
        {/* Placeholder */}
        {isEmpty && (
           <div 
             className="absolute top-0 left-0 text-gray-300 dark:text-gray-600 pointer-events-none font-serif text-2xl italic tracking-tight select-none"
             onClick={() => editorRef.current?.focus()}
           >
             {placeholder || "Start writing..."}
           </div>
        )}
      </div>
    </div>
  );
};
