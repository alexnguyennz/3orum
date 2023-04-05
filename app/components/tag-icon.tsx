import { IconMessage2, IconTool, IconQuote } from "@tabler/icons-react";

export default function TagIcon({ name }: { name: string }) {
  switch (name) {
    case "ti-message-2":
      return <IconMessage2 className="h-5 w-5" />;
    case "ti-tool":
      return <IconTool className="h-5 w-5" />;
    case "ti-quote":
      return <IconQuote className="h-5 w-5" />;
    default:
      return <IconMessage2 className="h-5 w-5" />;
  }
}
