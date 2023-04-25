import { useState, useContext } from "react";
import { Link, useLoaderData, useRevalidator } from "@remix-run/react";
import { json, redirect, type LoaderArgs } from "@remix-run/node";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

import { type CollectionRecordResponse } from "@polybase/client";
import { polybase } from "~/root";

import { Button, Menu, Modal, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCaretDown, IconTrash } from "@tabler/icons-react";

import { EditorContext } from "~/provider/EditorProvider";
import Post from "~/components/post";
import TextEditor from "~/components/text-editor";
import TagIcon from "~/components/tag-icon";

import {
  callAddPostToDiscussion,
  callUpdatePost,
  callDeletePost,
} from "~/utils/polybase";

export async function loader({ params }: LoaderArgs) {
  const { id } = params;

  try {
    const { data: discussion } = await polybase
      .collection("Post")
      .record(id!)
      .get();

    const { data: posts } = await polybase
      .collection("Post")
      .where("discussion", "==", polybase.collection("Post").record(id!))
      .sort("timestamp", "asc")
      .get();

    // workaround - get all users to display avatar beside each post
    const { data: users } = await polybase.collection("User").get();

    return json({ id, discussion, posts, users });
  } catch {
    return redirect("/");
  }
}

export default function SinglePost() {
  const { id, discussion, posts, users } = useLoaderData<typeof loader>();

  const revalidator = useRevalidator();

  const { openConnectModal } = useConnectModal();
  const { address, isConnected } = useAccount();

  const postDrawer = useDisclosure(false);
  const addPostDrawer = useDisclosure(false);

  const [selectedPost, setSelectedPost] = useState("");
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

  async function addPostToDiscussion() {
    setLoading(true);

    await callAddPostToDiscussion(
      id!,
      address!,
      content,
      discussion.title,
      discussion.tag
    );

    setLoading(false);

    addPostDrawer[1].close(); // close drawer
    revalidator.revalidate();
  }

  const { content, setContent } = useContext(EditorContext);

  return (
    <>
      {/* Update Post */}
      <Modal
        opened={postDrawer[0]}
        onClose={postDrawer[1].close}
        title={<></>}
        classNames={{ inner: "top-auto" }} /* place modal at bottom of screen */
        yOffset={0}
        overlayProps={{ opacity: 0, blur: 0 }}
        size="auto"
        transitionProps={{ transition: "slide-up" }}
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

      {/* Add Post */}
      <Modal
        opened={addPostDrawer[0]}
        onClose={addPostDrawer[1].close}
        title={<></>}
        classNames={{ inner: "top-auto" }} /* place modal at bottom of screen */
        yOffset={0}
        overlayProps={{ opacity: 0, blur: 0 }}
        size="auto"
        transitionProps={{ transition: "slide-up" }}
      >
        <Stack className="mx-auto max-w-lg">
          <TextEditor />
          <Button
            onClick={addPostToDiscussion}
            loading={loading}
            color="dark.4"
          >
            Post Reply
          </Button>
        </Stack>
      </Modal>

      <div className="my-6 space-y-10">
        <div className="mx-auto h-48 max-w-6xl rounded-xl bg-white px-6 shadow-lg">
          <div className="m-auto max-w-6xl gap-10 py-16 text-center">
            <div className="inline-block text-center capitalize">
              <Link
                to={`/t/${discussion.tag.id}`}
                className="flex items-center justify-center gap-2 rounded bg-slate-800 p-1 text-xs text-slate-200"
              >
                <TagIcon name={discussion.tag.id} />
                {discussion.tag.id}
              </Link>
            </div>
            <Text size="xl" align="center" weight="semibold">
              {discussion!?.title}
            </Text>
          </div>
        </div>
      </div>

      {/* posts and replies */}
      <main className="mx-auto my-10 max-w-6xl">
        <div className="flex flex-col gap-10 md:flex-row">
          <div className="grow space-y-5">
            <Post
              post={discussion}
              open={postDrawer[1].open}
              setSelectedPost={setSelectedPost}
              deletePost={deletePost}
              users={users as CollectionRecordResponse<any>[]}
            />

            {posts.map(({ data: post }) => (
              <Post
                post={post}
                open={postDrawer[1].open}
                setSelectedPost={setSelectedPost}
                deletePost={deletePost}
                key={post.id}
                users={users as CollectionRecordResponse<any>[]}
              />
            ))}
          </div>

          <Button.Group>
            <Button
              onClick={
                isConnected
                  ? () => {
                      setContent("");
                      addPostDrawer[1].open();
                    }
                  : openConnectModal
              }
              color="dark.4"
            >
              Reply
            </Button>
            <Menu shadow="md" width={200} withArrow>
              <Menu.Target>
                <Button
                  p={0}
                  pr={8}
                  rightIcon={<IconCaretDown className="h-5 w-5" />}
                  color="dark.4"
                ></Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  onClick={
                    isConnected ? () => deletePost(id!) : openConnectModal
                  }
                  icon={<IconTrash className="h-5 w-5" />}
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Button.Group>
        </div>
      </main>
    </>
  );
}
