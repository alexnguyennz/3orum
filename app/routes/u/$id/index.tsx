import { useState, useContext } from "react";
import { useRouteLoaderData, useRevalidator } from "@remix-run/react";

import { Button, Modal, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { EditorContext } from "~/provider/EditorProvider";

/* Components */
import TextEditor from "~/components/text-editor";
import Post from "~/components/post";

/* Utilities */
import { callUpdatePost, callDeletePost } from "~/utils/polybase";

import type { Post as PostType } from "~/types";

export default function UserPosts() {
  const { posts, users }: any = useRouteLoaderData("routes/u"); // https://github.com/remix-run/remix/pull/5157

  const revalidator = useRevalidator();

  const { content } = useContext(EditorContext);

  const postDrawer = useDisclosure(false);

  const [selectedPost, setSelectedPost] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function updatePost(replyId: string) {
    setLoading(true);

    await callUpdatePost(replyId, content);

    // reset UI
    setLoading(false);
    postDrawer[1].close(); // close drawer

    revalidator.revalidate();
  }

  async function deletePost(id: string) {
    await callDeletePost(id);

    revalidator.revalidate();
  }

  return (
    <>
      <Modal
        opened={postDrawer[0]}
        onClose={postDrawer[1].close}
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
      </Modal>

      {posts.length ? (
        posts.map(({ data: post }: { data: PostType }) => (
          <Post
            post={post}
            showLink={true}
            open={postDrawer[1].open}
            setSelectedPost={setSelectedPost}
            deletePost={deletePost}
            key={post.id}
            users={users}
          />
        ))
      ) : (
        <span>It looks like there are no posts here.</span>
      )}
    </>
  );
}
