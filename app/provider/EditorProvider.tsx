import {
  createContext,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

interface ContextType {
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  content: string;
  setContent: Dispatch<SetStateAction<string>>;
}

export const EditorContext = createContext<ContextType>({
  title: "",
  setTitle: () => "",
  content: "",
  setContent: () => "",
});

export default function EditorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <EditorContext.Provider value={{ title, setTitle, content, setContent }}>
      {children}
    </EditorContext.Provider>
  );
}
