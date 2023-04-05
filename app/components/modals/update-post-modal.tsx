import { useState, useContext } from "react";
import { Link, useLoaderData, useRevalidator } from "@remix-run/react";
import { Button, Menu, Modal, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import {
  callAddPostToDiscussion,
  callUpdatePost,
  callDeletePost,
} from "~/utils/polybase";

import { EditorContext } from "~/provider/EditorProvider";
import TextEditor from "~/components/text-editor";

export default function UpdatePostModal() {
  const revalidator = useRevalidator();

  const [opened, { open, close }] = useDisclosure(false);

  const { content, setContent } = useContext(EditorContext);
  const [selectedPost, setSelectedPost] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function updatePost(replyId: string) {
    setLoading(true);

    await callUpdatePost(replyId, content);

    // reset UI
    setLoading(false);
    close(); // close drawer

    revalidator.revalidate();
  }

  <Modal
    opened={opened}
    onClose={close}
    title={<></>}
    overlayProps={{ opacity: 0.05, blur: 0 }}
    size="auto"
    transitionProps={{ transition: "slide-up" }}
    centered
  >
    <Stack className="mx-auto max-w-lg">
      <TextEditor />
      <Button
        onClick={() => updatePost(selectedPost)}
        loading={loading}
        color="dark.4"
      >
        Update
      </Button>
    </Stack>
  </Modal>;
}
